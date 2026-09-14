/* ============================================================
   Frencia · Colors (React Native port of tokens/colors.css)
   Dark-first athletic palette. Warm-black base, muted emerald
   green as the brand signature, orange as the intensity accent.
   ============================================================ */

export const palette = {
  // Greens (emerald, the brand signature)
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E', // esmeralda brillante: uso puntual
  green550: '#1DA95A', // PRIMARIO en oscuro: esmeralda apagado
  green560: '#23B866', // hover sobre el primario apagado
  green600: '#16A34A',
  green700: '#15803D', // PRIMARIO en claro: verde bosque
  green800: '#0E5B2C', // press en claro
  greenDeep: '#334635',

  // Orange (intensity / effort / PR heat)
  orange300: '#FFB088',
  orange400: '#FF8A4C',
  orange500: '#FF6D29',
  orange550: '#E85F22', // intensidad en oscuro (menos vibrante)
  orange600: '#E85002',
  orange700: '#C2410C',
  orange800: '#9A340A', // press en claro

  // Warm-dark neutral scale (ink)
  ink1000: '#000000',
  ink950: '#0D0B0E',
  ink900: '#161317',
  ink850: '#1C181D',
  ink800: '#221E24',
  ink750: '#29242B',
  ink700: '#322C34',
  ink600: '#443D47',
  ink500: '#5C5460',
  ink400: '#7A7280',
  ink300: '#9C949F',
  ink200: '#C4BEC6',
  ink100: '#E8E4E9',
  ink50: '#F4F2F5',
  ink0: '#F9F9F9',
  white: '#FFFFFF',

  // Cool grey neutral scale (stone) — solo tema claro "cemento"
  stone0: '#FFFFFF',
  stone50: '#F7F8F7',
  stone100: '#EDEFED',
  stone200: '#E4E7E4',
  stone300: '#D9DDD9',
  stone400: '#C3C9C3',
  stone500: '#9AA19A',
  stone600: '#737B73',
  stone700: '#4A524A',
  stone800: '#2A2F2A',
  stone900: '#0A0C0A',

  // Status
  danger: '#EF4444',
  dangerText: '#FCA5A5',
  info: '#60A5FA',
} as const;

/* ------------------------------------------------------------------
   Tema oscuro (base). Mismas claves semanticas que el tema claro:
   `colors` referencia esta paleta por defecto y para compatibilidad.
   NOTA: RN no parsea oklch, por eso los tokens usan hex/rgba.
   ------------------------------------------------------------------ */
const darkColors = {
  // Surfaces
  bgApp: palette.ink900,
  bgAppDeep: palette.ink950,
  surfaceRaised: palette.ink850,
  surfaceCard: palette.ink800,
  surfaceCardElevated: palette.ink750,
  surfaceChip: palette.ink700,
  surfaceInset: palette.ink950,

  // Tinted surfaces (brand wash)
  surfaceGreenSoft: 'rgba(29, 169, 90, 0.10)',
  surfaceGreenLine: 'rgba(29, 169, 90, 0.26)',
  surfaceOrangeSoft: 'rgba(255, 109, 41, 0.09)',
  surfaceOrangeLine: 'rgba(255, 109, 41, 0.26)',

  // Text
  textPrimary: palette.ink100,
  textSecondary: palette.ink300,
  textTertiary: palette.ink400,
  textDisabled: palette.ink500,
  textOnAccent: palette.ink1000, // negro sobre verde/naranja
  textInverse: palette.ink1000,

  // Borders / dividers
  borderSubtle: palette.ink700,
  borderDefault: palette.ink600,
  borderStrong: palette.ink500,
  divider: 'rgba(255, 255, 255, 0.07)',

  // Accent — primary action (esmeralda apagado: presencia sin vibracion)
  accent: palette.green550,
  accentHover: palette.green560,
  accentPress: palette.green700,
  accentText: '#63C98E', // verde desaturado para texto sobre oscuro

  // Accent — intensity
  intensity: palette.orange550,
  intensityHover: '#F5722F',
  intensityPress: palette.orange700,
  intensityText: '#E8875A',

  // Status
  success: palette.green500,
  warning: palette.orange500,
  danger: palette.danger,
  dangerText: palette.dangerText,
  info: palette.info,

  // Data viz
  dataVolume: palette.green550,
  dataIntensity: palette.orange550,
  dataTrack: palette.ink700,

  // Control internals (switch thumb)
  switchThumb: palette.ink100,
  switchThumbActive: palette.ink1000,
};

/* ------------------------------------------------------------------
   Tema claro "cemento". Fondo gris frio, cards blancas, tinta casi
   negra y verde bosque como accion: sobrio, sin vibracion. El texto
   sobre acento pasa a blanco porque el verde bosque es oscuro.
   ------------------------------------------------------------------ */
const lightColors: Palette = {
  // Surfaces
  bgApp: palette.stone200,
  bgAppDeep: '#D5D9D5',
  surfaceRaised: palette.stone0,
  surfaceCard: palette.stone0,
  surfaceCardElevated: palette.stone0,
  surfaceChip: '#DADEDA',
  surfaceInset: palette.stone300,

  // Tinted surfaces (brand wash) — sobre el verde bosque, no el brillante
  surfaceGreenSoft: 'rgba(21, 128, 61, 0.09)',
  surfaceGreenLine: 'rgba(21, 128, 61, 0.26)',
  surfaceOrangeSoft: 'rgba(194, 65, 12, 0.09)',
  surfaceOrangeLine: 'rgba(194, 65, 12, 0.26)',

  // Text
  textPrimary: palette.stone900,
  textSecondary: palette.stone700,
  textTertiary: palette.stone600,
  textDisabled: palette.stone500,
  textOnAccent: palette.white, // blanco sobre verde bosque
  textInverse: palette.stone0,

  // Borders / dividers
  borderSubtle: 'rgba(10, 12, 10, 0.12)',
  borderDefault: 'rgba(10, 12, 10, 0.22)',
  borderStrong: 'rgba(10, 12, 10, 0.40)',
  divider: 'rgba(10, 12, 10, 0.10)',

  // Accent — primary action (verde bosque)
  accent: palette.green700,
  accentHover: palette.green600,
  accentPress: palette.green800,
  accentText: palette.green700,

  // Accent — intensity
  intensity: palette.orange700,
  intensityHover: palette.orange600,
  intensityPress: palette.orange800,
  intensityText: palette.orange700,

  // Status
  success: palette.green700,
  warning: palette.orange700,
  danger: palette.danger,
  dangerText: palette.danger,
  info: palette.info,

  // Data viz
  dataVolume: palette.green700,
  dataIntensity: palette.orange700,
  dataTrack: '#CDD2CD',

  // Control internals (switch thumb)
  switchThumb: palette.white,
  switchThumbActive: palette.white,
};

export const themes = { dark: darkColors, light: lightColors } as const;

export type ThemeMode = keyof typeof themes;
/** Cada token mapeado a string: ambas paletas comparten la misma forma. */
export type Palette = { [K in keyof typeof darkColors]: string };

/** Paleta por defecto (tema oscuro). Para uso fuera de React o como base.
 *  Dentro de componentes usar `useColors()` para que reaccione al tema. */
export const colors = darkColors;

export type ColorToken = keyof typeof darkColors;
