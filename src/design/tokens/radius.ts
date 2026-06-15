/* ============================================================
   Frencia · Radius & Shadow (port of tokens/radius.css)
   Dark UI leans on surface elevation + hairline borders; reserve
   real shadow for floating, glow for active.
   ============================================================ */

import { Platform, ViewStyle } from 'react-native';

export const radius = {
  xs: 6,
  sm: 10,
  md: 14, // buttons, inputs
  lg: 18, // chips, small cards
  xl: 24, // cards
  '2xl': 30, // hero cards, sheets
  '3xl': 38,
  pill: 999,
} as const;

/**
 * RN doesn't support multi-layer / spread box-shadows like CSS.
 * These approximate the brand elevation + glow with elevation (Android)
 * and shadow* props (iOS). Spread it onto a View style.
 */
type Elevation = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

const make = (color: string, y: number, blur: number, opacity: number, elevation: number): Elevation =>
  Platform.select<Elevation>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur / 2,
    },
    android: { elevation },
    default: {},
  })!;

export const shadow = {
  none: {} as Elevation,
  sm: make('#000', 1, 2, 0.4, 1),
  md: make('#000', 4, 16, 0.45, 6),
  lg: make('#000', 12, 32, 0.55, 12),
  sheet: make('#000', -8, 40, 0.6, 16),
  // Brand glow — neon halo on active CTAs (approximated)
  glowGreen: make('#22C55E', 8, 28, 0.45, 10),
  glowGreenSoft: make('#FF6D29', 6, 24, 0.3, 6),
  glowOrange: make('#FF6D29', 8, 28, 0.45, 10),
} as const;

// Motion (use with Animated / Reanimated)
export const motion = {
  durFast: 120,
  durBase: 200,
  durSlow: 320,
  pressScale: 0.97,
} as const;
