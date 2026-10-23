/* Frencia · ExerciseTypeTag — tipo de ejercicio (Lume).
   Icono y nombre en texto secundario, sin color propio. Con `metrics` suma
   los datos que registra ("TIEMPO · DIST.") en rotulo semicondensado,
   porque las vistas dependen de eso y no del tipo. El nombre y el icono de
   cada tipo los decide quien lo usa (src/lib/exercises.ts, TIPOS). */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '../Icon';
import { useLume, useLumeStyles } from '../lume/useLume';
import type { LumePalette } from '../lume/tokens';
import { lumeFuente } from '../lume/tipografia';

export interface ExerciseTypeTagProps {
  label: string;
  icon: IconName;
  /** Datos que registra, ya abreviados: ["Tiempo", "Dist."]. */
  metrics?: string[];
  style?: ViewStyle;
}

export function ExerciseTypeTag({ label, icon, metrics = [], style }: ExerciseTypeTagProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);

  return (
    <View style={[styles.base, style]} accessible accessibilityLabel={[label, ...metrics].join(', ')}>
      <View style={styles.tipo}>
        <Icon name={icon} size={14} strokeWidth={1.75} color={t.textSecondary} />
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

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    base: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2 },
    tipo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    nombre: { fontFamily: lumeFuente.semibold, fontSize: 12, lineHeight: 16, color: t.textSecondary },
    sep: { fontSize: 11, color: t.textDisabled },
    datos: {
      fontFamily: lumeFuente.semiSemibold,
      fontSize: 10.5,
      lineHeight: 14,
      letterSpacing: 0.84,
      textTransform: 'uppercase',
      color: t.textTertiary,
    },
  });
