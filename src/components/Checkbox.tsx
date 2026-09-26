/* Frencia · Checkbox — indicador de marcado.
   El design system no tiene checkbox todavia: se arma con el mismo patron que
   el icono de completado del historial (fondo verde suave, borde verde y el
   check en verde de texto). Vacio queda solo el borde neutro.
   Es solo el indicador, sin toque propio: la fila que lo contiene decide
   cuando se marca. Pendiente de sumarlo a Claude Design. */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, radius, useColors, useThemedStyles, type Palette } from '@/design';

interface CheckboxProps {
  marcado: boolean;
}

export function Checkbox({ marcado }: CheckboxProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.caja, marcado && styles.cajaMarcada]}>
      {marcado && <Icon name="check" size={16} color={colors.accentText} />}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    caja: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderDefault,
    },
    cajaMarcada: {
      backgroundColor: colors.surfaceGreenSoft,
      borderColor: colors.surfaceGreenLine,
    },
  });
