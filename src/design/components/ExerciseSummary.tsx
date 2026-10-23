/* Frencia · ExerciseSummary — resumen de una linea del plan (Lume).
   Volumen · intensidad · descanso: "4x10 · RIR 2 · 2 min". El volumen va en
   tinta semibold, la intensidad en intensity-text semibold (el esfuerzo es
   tinta en Lume) y el descanso con el icono de reloj, en terciario, para no
   confundirse con un tiempo de trabajo. El formato de cada parte lo arma
   quien lo usa (src/lib/dia.ts). */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '../Icon';
import { useLume, useLumeStyles } from '../lume/useLume';
import type { LumePalette } from '../lume/tokens';
import { lumeFuente } from '../lume/tipografia';

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
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const fontSize = FONT_SIZE[size];
  const medida = { fontSize, lineHeight: fontSize + 5 };
  const label = [volume, intensity, rest ? `descanso ${rest}` : null].filter(Boolean).join(', ');

  return (
    <View style={[styles.base, style]} accessible accessibilityLabel={label}>
      <Text style={[styles.vol, medida]}>{volume}</Text>
      {intensity ? (
        <>
          <Text style={[styles.sep, medida]}>·</Text>
          <Text style={[styles.int, medida]}>{intensity}</Text>
        </>
      ) : null}
      {rest ? (
        <>
          <Text style={[styles.sep, medida]}>·</Text>
          <View style={styles.rest}>
            <Icon name="timer" size={fontSize} strokeWidth={1.75} color={t.textTertiary} />
            <Text style={[styles.restText, medida]}>{rest}</Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    base: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, rowGap: 2 },
    vol: { fontFamily: lumeFuente.semibold, fontVariant: ['tabular-nums'], color: t.textPrimary },
    sep: { fontFamily: lumeFuente.medium, color: t.textDisabled },
    int: { fontFamily: lumeFuente.semibold, fontVariant: ['tabular-nums'], color: t.intensityText },
    rest: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    restText: { fontFamily: lumeFuente.medium, fontVariant: ['tabular-nums'], color: t.textTertiary },
  });
