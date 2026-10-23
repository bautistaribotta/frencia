/* Frencia · DurationField (Lume) — RN port of components/log/DurationField.jsx
   Campo de duracion. Escritura directa estilo temporizador de iOS: los digitos
   entran por la derecha (4, 5 -> 0:45; 1, 3, 0 -> 1:30) y se ajusta rapido con
   los botones de los costados.

   El valor se entrega en segundos a medida que se escribe, no al salir del
   campo: con el teclado abierto, tocar Guardar no pasa por el blur y el ultimo
   digito se perderia. */

import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';
import { useLume, useLumeStyles } from '../lume/useLume';
import { lumeFuente } from '../lume/tipografia';
import { lumeRadius, type LumePalette } from '../lume/tokens';
import { Icon } from '../Icon';
import { reloj } from '@/lib/tiempo';

type Size = 'md' | 'lg';

export interface DurationFieldProps {
  label?: string;
  /** Segundos. null = sin cargar. */
  value: number | null;
  onChange: (seconds: number) => void;
  /** Cuanto suma o resta cada boton, en segundos. */
  step?: number;
  /** Acepta h:mm:ss (cardio). Sin horas el tope es 59:59. */
  allowHours?: boolean;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
}

function pasoLabel(step: number): string {
  return step < 60 ? `${step}s` : `${Math.round(step / 60)}min`;
}

export function DurationField({
  label,
  value,
  onChange,
  step = 5,
  allowHours = false,
  size = 'md',
  fullWidth = false,
  style,
}: DurationFieldProps) {
  const { t: colors } = useLume();
  const styles = useLumeStyles(makeStyles);
  const input = useRef<TextInput>(null);
  const [foco, setFoco] = useState(false);
  const [buf, setBuf] = useState('');

  const maxDigitos = allowHours ? 6 : 4;
  const max = allowHours ? 359999 : 3599;
  const lg = size === 'lg';
  const formato = allowHours ? 'h:mm:ss' : 'm:ss';

  const acotar = (v: number) => Math.max(0, Math.min(max, Math.round(v)));
  const aSegundos = (digitos: string) => {
    const d = digitos.padStart(maxDigitos, '0');
    if (allowHours) return +d.slice(0, 2) * 3600 + +d.slice(2, 4) * 60 + +d.slice(4, 6);
    return +d.slice(0, 2) * 60 + +d.slice(2, 4);
  };

  function escribir(texto: string) {
    const digitos = texto.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigitos);
    setBuf(digitos);
    if (digitos) onChange(acotar(aSegundos(digitos)));
  }

  const v = value ?? 0;
  const fontSize = lg ? 32 : 26;
  const alto = lg ? 60 : 50;
  const anchoBtn = lg ? 60 : 52;

  let mostrado: React.ReactNode;
  if (foco) {
    // Los ceros de relleno van apagados: se ve donde va a caer el proximo digito.
    const relleno = buf.padStart(maxDigitos, '0');
    const primero = maxDigitos - buf.length;
    const partes: React.ReactNode[] = [];
    for (let i = 0; i < maxDigitos; i++) {
      if (i > 0 && i % 2 === 0) {
        partes.push(
          <Text key={`c${i}`} style={i <= primero ? styles.apagado : null}>
            :
          </Text>,
        );
      }
      partes.push(
        <Text key={i} style={i < primero ? styles.apagado : null}>
          {relleno[i]}
        </Text>,
      );
    }
    mostrado = (
      <View style={styles.enFoco}>
        <Text style={[styles.valor, { fontSize }]}>{partes}</Text>
        <View style={[styles.cursor, { height: fontSize * 0.95 }]} />
      </View>
    );
  } else if (value === null) {
    mostrado = <Text style={[styles.valor, styles.apagado, { fontSize }]}>{formato}</Text>;
  } else {
    mostrado = <Text style={[styles.valor, { fontSize }]}>{reloj(value)}</Text>;
  }

  return (
    <View style={[styles.base, fullWidth && styles.baseFull, style]}>
      {label ? (
        <View style={styles.labelFila}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.formato}>{formato}</Text>
        </View>
      ) : null}
      <View style={[styles.fila, foco && styles.filaFoco]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`menos ${pasoLabel(step)}`}
          disabled={v <= 0}
          onPress={() => onChange(acotar(v - step))}
          style={({ pressed }) => [
            styles.btn,
            { width: anchoBtn, height: alto },
            pressed && styles.btnPresionado,
            v <= 0 && styles.btnApagado,
          ]}
        >
          <Icon name="minus" size={16} strokeWidth={1.75} color={colors.textPrimary} />
          <Text style={styles.btnTexto}>{pasoLabel(step)}</Text>
        </Pressable>

        <Pressable
          onPress={() => input.current?.focus()}
          accessible={false}
          style={[styles.pozo, { height: alto }]}
        >
          {mostrado}
          {/* El input real queda invisible encima: recibe el teclado y los
             digitos, y lo que se ve lo dibuja el texto de abajo. */}
          <TextInput
            ref={input}
            style={styles.input}
            value={buf}
            onChangeText={escribir}
            onFocus={() => {
              setBuf('');
              setFoco(true);
            }}
            onBlur={() => {
              setBuf('');
              setFoco(false);
            }}
            keyboardType="number-pad"
            caretHidden
            contextMenuHidden
            maxLength={maxDigitos + 2}
            accessibilityLabel={label ? `${label}, ${value === null ? 'sin cargar' : reloj(value)}` : 'Duración'}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`más ${pasoLabel(step)}`}
          disabled={v >= max}
          onPress={() => onChange(acotar(v + step))}
          style={({ pressed }) => [
            styles.btn,
            { width: anchoBtn, height: alto },
            pressed && styles.btnPresionado,
            v >= max && styles.btnApagado,
          ]}
        >
          <Icon name="plus" size={16} strokeWidth={1.75} color={colors.textPrimary} />
          <Text style={styles.btnTexto}>{pasoLabel(step)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: LumePalette) =>
  StyleSheet.create({
    base: { gap: 6, alignSelf: 'flex-start', minWidth: 0 },
    baseFull: { alignSelf: 'stretch' },
    labelFila: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    label: {
      fontFamily: lumeFuente.semiSemibold,
      fontSize: 11,
      lineHeight: 15,
      letterSpacing: 0.88,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },
    formato: { fontFamily: lumeFuente.medium, fontSize: 11, lineHeight: 15, color: colors.textDisabled },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceInset,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      borderRadius: lumeRadius.md,
      overflow: 'hidden',
    },
    filaFoco: { borderColor: colors.signal },
    btn: { alignItems: 'center', justifyContent: 'center', gap: 1 },
    btnPresionado: { backgroundColor: colors.surfaceCardElevated },
    btnApagado: { opacity: 0.35 },
    btnTexto: { fontFamily: lumeFuente.semibold, fontSize: 10, lineHeight: 13, color: colors.textTertiary },
    pozo: { flex: 1, minWidth: 92, alignItems: 'center', justifyContent: 'center' },
    enFoco: { flexDirection: 'row', alignItems: 'center' },
    valor: {
      fontFamily: lumeFuente.condMedium,
      letterSpacing: -0.5,
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
      includeFontPadding: false,
    },
    apagado: { color: colors.textDisabled },
    cursor: { width: 2, marginLeft: 2, backgroundColor: colors.signal },
    input: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      opacity: 0,
      color: 'transparent',
    },
  });
