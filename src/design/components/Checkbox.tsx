/* Frencia · Checkbox — RN port of components/feedback/Checkbox.jsx
   Caja cuadrada con check. Marcada usa el mismo verde suave que el icono de
   completado del historial (fondo surfaceGreenSoft, borde surfaceGreenLine y
   check en accentText); vacia queda solo el borde neutro.
   Con onChange se toca para alternar; sin onChange es solo un indicador y
   decide quien lo contiene (por ejemplo, marcar un documento como leido). */

import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { radius, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Checkbox({ checked = false, onChange, disabled = false, style }: CheckboxProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  const caja = (
    <View style={[styles.box, checked && styles.boxOn, disabled && styles.disabled, !onChange && style]}>
      {checked && <Icon name="check" size={16} color={colors.accentText} />}
    </View>
  );

  if (!onChange) return caja;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onChange(!checked)}
      style={style}
    >
      {caja}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    box: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderDefault,
    },
    boxOn: {
      backgroundColor: colors.surfaceGreenSoft,
      borderColor: colors.surfaceGreenLine,
    },
    disabled: { opacity: 0.4 },
  });
