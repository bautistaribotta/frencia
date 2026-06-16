/* Frencia · Button — RN port of components/core/Button.jsx
   Black label rides the accent fill. Primary carries a green glow. */

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { radius, sans, shadow, sizing, space, motion, type Palette } from '../theme';
import { useColors } from '../theme-context';
import { Icon } from '../Icon';

type Variant = 'primary' | 'intensity' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: string;
  iconRight?: string;
  /** Nodo custom antes del label (ej. logo de marca SVG). Tiene prioridad sobre `icon`. */
  leading?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const HEIGHT: Record<Size, number> = {
  sm: sizing.controlHSm,
  md: sizing.controlHMd,
  lg: sizing.controlHLg,
};
const PAD_X: Record<Size, number> = { sm: 16, md: 22, lg: 28 };
const FONT: Record<Size, number> = { sm: 14, md: 16, lg: 17 };

const makeFill = (colors: Palette): Record<Variant, ViewStyle> => ({
  primary: { backgroundColor: colors.accent, ...shadow.glowGreenSoft },
  intensity: { backgroundColor: colors.intensity },
  secondary: { backgroundColor: colors.surfaceCard, borderColor: colors.borderDefault, borderWidth: 1 },
  ghost: { backgroundColor: 'transparent' },
});
const makeLabelColor = (colors: Palette): Record<Variant, string> => ({
  primary: colors.textOnAccent,
  intensity: colors.textOnAccent,
  secondary: colors.textPrimary,
  ghost: colors.textSecondary,
});

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconRight,
  leading,
  disabled = false,
  loading = false,
  children,
  style,
  ...rest
}: ButtonProps) {
  const colors = useColors();
  const FILL = useMemo(() => makeFill(colors), [colors]);
  const LABEL_COLOR = useMemo(() => makeLabelColor(colors), [colors]);
  const isDisabled = disabled || loading;
  const labelColor = LABEL_COLOR[variant];
  const iconSize = FONT[size] * 1.15;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { height: HEIGHT[size], paddingHorizontal: PAD_X[size] },
        FILL[variant],
        fullWidth && styles.full,
        pressed && !isDisabled && { transform: [{ scale: motion.pressScale }] },
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} size="small" />
      ) : (
        <View style={styles.row}>
          {leading ?? (icon ? <Icon name={icon} size={iconSize} color={labelColor} /> : null)}
          {children != null ? (
            <Text style={[styles.label, { color: labelColor, fontSize: FONT[size] }]} numberOfLines={1}>
              {children}
            </Text>
          ) : null}
          {iconRight ? <Icon name={iconRight} size={iconSize} color={labelColor} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  full: { width: '100%' },
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  label: { fontFamily: sans.semibold },
});
