/* Frencia · ExerciseSummary — RN port of components/log/ExerciseSummary.jsx
   Resumen de una linea del plan: volumen · intensidad · descanso.
   "4x10 · RIR 2 · 2 min". La intensidad va en naranja y el descanso lleva el
   icono de reloj, para no confundirse con un tiempo de trabajo. El formato de
   cada parte lo arma quien lo usa (src/lib/dia.ts). */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type Size = 'md' | 'lg';

export interface ExerciseSummaryProps {
  /** Volumen con el prefijo de series: "4x10", "3x45 s", "30 min · 5 km". */
  volume: string;
  /** "RIR 2", "RPE 6". null = sin intensidad. */
  intensity?: string | null;
  /** Descanso ya formateado: "2 min", "1:30". null = sin descanso. */
  rest?: string | null;
  size?: Size;
  style?: ViewStyle;
}

const FONT_SIZE: Record<Size, number> = { md: 13, lg: 15 };

export function ExerciseSummary({ volume, intensity, rest, size = 'md', style }: ExerciseSummaryProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const fontSize = FONT_SIZE[size];
  const label = [volume, intensity, rest ? `descanso ${rest}` : null].filter(Boolean).join(', ');

  return (
    <View style={[styles.base, style]} accessible accessibilityLabel={label}>
      <Text style={[styles.vol, { fontSize }]}>{volume}</Text>
      {intensity ? (
        <>
          <Text style={[styles.sep, { fontSize }]}>·</Text>
          <Text style={[styles.int, { fontSize }]}>{intensity}</Text>
        </>
      ) : null}
      {rest ? (
        <>
          <Text style={[styles.sep, { fontSize }]}>·</Text>
          <View style={styles.rest}>
            <Icon name="timer" size={fontSize} color={colors.textTertiary} />
            <Text style={[styles.restText, { fontSize }]}>{rest}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 2 },
    vol: { fontFamily: mono.semibold, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
    sep: { fontFamily: mono.medium, color: colors.textDisabled },
    int: { fontFamily: mono.semibold, color: colors.intensityText, fontVariant: ['tabular-nums'] },
    rest: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    restText: { fontFamily: mono.medium, color: colors.textTertiary, fontVariant: ['tabular-nums'] },
  });
