/* Frencia · IconButton — RN port of components/core/IconButton.jsx
   Square/round icon-only button. */

import React, { useMemo } from 'react';
import { Pressable, type PressableProps, StyleSheet, type ViewStyle } from 'react-native';
import { radius, shadow, motion, type Palette } from '../theme';
import { useColors } from '../theme-context';
import { Icon } from '../Icon';

type Variant = 'primary' | 'surface' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: string;
  variant?: Variant;
  size?: Size;
  round?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const BOX: Record<Size, number> = { sm: 36, md: 44, lg: 52 };
const GLYPH: Record<Size, number> = { sm: 18, md: 22, lg: 26 };

const makeFill = (colors: Palette): Record<Variant, ViewStyle> => ({
  primary: { backgroundColor: colors.accent, ...shadow.glowGreenSoft },
  surface: { backgroundColor: colors.surfaceChip, borderColor: colors.borderSubtle, borderWidth: 1 },
  ghost: { backgroundColor: 'transparent' },
});
const makeGlyphColor = (colors: Palette): Record<Variant, string> => ({
  primary: colors.textOnAccent,
  surface: colors.textPrimary,
  ghost: colors.textSecondary,
});

export function IconButton({
  icon,
  variant = 'surface',
  size = 'md',
  round = false,
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const colors = useColors();
  const FILL = useMemo(() => makeFill(colors), [colors]);
  const GLYPH_COLOR = useMemo(() => makeGlyphColor(colors), [colors]);
  const box = BOX[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { width: box, height: box, borderRadius: round ? box / 2 : radius.md },
        FILL[variant],
        pressed && !disabled && { transform: [{ scale: motion.pressScale }] },
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <Icon name={icon} size={GLYPH[size]} color={GLYPH_COLOR[variant]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  disabled: { opacity: 0.4 },
});
