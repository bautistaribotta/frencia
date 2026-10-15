/* ============================================================
   Frencia · Lume · Tokens (port de tokens.json del design system
   "Frencia 2.0" en Claude Design).
   Lume: vidrio sobre un fondo de luces, un solo color (el lume, verde
   lima) para la accion y lo en curso, y el esfuerzo en tinta.
   Convive con el sistema anterior (src/design/tokens/*) mientras las
   pantallas se migran de a partes: lo que importa de aca es solo lo que
   ya esta en Lume.
   NOTA: RN no parsea oklch, por eso los valores van en hex/rgba (ver la
   excepcion documentada en AGENTS.md).
   ============================================================ */

export const lumePalette = {
  graphite1000: '#000000',
  graphite950: '#050607',
  graphite900: '#08090a',
  graphite850: '#101113',
  graphite700: '#222327',
  graphite500: '#5a5c58',
  graphite400: '#a5a7a1',
  graphite300: '#b7b8b2',
  graphite100: '#f1f0eb',
  graphite50: '#fbfaf6',
  ivory0: '#ffffff',
  ivory50: '#f8f9f2',
  ivory100: '#eef0e6',
  ivory200: '#e3e6d8',
  ivory400: '#c2c6b1',
  ivory500: '#94988a',
  ivory600: '#5b5e53',
  ivory700: '#42443c',
  ivory800: '#26271f',
  ivory900: '#141511',
  lume300: '#e2f28f',
  lume400: '#d6ec78',
  lume500: '#c9e25f',
  lume600: '#b3cc4a',
  lume800: '#4f6a0a',
  lume900: '#3d5306',
  forest600: '#2f4a1a',
  steel300: '#b4c3f5',
  steel500: '#5d7fd6',
  crimson400: '#f08d84',
  crimson500: '#d2463c',
  crimson600: '#b42b22',
  crimson700: '#a2251d',
} as const;

const p = lumePalette;

/* ------------------------------------------------------------------
   Lume oscuro (grafito, lume puro). El vidrio es ahumado: oscurece la
   luz que tiene detras para que el texto chico sostenga el contraste.
   ------------------------------------------------------------------ */
const oscuro = {
  bgApp: p.graphite900,
  bgAppDeep: p.graphite950,

  // Fondo de luces
  glowA: p.lume500,
  glowB: p.forest600,
  glowC: p.steel500,
  veloTop: 'rgba(8, 9, 10, 0.55)',
  veloBottom: 'rgba(8, 9, 10, 0.70)',

  // Vidrio
  surfaceCard: 'rgba(20, 22, 18, 0.42)',
  surfaceCardElevated: 'rgba(38, 40, 36, 0.55)',
  surfaceRaised: 'rgba(16, 17, 19, 0.82)',
  surfaceChip: 'rgba(255, 255, 255, 0.06)',
  surfaceCardOpaco: '#17191a',
  surfaceCardElevatedOpaco: '#222426',
  surfaceRaisedOpaco: '#121315',
  surfaceInset: 'rgba(0, 0, 0, 0.28)',
  // El toast: bg-app al 92 %.
  surfaceToast: 'rgba(8, 9, 10, 0.92)',
  glassLine: 'rgba(255, 255, 255, 0.13)',
  glassHighlight: 'rgba(255, 255, 255, 0.12)',
  surfaceSignalSoft: 'rgba(201, 226, 95, 0.10)',
  surfaceSignalLine: 'rgba(201, 226, 95, 0.60)',
  surfaceIntensitySoft: 'rgba(241, 240, 235, 0.06)',
  surfaceIntensityLine: 'rgba(241, 240, 235, 0.32)',

  // Texto
  textPrimary: p.graphite100,
  textSecondary: p.graphite300,
  textTertiary: p.graphite400,
  textDisabled: p.graphite500,
  textOnAccent: '#0b0c0a',
  textOnSignal: '#0b0c0a',
  textOnIntensity: p.graphite900,
  // El nombre FRENCIA. del acceso: blanco puro en oscuro, negro puro en claro.
  marca: '#ffffff',

  // Bordes
  borderSubtle: 'rgba(255, 255, 255, 0.10)',
  borderDefault: 'rgba(255, 255, 255, 0.18)',
  borderStrong: 'rgba(255, 255, 255, 0.42)',
  divider: 'rgba(255, 255, 255, 0.08)',
  scrim: 'rgba(3, 4, 5, 0.62)',
  focusRing: p.lume500,

  // Accion, en curso, esfuerzo, peligro
  accent: p.lume500,
  accentHover: p.lume400,
  accentPress: p.lume600,
  signal: p.lume500,
  signalPress: p.lume600,
  signalText: p.lume500,
  intensity: p.graphite100,
  intensityText: p.graphite100,
  danger: p.crimson500,
  dangerText: p.crimson400,

  // Datos
  dataTrack: 'rgba(255, 255, 255, 0.14)',
  dataTick: 'rgba(255, 255, 255, 0.28)',
};

/* ------------------------------------------------------------------
   Lume claro (marfil, tinta y oliva). El lume puro no sostiene contraste
   sobre marfil: la accion pasa a tinta y lo en curso a oliva.
   ------------------------------------------------------------------ */
const claro: LumePalette = {
  bgApp: p.ivory100,
  bgAppDeep: p.ivory200,

  glowA: p.lume400,
  glowB: p.ivory0,
  glowC: p.steel300,
  veloTop: 'rgba(238, 240, 230, 0.45)',
  veloBottom: 'rgba(238, 240, 230, 0.60)',

  surfaceCard: 'rgba(255, 255, 255, 0.55)',
  surfaceCardElevated: 'rgba(255, 255, 255, 0.78)',
  surfaceRaised: 'rgba(248, 249, 242, 0.86)',
  surfaceChip: 'rgba(20, 21, 17, 0.06)',
  surfaceCardOpaco: '#ffffff',
  surfaceCardElevatedOpaco: '#fbfcf7',
  surfaceRaisedOpaco: '#f8f9f2',
  surfaceInset: 'rgba(20, 21, 17, 0.05)',
  surfaceToast: 'rgba(238, 240, 230, 0.92)',
  glassLine: 'rgba(255, 255, 255, 0.80)',
  glassHighlight: 'rgba(255, 255, 255, 0.95)',
  surfaceSignalSoft: 'rgba(79, 106, 10, 0.08)',
  surfaceSignalLine: 'rgba(79, 106, 10, 0.55)',
  surfaceIntensitySoft: 'rgba(20, 21, 17, 0.05)',
  surfaceIntensityLine: 'rgba(20, 21, 17, 0.32)',

  textPrimary: p.ivory900,
  textSecondary: p.ivory700,
  textTertiary: p.ivory600,
  textDisabled: p.ivory500,
  textOnAccent: p.ivory50,
  textOnSignal: p.ivory50,
  textOnIntensity: p.ivory50,
  marca: '#000000',

  borderSubtle: 'rgba(20, 21, 17, 0.08)',
  borderDefault: 'rgba(20, 21, 17, 0.16)',
  borderStrong: 'rgba(20, 21, 17, 0.55)',
  divider: 'rgba(20, 21, 17, 0.08)',
  scrim: 'rgba(20, 21, 17, 0.28)',
  focusRing: p.lume800,

  accent: p.ivory900,
  accentHover: p.ivory800,
  accentPress: '#000000',
  signal: p.lume800,
  signalPress: p.lume900,
  signalText: p.lume900,
  intensity: p.ivory900,
  intensityText: p.ivory900,
  danger: p.crimson600,
  dangerText: p.crimson700,

  dataTrack: 'rgba(20, 21, 17, 0.12)',
  dataTick: 'rgba(20, 21, 17, 0.26)',
};

export type LumePalette = { [K in keyof typeof oscuro]: string };
export type LumeModo = 'dark' | 'light';

export const lumeTemas: Record<LumeModo, LumePalette> = { dark: oscuro, light: claro };

/** Con Reducir transparencia el vidrio pasa a superficies opacas. */
export function sinTransparencia(t: LumePalette): LumePalette {
  return {
    ...t,
    surfaceCard: t.surfaceCardOpaco,
    surfaceCardElevated: t.surfaceCardElevatedOpaco,
    surfaceRaised: t.surfaceRaisedOpaco,
  };
}

/* ---- Sombras y resplandores ----
   RN >= 0.76 acepta `boxShadow` con el mismo string del token. La parte
   `inset` del vidrio no existe en RN: el brillo de canto lo dibuja Vidrio
   con una linea de 1 px arriba (glassHighlight).
   `glass` queda sin sombra lejana (transparente): en la web el vidrio de al
   lado desenfoca lo que tiene detras (backdrop-filter) y esa sombra se
   disimula, pero en RN las tarjetas no desenfocan y la sombra del elemento
   de arriba se veia a traves del vidrio de abajo como una franja oscura
   (issue #29). El vidrio conserva su borde y el brillo de canto. */
export const lumeSombras: Record<LumeModo, Record<'glass' | 'md' | 'lg' | 'haloAccent' | 'haloSignal', string>> = {
  dark: {
    glass: '0 0 0 rgba(0, 0, 0, 0)',
    md: '0 12px 32px rgba(0, 0, 0, 0.45)',
    lg: '0 24px 56px rgba(0, 0, 0, 0.55)',
    haloAccent: '0 8px 24px rgba(201, 226, 95, 0.28)',
    haloSignal: '0 0 12px rgba(201, 226, 95, 0.45)',
  },
  light: {
    glass: '0 0 0 rgba(0, 0, 0, 0)',
    md: '0 12px 32px rgba(20, 21, 17, 0.10)',
    lg: '0 24px 56px rgba(20, 21, 17, 0.14)',
    haloAccent: '0 8px 24px rgba(20, 21, 17, 0.18)',
    haloSignal: '0 0 10px rgba(150, 190, 40, 0.45)',
  },
};

/* ---- Espaciado: grilla de 4 / 8 px ---- */
export const lumeSpace = {
  0: 0,
  1: 2,
  2: 4,
  3: 8,
  4: 12,
  5: 16,
  6: 20,
  7: 24,
  8: 32,
  9: 40,
  10: 48,
  11: 64,
  12: 80,
} as const;

export const lumeLayout = {
  padScreen: 20,
  padCard: 20,
  padControl: 16,
  hitMin: 44,
  controlHSm: 36,
  controlHMd: 44,
  controlHLg: 54,
} as const;

/* ---- Radios: mas redondos que antes, porque el vidrio lo pide ---- */
export const lumeRadius = {
  xs: 3,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 36,
  pill: 999,
} as const;

/* ---- Movimiento: rapido y sin rebote ---- */
export const lumeMotion = {
  durFast: 110,
  durBase: 180,
  durSlow: 280,
  pressScale: 0.985,
  // Fundido entre pasos de un wizard fuera del onboarding.
  fundido: 420,
  // Desplazamiento de las luces entre pasos del onboarding.
  recorrido: 600,
} as const;

/* ---- Blur (BlurView de expo-blur) ---- */
export const lumeBlur = { glass: 40, sheet: 60 } as const;
