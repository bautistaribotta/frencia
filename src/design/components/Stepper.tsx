/* Frencia · Stepper — RN port of components/data/Stepper.jsx
   Numeric stepper for logging reps / load. Tabular mono value, ± controls. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, radius, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type Size = 'md' | 'lg';

export interface StepperProps {
  label?: string;
  value: number;
  onChange?: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  size?: Size;
  precision?: number;
  style?: ViewStyle;
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  unit,
  size = 'md',
  precision = 0,
  style,
}: StepperProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const lg = size === 'lg';
  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange?.(Number(clamped.toFixed(precision)));
  };
  const atMin = value <= min;
  const atMax = value >= max;
  const btnSize = { width: lg ? 52 : 44, height: lg ? 56 : 48 };

  return (
    <View style={[styles.base, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="menos"
          disabled={atMin}
          onPress={() => set(value - step)}
          style={({ pressed }) => [styles.btn, btnSize, pressed && !atMin && styles.btnPressed, atMin && styles.btnDisabled]}
        >
          <Icon name="minus" size={20} strokeWidth={2.5} color={colors.textSecondary} />
        </Pressable>

        <Text style={[styles.val, { fontSize: lg ? 28 : 22, minWidth: lg ? 80 : 64 }]}>
          {value}
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="más"
          disabled={atMax}
          onPress={() => set(value + step)}
          style={({ pressed }) => [styles.btn, btnSize, pressed && !atMax && styles.btnPressed, atMax && styles.btnDisabled]}
        >
          <Icon name="plus" size={20} strokeWidth={2.5} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { gap: 6, alignSelf: 'flex-start' },
    label: {
      fontFamily: mono.medium,
      fontSize: 11,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceInset,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    btn: { alignItems: 'center', justifyContent: 'center' },
    btnPressed: { backgroundColor: colors.surfaceCardElevated },
    btnDisabled: { opacity: 0.35 },
    val: {
      textAlign: 'center',
      fontFamily: mono.bold,
      color: colors.textPrimary,
    },
    unit: { fontFamily: mono.medium, fontSize: 12, color: colors.textTertiary },
  });
