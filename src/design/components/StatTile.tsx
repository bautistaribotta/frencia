/* Frencia · StatTile — RN port of components/data/StatTile.jsx
   Signature big-number metric. Anton numerals + mono caption. */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { display, mono, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Tone = 'default' | 'green' | 'orange';

export interface StatTileProps {
  label?: string;
  value: React.ReactNode;
  unit?: string;
  delta?: React.ReactNode;
  deltaDir?: 'up' | 'down';
  size?: Size;
  tone?: Tone;
  style?: ViewStyle;
}

const VALUE_SIZE: Record<Size, number> = { sm: 32, md: 48, lg: 72, xl: 92 };
const UNIT_SIZE: Record<Size, number> = { sm: 13, md: 16, lg: 20, xl: 24 };
const makeToneColor = (colors: Palette): Record<Tone, string> => ({
  default: colors.textPrimary,
  green: colors.accent,
  orange: colors.intensity,
});

export function StatTile({
  label,
  value,
  unit,
  delta,
  deltaDir,
  size = 'md',
  tone = 'default',
  style,
}: StatTileProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const TONE_COLOR = useMemo(() => makeToneColor(colors), [colors]);
  const valueColor = TONE_COLOR[tone];
  const down = deltaDir === 'down';
  return (
    <View style={[styles.base, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { fontSize: VALUE_SIZE[size], color: valueColor }]}>
          {value}
          {unit ? <Text style={[styles.unit, { fontSize: UNIT_SIZE[size] }]}>{unit}</Text> : null}
        </Text>
        {delta != null ? (
          <View style={styles.delta}>
            <Icon
              name={down ? 'arrow-down-right' : 'arrow-up-right'}
              size={13}
              strokeWidth={2.5}
              color={down ? colors.dangerText : colors.accentText}
            />
            <Text style={[styles.deltaText, { color: down ? colors.dangerText : colors.accentText }]}>
              {delta}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { gap: 6 },
    label: {
      fontFamily: mono.medium,
      fontSize: 11,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
    value: { fontFamily: display, color: colors.textPrimary },
    unit: { fontFamily: mono.medium, color: colors.textTertiary },
    delta: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingBottom: 4 },
    deltaText: { fontFamily: mono.semibold, fontSize: 13 },
  });
