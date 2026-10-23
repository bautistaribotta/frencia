/* Frencia · Stepper — paso numerico para series, reps, RIR y RPE (Lume).
   Valor condensado y tabular entre - y +, sobre surface-inset. Los botones
   se separan del valor con un filo border-subtle; apretados suben a
   surface-card-elevated y en el tope pasan a text-disabled. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '../Icon';
import { useLume, useLumeStyles } from '../lume/useLume';
import { lumeFuente, lumeTexto } from '../lume/tipografia';
import { lumeRadius, type LumePalette } from '../lume/tokens';

type Size = 'md' | 'lg';

export interface StepperProps {
  label?: string;
  value: number;
  onChange?: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
  size?: Size;
  precision?: number;
  /** Texto a mostrar en lugar del numero (p. ej. "Fallo" para RIR -1). */
  format?: (value: number) => string;
  /** Ocupa todo el ancho disponible: los botones van a los bordes. */
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  unit,
  size = 'md',
  precision = 0,
  format,
  fullWidth = false,
  style,
}: StepperProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const lg = size === 'lg';
  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    onChange?.(Number(clamped.toFixed(precision)));
  };
  const atMin = value <= min;
  const atMax = value >= max;
  const alto = lg ? 58 : 48;
  const ancho = fullWidth ? (lg ? 52 : 44) : alto;
  const shown = format ? format(value) : String(value);

  const boton = (icono: 'minus' | 'plus', tope: boolean, onPress: () => void, lado: 'izq' | 'der') => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icono === 'minus' ? 'menos' : 'más'}
      disabled={tope}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { width: ancho, height: alto },
        lado === 'izq' ? styles.btnIzq : styles.btnDer,
        pressed && !tope && styles.btnPresionado,
      ]}
    >
      <Icon name={icono} size={18} strokeWidth={1.75} color={tope ? t.textDisabled : t.textPrimary} />
    </Pressable>
  );

  return (
    <View style={[styles.base, fullWidth && styles.baseFull, style]}>
      {label ? <Text style={[lumeTexto.label, styles.label]}>{label}</Text> : null}
      <View style={styles.row}>
        {boton('minus', atMin, () => set(value - step), 'izq')}

        <Text
          accessibilityLabel={label ? `${label}: ${shown}` : shown}
          style={[
            styles.val,
            { fontSize: lg ? 30 : 24, minWidth: lg ? 88 : 72 },
            fullWidth && styles.valFull,
          ]}
        >
          {shown}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>

        {boton('plus', atMax, () => set(value + step), 'der')}
      </View>
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    base: { gap: 8, alignSelf: 'flex-start' },
    baseFull: { alignSelf: 'stretch' },
    label: { color: t.textTertiary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: lumeRadius.md,
      overflow: 'hidden',
      backgroundColor: t.surfaceInset,
      borderColor: t.borderSubtle,
    },
    btn: { alignItems: 'center', justifyContent: 'center', borderColor: t.borderSubtle },
    btnPresionado: { backgroundColor: t.surfaceCardElevated },
    btnIzq: { borderRightWidth: 1 },
    btnDer: { borderLeftWidth: 1 },
    val: {
      textAlign: 'center',
      fontFamily: lumeFuente.condMedium,
      letterSpacing: -0.5,
      fontVariant: ['tabular-nums'],
      color: t.textPrimary,
    },
    valFull: { flex: 1, minWidth: 0 },
    unit: { fontFamily: lumeFuente.medium, fontSize: 12, letterSpacing: 0, color: t.textTertiary },
  });
