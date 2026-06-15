/* ============================================================
   Frencia · Colors (React Native port of tokens/colors.css)
   Dark-first athletic palette. Warm-black base, emerald green
   signature, orange intensity accent.
   ============================================================ */

export const palette = {
  // Greens (emerald, signature)
  green300: '#86EFAC',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  greenDeep: '#334635',

  // Orange (intensity / effort / PR heat)
  orange300: '#FFB088',
  orange400: '#FF8A4C',
  orange500: '#FF6D29',
  orange600: '#E85002',
  orange700: '#C2410C',

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

  // Status
  danger: '#EF4444',
  dangerText: '#FCA5A5',
  info: '#60A5FA',
} as const;

export const colors = {
  // Surfaces
  bgApp: palette.ink900,
  bgAppDeep: palette.ink950,
  surfaceRaised: palette.ink850,
  surfaceCard: palette.ink800,
  surfaceCardElevated: palette.ink750,
  surfaceChip: palette.ink700,
  surfaceInset: palette.ink950,

  // Tinted surfaces (brand wash)
  surfaceGreenSoft: 'rgba(255, 109, 41, 0.10)',
  surfaceGreenLine: 'rgba(255, 109, 41, 0.28)',
  surfaceOrangeSoft: 'rgba(255, 109, 41, 0.10)',
  surfaceOrangeLine: 'rgba(255, 109, 41, 0.30)',

  // Text
  textPrimary: palette.ink100,
  textSecondary: palette.ink300,
  textTertiary: palette.ink400,
  textDisabled: palette.ink500,
  textOnAccent: palette.ink1000, // black on green/orange
  textInverse: palette.ink1000,

  // Borders / dividers
  borderSubtle: palette.ink700,
  borderDefault: palette.ink600,
  borderStrong: palette.ink500,
  divider: 'rgba(255, 255, 255, 0.07)',

  // Accent — primary action (preview: naranja)
  accent: palette.orange500,
  accentHover: palette.orange400,
  accentPress: palette.orange600,
  accentText: palette.orange400,

  // Accent — intensity
  intensity: palette.orange500,
  intensityHover: palette.orange400,
  intensityPress: palette.orange600,
  intensityText: palette.orange400,

  // Status
  success: palette.green500,
  warning: palette.orange500,
  danger: palette.danger,
  dangerText: palette.dangerText,
  info: palette.info,

  // Data viz
  dataVolume: palette.green500,
  dataIntensity: palette.orange500,
  dataTrack: palette.ink700,
} as const;

export type ColorToken = keyof typeof colors;
