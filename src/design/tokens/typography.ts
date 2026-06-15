/* ============================================================
   Frencia · Typography (port of tokens/typography.css)
   Anton (display) · Archivo (UI/body) · JetBrains Mono (data)
   Font families come from @expo-google-fonts/* — see fonts.ts.
   NOTE: RN has no font-shorthand; pick a fontFamily that already
   encodes the weight (Archivo_700Bold), don't combine with
   fontWeight.
   ============================================================ */

import type { TextStyle } from 'react-native';

// Archivo weight → loaded family name
export const sans = {
  regular: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  extrabold: 'Archivo_800ExtraBold',
  black: 'Archivo_900Black',
} as const;

// JetBrains Mono weight → loaded family name
export const mono = {
  regular: 'JetBrainsMono_400Regular',
  medium: 'JetBrainsMono_500Medium',
  semibold: 'JetBrainsMono_600SemiBold',
  bold: 'JetBrainsMono_700Bold',
} as const;

// Anton ships a single weight
export const display = 'Anton_400Regular';

// Type scale (px)
export const fontSize = {
  display2xl: 88,
  displayXl: 64,
  displayLg: 48,
  displayMd: 36,
  titleXl: 28,
  titleLg: 24,
  titleMd: 20,
  titleSm: 18,
  bodyLg: 17,
  bodyMd: 15,
  bodySm: 13,
  labelLg: 13,
  labelMd: 11,
  labelSm: 10,
} as const;

// Letter spacing (RN uses px, not em). Wide tracking for mono captions.
export const tracking = {
  display: -0.5,
  tight: -0.4,
  normal: 0,
  wide: 0.5,
  wider: 0.9,
  widest: 1.5,
} as const;

/**
 * Semantic text roles — spread onto a <Text style={...}>.
 * lineHeight is absolute px (RN), derived from the CSS ratios.
 */
export const textRole = {
  // Display — Anton, tight
  hero: { fontFamily: display, fontSize: fontSize.display2xl, lineHeight: 96, letterSpacing: tracking.display },
  display: { fontFamily: display, fontSize: fontSize.displayLg, lineHeight: 54, letterSpacing: tracking.display },

  // Headings — Archivo
  title: { fontFamily: sans.bold, fontSize: fontSize.titleLg, lineHeight: 29 },
  subtitle: { fontFamily: sans.semibold, fontSize: fontSize.titleMd, lineHeight: 22 },

  // Body — Archivo
  body: { fontFamily: sans.regular, fontSize: fontSize.bodyLg, lineHeight: 25 },
  bodySm: { fontFamily: sans.regular, fontSize: fontSize.bodyMd, lineHeight: 22 },

  // Data — JetBrains Mono
  data: { fontFamily: mono.medium, fontSize: fontSize.bodyMd, lineHeight: 17 },
  dataLabel: {
    fontFamily: mono.medium,
    fontSize: fontSize.labelMd,
    lineHeight: 12,
    letterSpacing: tracking.wider,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;
