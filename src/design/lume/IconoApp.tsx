/* Frencia · Lume · Icono de la app (FREN / CIA con el punto), en su version
   clara u oscura segun el tema. En las pantallas de acceso es la marca. */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useLume } from './useLume';

const ICONOS = {
  dark: require('../../../assets/images/lume/icono-oscuro.png'),
  light: require('../../../assets/images/lume/icono-claro.png'),
};

export function IconoApp({ size = 64 }: { size?: number }) {
  const { modo, t, sombras } = useLume();
  const radio = Math.round(size * 0.234);
  return (
    <View
      style={[
        styles.marco,
        { width: size, height: size, borderRadius: radio, borderColor: t.glassLine, boxShadow: sombras.md },
      ]}
    >
      <Image
        source={ICONOS[modo]}
        style={{ width: size, height: size, borderRadius: radio }}
        accessibilityLabel="Frencia"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  marco: { borderWidth: 1, overflow: 'visible' },
});
