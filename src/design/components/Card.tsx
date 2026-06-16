/* Frencia · Card — RN port of components/core/Card.jsx
   Surface container, the base building block for grouped content. */

import React, { useMemo } from 'react';
import { Pressable, type PressableProps, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { radius, shadow, spacing, type Palette } from '../theme';
import { useColors } from '../theme-context';

type Variant = 'default' | 'raised' | 'elevated' | 'inset' | 'green' | 'orange';

export interface CardProps extends ViewProps {
  variant?: Variant;
  hairline?: boolean;
  interactive?: boolean;
  onPress?: PressableProps['onPress'];
  style?: ViewStyle;
  children?: React.ReactNode;
}

const makeVariant = (colors: Palette): Record<Variant, ViewStyle> => ({
  default: { backgroundColor: colors.surfaceCard },
  raised: { backgroundColor: colors.surfaceRaised },
  elevated: { backgroundColor: colors.surfaceCardElevated, ...shadow.md },
  inset: { backgroundColor: colors.surfaceInset },
  green: { backgroundColor: colors.surfaceGreenSoft, borderColor: colors.surfaceGreenLine, borderWidth: 1 },
  orange: { backgroundColor: colors.surfaceOrangeSoft, borderColor: colors.surfaceOrangeLine, borderWidth: 1 },
});

export function Card({
  variant = 'default',
  hairline = false,
  interactive = false,
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const colors = useColors();
  const VARIANT = useMemo(() => makeVariant(colors), [colors]);
  const base: ViewStyle[] = [
    styles.base,
    VARIANT[variant],
    hairline && { borderColor: colors.borderSubtle, borderWidth: 1 },
    style,
  ].filter(Boolean) as ViewStyle[];

  if (interactive || onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...base, pressed && { transform: [{ scale: 0.99 }] }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: spacing.padCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
