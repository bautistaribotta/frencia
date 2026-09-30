/* Frencia · ExerciseTypeTag — RN port of components/log/ExerciseTypeTag.jsx
   Tipo de ejercicio: icono y nombre, sin color propio. Con `metrics` suma los
   datos que registra ("TIEMPO · DIST."), porque las vistas dependen de eso y
   no del tipo. El nombre y el icono de cada tipo los decide quien lo usa
   (src/lib/exercises.ts, TIPOS). */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, sans, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

export interface ExerciseTypeTagProps {
  label: string;
  icon: string;
  /** Datos que registra, ya abreviados: ["Tiempo", "Dist."]. */
  metrics?: string[];
  style?: ViewStyle;
}

export function ExerciseTypeTag({ label, icon, metrics = [], style }: ExerciseTypeTagProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      style={[styles.base, style]}
      accessible
      accessibilityLabel={[label, ...metrics].join(', ')}
    >
      <View style={styles.tipo}>
        <Icon name={icon} size={14} strokeWidth={2} color={colors.textSecondary} />
        <Text style={styles.nombre}>{label}</Text>
      </View>
      {metrics.length > 0 ? (
        <>
          <Text style={styles.sep}>·</Text>
          <Text style={styles.datos}>{metrics.join(' · ')}</Text>
        </>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2 },
    tipo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    nombre: { fontFamily: sans.semibold, fontSize: 12, color: colors.textSecondary },
    sep: { fontSize: 11, color: colors.textDisabled },
    datos: {
      fontFamily: mono.medium,
      fontSize: 10.5,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
  });
