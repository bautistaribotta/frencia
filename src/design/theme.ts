/* ============================================================
   Frencia · Theme barrel
   import { themes, spacing, radius, shadow, textRole } from '@/design/theme'
   ============================================================ */

export { palette, themes, withAlpha } from './tokens/colors';
export type { ColorToken, Palette, ThemeMode } from './tokens/colors';
export { space, spacing, sizing } from './tokens/spacing';
export { radius, shadow, shadows, shadowSpecs, motion } from './tokens/radius';
export type { Shadows, ShadowSpec } from './tokens/radius';
export {
  sans,
  mono,
  display,
  fontSize,
  tracking,
  textRole,
} from './tokens/typography';
