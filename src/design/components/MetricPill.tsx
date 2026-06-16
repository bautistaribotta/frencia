/* Frencia · MetricPill — RN port of components/data/MetricPill.jsx
   Inline metric chip — icon + label + value (rest timer, RIR, pace). */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, radius, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type Tone = 'neutral' | 'green' | 'orange';
type Layout = 'stack' | 'inline';

export interface MetricPillProps {
  icon?: string;
  label?: string;
  value: React.ReactNode;
  tone?: Tone;
  layout?: Layout;
  style?: ViewStyle;
}

const makeFill = (colors: Palette): Record<Tone, ViewStyle> => ({
  neutral: { backgroundColor: colors.surfaceChip },
  green: { backgroundColor: colors.surfaceGreenSoft, borderColor: colors.surfaceGreenLine, borderWidth: 1 },
  orange: { backgroundColor: colors.surfaceOrangeSoft, borderColor: colors.surfaceOrangeLine, borderWidth: 1 },
});
const makeValueColor = (colors: Palette): Record<Tone, string> => ({
  neutral: colors.textPrimary,
  green: colors.accentText,
  orange: colors.intensityText,
});
const makeIconColor = (colors: Palette): Record<Tone, string> => ({
  neutral: colors.textTertiary,
  green: colors.accentText,
  orange: colors.intensityText,
});

export function MetricPill({ icon, label, value, tone = 'neutral', layout = 'stack', style }: MetricPillProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const FILL = useMemo(() => makeFill(colors), [colors]);
  const VALUE_COLOR = useMemo(() => makeValueColor(colors), [colors]);
  const ICON_COLOR = useMemo(() => makeIconColor(colors), [colors]);
  const inline = layout === 'inline';
  return (
    <View style={[styles.base, inline && styles.baseInline, FILL[tone], style]}>
      {icon ? <Icon name={icon} size={16} color={ICON_COLOR[tone]} /> : null}
      <View style={inline ? styles.bodyInline : styles.body}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={[styles.value, { color: VALUE_COLOR[tone] }]}>{value}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: 'transparent',
      alignSelf: 'flex-start',
    },
    baseInline: { paddingVertical: 6, paddingHorizontal: 12 },
    body: { flexDirection: 'column' },
    bodyInline: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    label: {
      fontFamily: mono.medium,
      fontSize: 9,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    value: { fontFamily: mono.bold, fontSize: 15 },
  });
