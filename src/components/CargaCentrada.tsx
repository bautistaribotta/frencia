/* Carga de pantalla completa: ruedita y leyenda centradas en el espacio que
   queda debajo del encabezado. Es la del detalle de un entrenamiento; la usan
   todas las pantallas que esperan su primera lectura para no tener una por
   pantalla. */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FrenciaText, space, spacing, useColors } from '@/design';

export function CargaCentrada({ texto }: { texto: string }) {
  const colors = useColors();
  return (
    <View style={styles.centro} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.accent} />
      <FrenciaText role="bodySm" color={colors.textSecondary}>
        {texto}
      </FrenciaText>
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[4],
    padding: spacing.padScreen,
  },
});
