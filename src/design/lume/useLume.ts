/* ============================================================
   Frencia · Lume · Tema activo
   Lume toma el modo (oscuro o claro) del FrenciaThemeProvider que ya
   tiene la app, y le suma la accesibilidad del sistema:
   - Reducir transparencia: el vidrio pasa a opaco, sin blur, y las luces
     del Fondo bajan a menos de la mitad.
   - Reducir movimiento: las luces del onboarding quedan quietas.
   Uso: const { t, modo, sombras, reducida } = useLume();
   Estilos: const styles = useLumeStyles(makeStyles);
   ============================================================ */

import { useMemo, useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useTheme } from '../theme-context';
import { lumeSombras, lumeTemas, sinTransparencia, type LumeModo, type LumePalette } from './tokens';

/* Reducir transparencia es del sistema, no de cada componente: un solo
   listener para toda la app. Solo existe en iOS. */
let transparenciaReducida = false;
const oyentes = new Set<() => void>();
let suscripto = false;

function avisar(valor: boolean) {
  transparenciaReducida = valor;
  oyentes.forEach((o) => o());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  if (!suscripto && Platform.OS === 'ios') {
    suscripto = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then(avisar).catch(() => {});
    AccessibilityInfo.addEventListener('reduceTransparencyChanged', avisar);
  }
  return () => {
    oyentes.delete(oyente);
  };
}

const leer = () => transparenciaReducida;

export function useReducirTransparencia(): boolean {
  return useSyncExternalStore(suscribir, leer, leer);
}

export type LumeSombras = (typeof lumeSombras)[LumeModo];

export interface LumeContexto {
  modo: LumeModo;
  t: LumePalette;
  sombras: LumeSombras;
  reducida: boolean;
  reducirMovimiento: boolean;
}

export function useLume(): LumeContexto {
  const { mode } = useTheme();
  const reducida = useReducirTransparencia();
  const reducirMovimiento = useReducedMotion();
  return useMemo(() => {
    const base = lumeTemas[mode];
    return {
      modo: mode,
      t: reducida ? sinTransparencia(base) : base,
      sombras: lumeSombras[mode],
      reducida,
      reducirMovimiento,
    };
  }, [mode, reducida, reducirMovimiento]);
}

/** Memoiza una fabrica de estilos contra el tema Lume activo, igual que
 *  useThemedStyles con la paleta anterior. Los colores que dependen solo del
 *  tema van en la fabrica, no en el array de style:
 *    const makeStyles = (t: LumePalette, sombras: LumeSombras) => StyleSheet.create({ ... });
 *    const styles = useLumeStyles(makeStyles);
 *
 *  La fabrica tiene que ser estable (a nivel de modulo), por la misma razon
 *  que en useThemedStyles. */
export function useLumeStyles<T>(factory: (t: LumePalette, sombras: LumeSombras) => T): T {
  const { t, sombras } = useLume();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- ver nota de arriba
  return useMemo(() => factory(t, sombras), [t, sombras]);
}
