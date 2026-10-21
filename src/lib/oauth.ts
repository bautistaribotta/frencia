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

/**
 * Lee los parametros de la URL de retorno. Supabase manda el resultado en la
 * query (`?code=...`), pero un error del proveedor o de Auth puede venir en la
 * query o en el fragmento (`#error=...&error_description=...`): se leen los
 * dos, y el fragmento pisa a la query.
 */
function parseUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const [sinFragmento, fragmento] = url.split('#', 2);
  const query = sinFragmento.split('?', 2)[1];
  for (const parte of [query, fragmento]) {
    if (!parte) continue;
    for (const pair of parte.split('&')) {
      const igual = pair.indexOf('=');
      const k = igual === -1 ? pair : pair.slice(0, igual);
      const v = igual === -1 ? '' : pair.slice(igual + 1);
      if (!k) continue;
      try {
        params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
      } catch {
        // Un parametro mal codificado no tiene que tirar abajo todo el login.
      }
    }
  }
  return params;
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
  if (!data?.url) return { error: new Error('No se pudo iniciar sesión con este proveedor.') };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return { error: new Error('Inicio de sesión cancelado.') };
  }

  const params = parseUrl(result.url);
  if (params.error) {
    // El usuario cancelo en la pantalla del proveedor, o Auth rechazo el login.
    const cancelado = params.error === 'access_denied';
    return {
      error: new Error(cancelado ? 'Inicio de sesión cancelado.' : 'No se pudo iniciar sesión con este proveedor.'),
    };
  }

  const code = params.code;
  if (!code) return { error: new Error('Respuesta de OAuth inválida.') };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  return { error: exchangeError ?? null };
}
