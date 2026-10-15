/* Frencia · ExerciseTypeTag — tipo de ejercicio (Lume).
   Icono y nombre en texto secundario, sin color propio. Con `metrics` suma
   los datos que registra ("TIEMPO · DIST.") en rotulo semicondensado,
   porque las vistas dependen de eso y no del tipo. El nombre y el icono de
   cada tipo los decide quien lo usa (src/lib/exercises.ts, TIPOS). */

import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '../Icon';
import { useLume } from '../lume/useLume';
import { lumeFuente } from '../lume/tipografia';

export interface ExerciseTypeTagProps {
  label: string;
  icon: string;
  /** Datos que registra, ya abreviados: ["Tiempo", "Dist."]. */
  metrics?: string[];
  style?: ViewStyle;
}

export function ExerciseTypeTag({ label, icon, metrics = [], style }: ExerciseTypeTagProps) {
  const { t } = useLume();

  return (
    <View style={[styles.base, style]} accessible accessibilityLabel={[label, ...metrics].join(', ')}>
      <View style={styles.tipo}>
        <Icon name={icon} size={14} strokeWidth={1.75} color={t.textSecondary} />
        <Text style={[styles.nombre, { color: t.textSecondary }]}>{label}</Text>
      </View>
      {metrics.length > 0 ? (
        <>
          <Text style={[styles.sep, { color: t.textDisabled }]}>·</Text>
          <Text style={[styles.datos, { color: t.textTertiary }]}>{metrics.join(' · ')}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 2 },
  tipo: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nombre: { fontFamily: lumeFuente.semibold, fontSize: 12, lineHeight: 16 },
  sep: { fontSize: 11 },
  datos: {
    fontFamily: lumeFuente.semiSemibold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 0.84,
    textTransform: 'uppercase',
  },
});
