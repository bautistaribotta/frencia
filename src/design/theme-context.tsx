/* ============================================================
   Frencia · Theme context
   Provee la paleta activa (oscuro/claro) en runtime. La preferencia
   tiene tres valores: seguir al sistema (default), oscuro o claro.
   Se persiste en AsyncStorage (aplica al instante al abrir) y en
   Supabase (profiles.tema) para que viaje entre dispositivos.

   Sin sesion (login, registro) la preferencia no aplica: la app
   sigue siempre al sistema.

   Uso en componentes:
     const colors = useColors();              // paleta activa
     const styles = useThemedStyles(makeStyles); // estilos memoizados
     const { mode, preference, setPreference } = useTheme();
   ============================================================ */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { themes, type Palette, type ThemeMode } from './tokens/colors';

const STORAGE_KEY = 'frencia.theme';

/** Lo que elige el usuario. `system` sigue al tema del telefono. */
export type ThemePreference = 'system' | ThemeMode;

interface ThemeContextValue {
  /** Modo efectivo (lo que se pinta). */
  mode: ThemeMode;
  /** Preferencia elegida por el usuario. */
  preference: ThemePreference;
  colors: Palette;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Traduce el valor guardado en Supabase (es) a la preferencia interna (en). */
function temaToPreference(tema?: string | null): ThemePreference | null {
  if (tema === 'claro') return 'light';
  if (tema === 'oscuro') return 'dark';
  if (tema === 'sistema') return 'system';
  return null;
}

const PREFERENCE_TO_TEMA: Record<ThemePreference, string> = {
  system: 'sistema',
  dark: 'oscuro',
  light: 'claro',
};

function isPreference(v: unknown): v is ThemePreference {
  return v === 'system' || v === 'dark' || v === 'light';
}

export function FrenciaThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  // Optimista: asumimos sesion hasta que Supabase diga lo contrario, asi la
  // preferencia guardada aplica desde el primer frame sin parpadeo.
  const [signedIn, setSignedIn] = useState(true);
  const systemScheme = useColorScheme();
  const systemMode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';

  // Lee el tema guardado en Supabase para el usuario y lo aplica.
  const syncFromSupabase = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('tema')
      .eq('id', user.id)
      .maybeSingle();
    const remoto = temaToPreference(data?.tema);
    if (!remoto) return;
    setPreferenceState(remoto);
    AsyncStorage.setItem(STORAGE_KEY, remoto).catch(() => {});
  }, []);

  // Carga inicial: primero AsyncStorage (sincroniza al instante), luego
  // Supabase como fuente de verdad si ya hay sesion.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelado && isPreference(saved)) setPreferenceState(saved);
      } catch {
        // ignoramos: cae al default (sistema)
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelado) return;
      setSignedIn(!!session);
      if (session) await syncFromSupabase();
    })();

    // Al iniciar sesion traemos el tema de la cuenta (login en caliente); al
    // cerrarla volvemos al sistema para que el login no herede la preferencia.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setSignedIn(true);
        syncFromSupabase();
      } else if (event === 'SIGNED_OUT') {
        setSignedIn(false);
        setPreferenceState('system');
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
      }
    });

    return () => {
      cancelado = true;
      sub.subscription.unsubscribe();
    };
  }, [syncFromSupabase]);

  // Fija la preferencia: estado + AsyncStorage + Supabase (optimista, sin bloquear).
  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ tema: PREFERENCE_TO_TEMA[next] })
        .eq('id', user.id);
    })();
  }, []);

  const mode: ThemeMode = signedIn && preference !== 'system' ? preference : systemMode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, preference, colors: themes[mode], setPreference }),
    [mode, preference, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Acceso al tema completo. Fuera del provider cae al tema oscuro. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Fallback seguro (p. ej. prerender web o componentes aislados).
  return {
    mode: 'dark',
    preference: 'system',
    colors: themes.dark,
    setPreference: () => {},
  };
}

/** Paleta activa. Reemplaza al `colors` estatico dentro de componentes. */
export function useColors(): Palette {
  return useTheme().colors;
}

/** Memoiza una fabrica de estilos contra la paleta activa.
 *  const makeStyles = (colors: Palette) => StyleSheet.create({ ... });
 *  const styles = useThemedStyles(makeStyles);
 *
 *  La fabrica tiene que ser estable: definila a nivel de modulo, nunca en el
 *  cuerpo del componente. Una definida inline se recrea en cada render y, como
 *  no esta en las dependencias, los estilos quedarian congelados con la primera
 *  version. Se omite a proposito: incluirla haria que cada render de un
 *  componente descuidado rehiciera todo el StyleSheet, que es justo lo que este
 *  hook evita. */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const colors = useColors();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ver nota de arriba
  return useMemo(() => factory(colors), [colors]);
}
