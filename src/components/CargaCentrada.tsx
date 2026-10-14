/* Carga de pantalla completa: el anillo de carga y su leyenda centradas en el espacio que
   queda debajo del encabezado. Es la del detalle de un entrenamiento; la usan
   todas las pantallas que esperan su primera lectura para no tener una por
   pantalla. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/design';
import { Cargando } from '@/design/lume';

export function CargaCentrada({ texto }: { texto: string }) {
  return (
    <View style={styles.centro}>
      <Cargando texto={texto} />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.padScreen,
  },
});
