/* ============================================================
   Frencia · Lume · Tema activo
   Lume toma el modo (oscuro o claro) del FrenciaThemeProvider que ya
   tiene la app, y le suma la accesibilidad del sistema:
   - Reducir transparencia: el vidrio pasa a opaco, sin blur, y las luces
     del Fondo bajan a menos de la mitad.
   - Reducir movimiento: las luces del onboarding quedan quietas.
   Uso: const { t, modo, sombras, reducida } = useLume();
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

export interface LumeContexto {
  modo: LumeModo;
  t: LumePalette;
  sombras: (typeof lumeSombras)[LumeModo];
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
