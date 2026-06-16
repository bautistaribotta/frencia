// OAuth con Supabase via navegador (compatible con Expo Go).
// Flujo PKCE: pedimos la URL del proveedor, la abrimos en el navegador
// del sistema, y al volver canjeamos el "code" por una sesion.
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from './supabase';

// Cierra la pestana/popup de auth si quedo abierta al volver a la app.
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

// URL a la que el navegador redirige de vuelta a la app.
// Expo Go -> exp://... ; build nativo -> frencia://oauth-callback
const redirectTo = makeRedirectUri({ path: 'oauth-callback' });

/** Extrae el "code" del PKCE de la URL de retorno. */
function codeFromUrl(url: string): string | null {
  const { queryParams } = parseUrl(url);
  return (queryParams.code as string) ?? null;
}

function parseUrl(url: string) {
  const queryParams: Record<string, string> = {};
  const q = url.split('?')[1];
  if (q) {
    for (const pair of q.split('&')) {
      const [k, v] = pair.split('=');
      if (k) queryParams[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
    }
  }
  return { queryParams };
}

/**
 * Inicia sesion con un proveedor OAuth.
 * Devuelve { error } — si es null, la sesion quedo establecida.
 */
export async function signInWithProvider(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true, // abrimos el navegador nosotros
    },
  });

  if (error) return { error };
  if (!data?.url) return { error: new Error('No se pudo iniciar OAuth.') };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return { error: new Error('Inicio de sesion cancelado.') };
  }

  const code = codeFromUrl(result.url);
  if (!code) return { error: new Error('Respuesta de OAuth invalida.') };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  return { error: exchangeError ?? null };
}
