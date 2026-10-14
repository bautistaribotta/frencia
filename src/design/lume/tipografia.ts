/* ============================================================
   Frencia · Lume · Tipografia
   Una familia, Instrument Sans, en tres anchos (normal, semicondensada y
   condensada) mas DM Mono solo para sellos. En Expo Go el eje de ancho no
   se puede mover: se cargan instancias estaticas (assets/fonts/lume/), y en
   RN cada peso es una familia, asi que no se combina con fontWeight.
   ============================================================ */

import { useFonts } from 'expo-font';
import type { TextStyle } from 'react-native';

export const lumeFuente = {
  regular: 'InstrumentSans-Regular',
  medium: 'InstrumentSans-Medium',
  semibold: 'InstrumentSans-SemiBold',
  bold: 'InstrumentSans-Bold',
  semiMedium: 'InstrumentSansSemiCondensed-Medium',
  semiSemibold: 'InstrumentSansSemiCondensed-SemiBold',
  condMedium: 'InstrumentSansCondensed-Medium',
  condSemibold: 'InstrumentSansCondensed-SemiBold',
  condBold: 'InstrumentSansCondensed-Bold',
  monoRegular: 'DMMono-Regular',
  monoMedium: 'DMMono-Medium',
} as const;

/** Carga las fuentes de Lume. Devuelve [cargadas, error]. */
export function useLumeFonts() {
  return useFonts({
    [lumeFuente.regular]: require('../../../assets/fonts/lume/InstrumentSans-Regular.ttf'),
    [lumeFuente.medium]: require('../../../assets/fonts/lume/InstrumentSans-Medium.ttf'),
    [lumeFuente.semibold]: require('../../../assets/fonts/lume/InstrumentSans-SemiBold.ttf'),
    [lumeFuente.bold]: require('../../../assets/fonts/lume/InstrumentSans-Bold.ttf'),
    [lumeFuente.semiMedium]: require('../../../assets/fonts/lume/InstrumentSansSemiCondensed-Medium.ttf'),
    [lumeFuente.semiSemibold]: require('../../../assets/fonts/lume/InstrumentSansSemiCondensed-SemiBold.ttf'),
    [lumeFuente.condMedium]: require('../../../assets/fonts/lume/InstrumentSansCondensed-Medium.ttf'),
    [lumeFuente.condSemibold]: require('../../../assets/fonts/lume/InstrumentSansCondensed-SemiBold.ttf'),
    [lumeFuente.condBold]: require('../../../assets/fonts/lume/InstrumentSansCondensed-Bold.ttf'),
    [lumeFuente.monoRegular]: require('../../../assets/fonts/lume/DMMono-Regular.ttf'),
    [lumeFuente.monoMedium]: require('../../../assets/fonts/lume/DMMono-Medium.ttf'),
  });
}

/**
 * Roles de texto. lineHeight absoluto en px y letterSpacing en px (RN no
 * acepta em). Las cifras van siempre tabulares: los relojes y las columnas
 * no bailan.
 */
export const lumeTexto = {
  // El numero que es el mensaje: peso, reloj, marca.
  hero: { fontFamily: lumeFuente.condMedium, fontSize: 72, lineHeight: 76, letterSpacing: -2.5, fontVariant: ['tabular-nums'] },
  // La pregunta de cada paso de los wizards y el cierre de la sesion.
  display: { fontFamily: lumeFuente.medium, fontSize: 34, lineHeight: 38, letterSpacing: -0.95 },
  title: { fontFamily: lumeFuente.semibold, fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },
  subtitle: { fontFamily: lumeFuente.semibold, fontSize: 19, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: lumeFuente.regular, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: lumeFuente.regular, fontSize: 14, lineHeight: 20 },
  data: { fontFamily: lumeFuente.medium, fontSize: 15, lineHeight: 20, fontVariant: ['tabular-nums'] },
  // Rotulos de datos: mayusculas con tracking ancho.
  label: { fontFamily: lumeFuente.semiSemibold, fontSize: 11, lineHeight: 15, letterSpacing: 0.9, textTransform: 'uppercase' },
  // Sellos tecnicos: fechas, horas, codigos del ticket. Unico uso de la mono.
  meta: { fontFamily: lumeFuente.monoRegular, fontSize: 11, lineHeight: 14, letterSpacing: 0.45, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type LumeRolTexto = keyof typeof lumeTexto;
