/* Frencia · SerieColumnas — la serie de fuerza, una tarjeta por dato.
   Ver docs/specs/registro-de-sesion.md seccion 6.2

   Es la misma comparacion que SerieComparativa (plan, ultima, hoy), girada:
   cada dato es una columna propia y se lee de arriba hacia abajo. Arriba, en
   chico, lo que dice el plan y lo que se hizo la vez anterior; abajo, grande,
   la caja de hoy. La referencia queda pegada al campo que informa, sin una
   columna de etiquetas que le robe ancho a las cajas.

   La tarjeta entera toma el borde de acento al cargarse: lo que falta se ve
   sin leer numeros. */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  FrenciaText,
  mono,
  radius,
  space,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';
import type { ColumnaSerie } from '@/components/SerieComparativa';

// Mismo signo que la grilla: no hay numero.
const VACIO = '—';

export interface SerieColumnasProps {
  columnas: ColumnaSerie[];
  /** Hace cuanto fue la vez anterior. null = sin registro en la ventana. */
  cuandoAnterior: string | null;
}

export function SerieColumnas({ columnas, cuandoAnterior }: SerieColumnasProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.contenedor}>
      <View style={styles.columnas}>
        {columnas.map((c) => (
          <Columna
            key={c.key}
            columna={c}
            anterior={cuandoAnterior ? c.anterior : null}
            styles={styles}
            colors={colors}
          />
        ))}
      </View>
      <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.centrado}>
        {cuandoAnterior ? `Última: ${cuandoAnterior}` : 'Sin registro anterior'}
      </FrenciaText>
    </View>
  );
}

function Columna({
  columna,
  anterior,
  styles,
  colors,
}: {
  columna: ColumnaSerie;
  anterior: string | null;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  const cargado = columna.hoy !== '';

  return (
    <View style={[styles.tarjeta, cargado && styles.tarjetaCargada]}>
      <FrenciaText role="dataLabel" color={colors.textSecondary} style={styles.centrado}>
        {columna.label}
      </FrenciaText>

      <View style={styles.referencias}>
        <Referencia etiqueta="Plan" valor={columna.plan} styles={styles} colors={colors} />
        <Referencia etiqueta="Últ." valor={anterior} styles={styles} colors={colors} />
      </View>

      <TextInput
        style={styles.caja}
        value={columna.hoy}
        onChangeText={columna.onHoy}
        editable={!!columna.onHoy}
        keyboardType={columna.teclado ?? 'number-pad'}
        accessibilityLabel={columna.accesible}
        placeholder={VACIO}
        placeholderTextColor={colors.textDisabled}
        maxLength={5}
        selectTextOnFocus
      />
    </View>
  );
}

function Referencia({
  etiqueta,
  valor,
  styles,
  colors,
}: {
  etiqueta: string;
  valor: string | null;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.referencia}>
      <FrenciaText role="dataLabel" color={colors.textTertiary}>
        {etiqueta}
      </FrenciaText>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.numeroRef,
          { color: valor === null ? colors.textDisabled : colors.textSecondary },
        ]}
      >
        {valor ?? VACIO}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    contenedor: { gap: space[4] },
    columnas: { flexDirection: 'row', gap: space[3] },
    centrado: { textAlign: 'center' },

    tarjeta: {
      flex: 1,
      gap: space[4],
      paddingTop: space[4],
      paddingHorizontal: space[2],
      paddingBottom: space[2],
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    tarjetaCargada: { borderColor: colors.accent },

    // Plan y ultima, en dos renglones de etiqueta y numero: se leen como nota
    // al pie de la caja, no como otra fila a completar.
    referencias: { gap: space[2], paddingHorizontal: space[2] },
    referencia: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space[2],
    },
    numeroRef: {
      flexShrink: 1,
      fontFamily: mono.medium,
      fontSize: 18,
      lineHeight: 24,
      includeFontPadding: false,
    },

    // La caja de hoy va hundida en la tarjeta: es el unico hueco a llenar.
    caja: {
      height: 72,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceInset,
      textAlign: 'center',
      fontFamily: mono.bold,
      fontSize: 32,
      color: colors.textPrimary,
    },
  });
