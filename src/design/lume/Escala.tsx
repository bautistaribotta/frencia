/* ============================================================
   Frencia · Lume · Escala de avance
   Una marca de 3 px por paso: hechas en tinta, la actual en lume con su
   brillo, las que faltan en data-track. `cortes` separa grupos (en la
   sesion, ejercicio de ejercicio).
   ============================================================ */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useLume } from './useLume';

export interface EscalaProps {
  total: number;
  actual: number;
  cortes?: number[];
}

export function Escala({ total, actual, cortes = [] }: EscalaProps) {
  const { t, sombras } = useLume();
  const marcas: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const estilo =
      i < actual
        ? { backgroundColor: t.textPrimary }
        : i === actual
          ? { backgroundColor: t.signal, boxShadow: sombras.haloSignal }
          : { backgroundColor: t.dataTrack };
    marcas.push(<View key={i} style={[styles.marca, estilo]} />);
    if (cortes.includes(i) && i < total - 1) marcas.push(<View key={`c${i}`} style={styles.corte} />);
  }
  return (
    <View
      style={styles.escala}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: actual + 1 }}
    >
      {marcas}
    </View>
  );
}

const styles = StyleSheet.create({
  escala: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  marca: { flex: 1, height: 3, borderRadius: 2 },
  corte: { width: 6 },
});
