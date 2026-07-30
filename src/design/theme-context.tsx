/* ============================================================
   Frencia · Theme context
   Provee la paleta activa (oscuro/claro) en runtime. El modo se
   persiste en AsyncStorage (aplica al instante al abrir) y en
   Supabase (profiles.tema) para que viaje entre dispositivos.

   Uso en componentes:
     const colors = useColors();              // paleta activa
     const styles = useThemedStyles(makeStyles); // estilos memoizados
     const { mode, setMode, toggle } = useTheme();
   ============================================================ */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { themes, type Palette, type ThemeMode } from './tokens/colors';

const STORAGE_KEY = 'frencia.theme';

interface ThemeContextValue {
  mode: ThemeMode;
  colors: Palette;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Traduce el valor guardado en Supabase (es) al modo interno (en). */
function temaToMode(tema?: string | null): ThemeMode | null {
  if (tema === 'claro') return 'light';
  if (tema === 'oscuro') return 'dark';
  return null;
}

export function FrenciaThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

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
    const remoto = temaToMode(data?.tema);
    if (!remoto) return;
    setModeState(remoto);
    AsyncStorage.setItem(STORAGE_KEY, remoto).catch(() => {});
  }, []);

  // Carga inicial: primero AsyncStorage (sincroniza al instante), luego
  // Supabase como fuente de verdad si ya hay sesion.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelado && (saved === 'dark' || saved === 'light')) {
          setModeState(saved);
        }
      } catch {
        // ignoramos: cae al default oscuro
      }
      if (!cancelado) await syncFromSupabase();
    })();

    // Al iniciar sesion, traemos el tema de la cuenta (login en caliente).
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncFromSupabase();
    });

    return () => {
      cancelado = true;
      sub.subscription.unsubscribe();
    };
  }, [syncFromSupabase]);

  // Fija el modo: estado + AsyncStorage + Supabase (optimista, sin bloquear).
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ tema: next === 'light' ? 'claro' : 'oscuro' })
        .eq('id', user.id);
    })();
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from('profiles')
          .update({ tema: next === 'light' ? 'claro' : 'oscuro' })
          .eq('id', user.id);
      })();
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: themes[mode], setMode, toggle }),
    [mode, setMode, toggle],
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
    colors: themes.dark,
    setMode: () => {},
    toggle: () => {},
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
