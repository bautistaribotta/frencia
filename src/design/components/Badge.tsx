/* Frencia · Badge — RN port of components/core/Badge.jsx
   Compact status marker (RIR, PR, set type). Mono, uppercase. */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { mono, radius, tracking, type Palette } from '../theme';
import { useColors } from '../theme-context';
import { Icon } from '../Icon';

type Tone = 'neutral' | 'green' | 'green-solid' | 'orange' | 'orange-solid' | 'danger';

export interface BadgeProps {
  tone?: Tone;
  icon?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const makeFill = (colors: Palette): Record<Tone, ViewStyle> => ({
  neutral: { backgroundColor: colors.surfaceChip },
  green: { backgroundColor: colors.surfaceGreenSoft, borderColor: colors.surfaceGreenLine, borderWidth: 1 },
  'green-solid': { backgroundColor: colors.accent },
  orange: { backgroundColor: colors.surfaceOrangeSoft, borderColor: colors.surfaceOrangeLine, borderWidth: 1 },
  'orange-solid': { backgroundColor: colors.intensity },
  danger: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1 },
});
const makeFg = (colors: Palette): Record<Tone, string> => ({
  neutral: colors.textSecondary,
  green: colors.accentText,
  'green-solid': colors.textOnAccent,
  orange: colors.intensityText,
  'orange-solid': colors.textOnAccent,
  danger: colors.dangerText,
});

export function Badge({ tone = 'neutral', icon, children, style }: BadgeProps) {
  const colors = useColors();
  const FILL = useMemo(() => makeFill(colors), [colors]);
  const FG = useMemo(() => makeFg(colors), [colors]);
  const fg = FG[tone];
  return (
    <View style={[styles.base, FILL[tone], style]}>
      {icon ? <Icon name={icon} size={12} color={fg} strokeWidth={2.25} /> : null}
      <Text style={[styles.text, { color: fg } as TextStyle]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: mono.semibold,
    fontSize: 11,
    letterSpacing: tracking.wide,
    textTransform: 'uppercase',
  },
});
