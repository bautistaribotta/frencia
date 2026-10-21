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

import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { supabase } from '@/lib/supabase';
import { themes, type Palette, type ThemeMode } from './tokens/colors';
import { shadows, type Shadows } from './tokens/radius';

const STORAGE_KEY = 'frencia.theme';

/** Lo que elige el usuario. `system` sigue al tema del telefono. */
export type ThemePreference = 'system' | ThemeMode;

interface ThemeContextValue {
  /** Modo efectivo (lo que se pinta). */
  mode: ThemeMode;
  /** Preferencia elegida por el usuario. */
  preference: ThemePreference;
  colors: Palette;
  shadows: Shadows;
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
  const { user, initializing } = useSession();
  const { profile, applyTema } = useProfile();
  const [cachedPreference, setCachedPreference] = useState<ThemePreference>('system');
  // Optimista mientras SessionProvider resuelve la sesion inicial, asi la
  // preferencia guardada en AsyncStorage aplica desde el primer frame sin parpadeo.
  const signedIn = initializing || !!user;
  const remoto = temaToPreference(profile?.tema);
  const preference: ThemePreference = signedIn ? (remoto ?? cachedPreference) : 'system';
  const systemScheme = useColorScheme();
  const systemMode: ThemeMode = systemScheme === 'light' ? 'light' : 'dark';

  // Mientras se resuelve la sesion inicial o hay sesion activa, leemos primero
  // de AsyncStorage para aplicar al instante. Cuando SessionProvider confirma
  // que no hay sesion (!initializing && !user), limpiamos AsyncStorage y
  // volvemos al sistema para que el login no herede la preferencia anterior.
  useEffect(() => {
    let cancelado = false;
    if (!signedIn) {
      AsyncStorage.removeItem(STORAGE_KEY)
        .then(() => {
          if (!cancelado) setCachedPreference('system');
        })
        .catch(() => {});
      return () => {
        cancelado = true;
      };
    }
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelado && isPreference(saved)) setCachedPreference(saved);
      } catch {
        // ignoramos: cae al default (sistema)
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [signedIn]);

  // Sincroniza en AsyncStorage la preferencia remota que trae ProfileProvider.
  useEffect(() => {
    if (!remoto) return;
    AsyncStorage.setItem(STORAGE_KEY, remoto).catch(() => {});
  }, [remoto]);

  // Fija la preferencia: estado local + perfil en memoria + AsyncStorage + Supabase.
  const userId = user?.id;
  const setPreference = useCallback(
    (next: ThemePreference) => {
      const nuevoTema = PREFERENCE_TO_TEMA[next];
      setCachedPreference(next);
      applyTema(nuevoTema);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      if (!userId) return;
      void supabase
        .from('profiles')
        .update({ tema: nuevoTema })
        .eq('id', userId);
    },
    [applyTema, userId],
  );

  const mode: ThemeMode = signedIn && preference !== 'system' ? preference : systemMode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, preference, colors: themes[mode], shadows: shadows[mode], setPreference }),
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
    shadows: shadows.dark,
    setPreference: () => {},
  };
}

/** Paleta activa. Reemplaza al `colors` estatico dentro de componentes. */
export function useColors(): Palette {
  return useTheme().colors;
}

/** Sombras del tema activo. Mismas claves en los dos temas. */
export function useShadows(): Shadows {
  return useTheme().shadows;
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
export function useThemedStyles<T>(factory: (colors: Palette, shadows: Shadows) => T): T {
  const { colors, shadows: sombras } = useTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ver nota de arriba
  return useMemo(() => factory(colors, sombras), [colors, sombras]);
}
