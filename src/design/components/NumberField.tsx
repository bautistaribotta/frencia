/* Frencia · NumberField
   Campo numerico con ajuste rapido: menos a la izquierda, mas a la derecha y
   el numero al medio, que se toca para escribirlo. Es la base de DistanceField
   y del RPE de la sesion de cardio.

   Admite quedar vacio (null): borrar el texto entrega null, y desde vacio el
   boton de mas arranca en el minimo. El valor sale a medida que se escribe,
   no al salir del campo: con el teclado abierto, tocar Siguiente o Guardar no
   pasa por el blur y lo ultimo escrito se perderia. */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { mono, radius, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type Size = 'md' | 'lg';

export interface NumberFieldProps {
  label?: string;
  /** null = sin cargar. */
  value: number | null;
  /** Borrar el campo entrega null. */
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Decimales que se muestran y se guardan. 0 = enteros. */
  decimals?: number;
  /** Unidad al lado del numero y arriba a la derecha ("km"). */
  unit?: string;
  /** Formato a la derecha del label cuando no hay unidad ("1–10"). */
  hint?: string;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  decimals = 0,
  unit,
  hint,
  size = 'md',
  fullWidth = false,
  style,
}: NumberFieldProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [foco, setFoco] = useState(false);
  const [buf, setBuf] = useState('');

  const lg = size === 'lg';
  const alto = lg ? 56 : 48;

  const formatear = (v: number | null) => (v === null ? '' : v.toFixed(decimals));
  const acotar = (v: number) => Number(Math.max(min, Math.min(max, v)).toFixed(decimals));
  const pasoTexto = String(step);

  function escribir(texto: string) {
    const limpio = texto.replace(decimals === 0 ? /[^\d]/g : /[^\d.,]/g, '').slice(0, 7);
    setBuf(limpio);
    const n = parseFloat(limpio.replace(',', '.'));
    if (limpio === '') onChange(null);
    else if (Number.isFinite(n)) onChange(acotar(n));
  }

  const sinMenos = value === null || value <= min;
  const sinMas = value !== null && value >= max;
  const nombre = label ?? 'Valor';

  return (
    <View style={[styles.base, fullWidth && styles.baseFull, style]}>
      {label ? (
        <View style={styles.labelFila}>
          <Text style={styles.label}>{label}</Text>
          {unit || hint ? <Text style={styles.formato}>{unit ?? hint}</Text> : null}
        </View>
      ) : null}
      <View style={[styles.fila, foco && { borderColor: colors.accent }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`menos ${pasoTexto}${unit ? ` ${unit}` : ''}`}
          disabled={sinMenos}
          onPress={() => value !== null && onChange(acotar(value - step))}
          style={({ pressed }) => [
            styles.btn,
            { width: alto, height: alto },
            pressed && styles.btnPresionado,
            sinMenos && styles.btnApagado,
          ]}
        >
          <Icon name="minus" size={16} strokeWidth={2.5} color={colors.textSecondary} />
          <Text style={styles.btnTexto}>{pasoTexto}</Text>
        </Pressable>

        <View style={[styles.pozo, { height: alto }]}>
          <TextInput
            style={[
              styles.input,
              { fontSize: lg ? 28 : 22, textAlign: unit ? 'right' : 'center' },
            ]}
            value={foco ? buf : formatear(value)}
            onChangeText={escribir}
            onFocus={() => {
              setBuf(formatear(value));
              setFoco(true);
            }}
            onBlur={() => setFoco(false)}
            keyboardType={decimals === 0 ? 'number-pad' : 'decimal-pad'}
            placeholder={decimals === 0 ? '—' : (0).toFixed(decimals)}
            placeholderTextColor={colors.textDisabled}
            selectionColor={colors.accent}
            selectTextOnFocus
            accessibilityLabel={unit ? `${nombre} en ${unit}` : nombre}
          />
          {unit ? <Text style={styles.unidad}>{unit}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`más ${pasoTexto}${unit ? ` ${unit}` : ''}`}
          disabled={sinMas}
          onPress={() => onChange(value === null ? acotar(Math.max(min, step)) : acotar(value + step))}
          style={({ pressed }) => [
            styles.btn,
            { width: alto, height: alto },
            pressed && styles.btnPresionado,
            sinMas && styles.btnApagado,
          ]}
        >
          <Icon name="plus" size={16} strokeWidth={2.5} color={colors.textSecondary} />
          <Text style={styles.btnTexto}>{pasoTexto}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: { gap: 6, alignSelf: 'flex-start', minWidth: 0 },
    baseFull: { alignSelf: 'stretch' },
    labelFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    label: {
      fontFamily: mono.medium,
      fontSize: 11,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    formato: { fontFamily: mono.medium, fontSize: 11, color: colors.textDisabled },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceInset,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    btn: { alignItems: 'center', justifyContent: 'center', gap: 1 },
    btnPresionado: { backgroundColor: colors.surfaceCardElevated },
    btnApagado: { opacity: 0.35 },
    btnTexto: { fontFamily: mono.semibold, fontSize: 10, color: colors.textSecondary },
    pozo: {
      flex: 1,
      minWidth: 92,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    input: {
      minWidth: 48,
      padding: 0,
      fontFamily: mono.bold,
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    unidad: { fontFamily: mono.medium, fontSize: 12, color: colors.textTertiary },
  });
