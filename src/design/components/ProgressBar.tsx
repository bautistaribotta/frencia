/* Frencia · ProgressBar — RN port of components/data/ProgressBar.jsx
   Continuous or segmented (e.g. sets done) completion bar. */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, radius, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';

type Tone = 'green' | 'orange';
type Size = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: Tone;
  size?: Size;
  segments?: number;
  style?: ViewStyle;
}

const H: Record<Size, number> = { sm: 6, md: 8, lg: 12 };

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = 'green',
  size = 'md',
  segments,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const h = H[size];
  const fillColor = tone === 'orange' ? colors.intensity : colors.accent;

  return (
    <View style={[styles.base, style]}>
      {label || showValue ? (
        <View style={styles.head}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {showValue ? (
            <Text style={styles.val}>{segments ? `${value}/${segments}` : `${Math.round(pct)}%`}</Text>
          ) : null}
        </View>
      ) : null}

      {segments ? (
        <View style={[styles.track, { height: h, backgroundColor: 'transparent' }, styles.segRow]}>
          {Array.from({ length: segments }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.seg,
                { backgroundColor: i < value ? fillColor : colors.dataTrack },
              ]}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.track, { height: h }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fillColor }]} />
        </View>
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { gap: 8 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    label: {
      fontFamily: mono.medium,
      fontSize: 11,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    val: { fontFamily: mono.semibold, fontSize: 12, color: colors.textSecondary },
    track: { backgroundColor: colors.dataTrack, borderRadius: radius.pill, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill },
    segRow: { flexDirection: 'row', gap: 4 },
    seg: { flex: 1, height: '100%', borderRadius: radius.sm },
  });
