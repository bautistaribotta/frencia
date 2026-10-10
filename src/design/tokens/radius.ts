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

/** Una sombra en crudo, como en CSS: color, caida, desenfoque y opacidad.
 *  `elevation` es su equivalente aproximado en Android. */
export interface ShadowSpec {
  color: string;
  y: number;
  blur: number;
  opacity: number;
  elevation: number;
}

const make = ({ color, y, blur, opacity, elevation }: ShadowSpec): Elevation =>
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

type Nivel = 'sm' | 'md' | 'lg' | 'sheet';

/** Las sombras en crudo por tema. Para dibujar una sombra que siga una forma
 *  (por ejemplo con un filtro SVG), donde shadow* y elevation no alcanzan. */
export const shadowSpecs: Record<'dark' | 'light', Record<Nivel, ShadowSpec>> = {
  dark: {
    sm: { color: '#000', y: 1, blur: 2, opacity: 0.4, elevation: 1 },
    md: { color: '#000', y: 4, blur: 16, opacity: 0.45, elevation: 6 },
    lg: { color: '#000', y: 12, blur: 32, opacity: 0.55, elevation: 12 },
    sheet: { color: '#000', y: -8, blur: 40, opacity: 0.6, elevation: 16 },
  },
  // Tema claro: la sombra negra fuerte del oscuro sobre el gris piedra se lee
  // como una mancha. Aca va teñida con la tinta del tema (stone-900) y mucho
  // mas tenue; en Android la elevacion baja en proporcion.
  light: {
    sm: { color: '#0A0C0A', y: 1, blur: 2, opacity: 0.1, elevation: 1 },
    md: { color: '#0A0C0A', y: 4, blur: 16, opacity: 0.08, elevation: 3 },
    lg: { color: '#0A0C0A', y: 12, blur: 32, opacity: 0.12, elevation: 6 },
    sheet: { color: '#0A0C0A', y: -8, blur: 40, opacity: 0.14, elevation: 10 },
  },
};

// Brand glow — halo retirado en el design system: el CTA se sostiene por
// color. Se conservan las claves para no romper consumidores.
const glows = {
  glowGreen: {} as Elevation,
  glowGreenSoft: {} as Elevation,
  glowOrange: {} as Elevation,
};

const build = (specs: Record<Nivel, ShadowSpec>) => ({
  none: {} as Elevation,
  sm: make(specs.sm),
  md: make(specs.md),
  lg: make(specs.lg),
  sheet: make(specs.sheet),
  ...glows,
});

export type Shadows = ReturnType<typeof build>;

/** Sombras por tema, con las mismas claves. Dentro de componentes se consumen
 *  con useShadows() o el segundo argumento de useThemedStyles. */
export const shadows = {
  dark: build(shadowSpecs.dark),
  light: build(shadowSpecs.light),
} as const;

/** Sombras del tema oscuro. Solo para codigo fuera del tema; en componentes
 *  usar las del tema activo. */
export const shadow = shadows.dark;

// Motion (use with Animated / Reanimated)
export const motion = {
  durFast: 120,
  durBase: 200,
  durSlow: 320,
  pressScale: 0.97,
} as const;
