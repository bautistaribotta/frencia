/* Frencia · SerieFilas — la serie de fuerza, una fila por dato.
   Ver docs/specs/registro-de-sesion.md seccion 6.2

   Es la misma comparacion que SerieComparativa (plan, ultima, hoy), traspuesta:
   cada dato es una fila y la linea de tiempo corre de izquierda a derecha.
   Plan y ultima van como numeros sueltos; la caja de hoy, ancha y al final de
   la fila, cae bajo el pulgar derecho. Con tres filas en vez de tres columnas
   cada caja tiene casi la mitad del ancho de la pantalla para su numero.

   Las columnas de plan y ultima tienen ancho fijo: es lo que mantiene los
   numeros alineados entre filas, que es todo el punto de la comparacion. */

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

export interface SerieFilasProps {
  columnas: ColumnaSerie[];
  /** Hace cuanto fue la vez anterior. null = sin registro en la ventana. */
  cuandoAnterior: string | null;
}

export function SerieFilas({ columnas, cuandoAnterior }: SerieFilasProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.contenedor}>
      {/* Encabezado, una sola vez para todas las filas */}
      <View style={styles.fila}>
        <View style={styles.etiqueta} />
        <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.ref}>
          Plan
        </FrenciaText>
        <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.ref}>
          Última
        </FrenciaText>
        <FrenciaText role="dataLabel" color={colors.accentText} style={styles.hoyEncabezado}>
          Hoy
        </FrenciaText>
      </View>

      {columnas.map((c, i) => (
        <View key={c.key} style={[styles.fila, i > 0 && styles.filaDivisoria]}>
          <FrenciaText role="dataLabel" color={colors.textSecondary} style={styles.etiqueta}>
            {c.label}
          </FrenciaText>
          <Numero valor={c.plan} styles={styles} colors={colors} />
          <Numero valor={cuandoAnterior ? c.anterior : null} styles={styles} colors={colors} />
          <View style={styles.celdaHoy}>
            <TextInput
              style={[styles.caja, c.hoy !== '' && styles.cajaCargada]}
              value={c.hoy}
              onChangeText={c.onHoy}
              editable={!!c.onHoy}
              keyboardType={c.teclado ?? 'number-pad'}
              accessibilityLabel={c.accesible}
              placeholder={VACIO}
              placeholderTextColor={colors.textDisabled}
              maxLength={5}
              selectTextOnFocus
            />
          </View>
        </View>
      ))}

      <FrenciaText role="dataLabel" color={colors.textTertiary}>
        {cuandoAnterior ? `Última: ${cuandoAnterior}` : 'Sin registro anterior'}
      </FrenciaText>
    </View>
  );
}

function Numero({
  valor,
  styles,
  colors,
}: {
  valor: string | null;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.ref}>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.numeroRef,
          {
            color: valor === null ? colors.textDisabled : colors.textSecondary,
          },
        ]}
      >
        {valor ?? VACIO}
      </Text>
    </View>
  );
}

const ANCHO_REF = 56;

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    contenedor: { gap: space[3] },

    fila: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Una linea fina entre datos, en vez de una caja por celda: la fila se lee
    // de punta a punta sin bordes que la corten.
    filaDivisoria: {
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },

    etiqueta: { width: 48, flexShrink: 0 },
    ref: { width: ANCHO_REF, flexShrink: 0, textAlign: 'center' },
    hoyEncabezado: { flex: 1, textAlign: 'center' },
    // La caja va dentro de una celda flexible: un TextInput suelto trae un
    // ancho minimo propio y empuja a las referencias.
    celdaHoy: { flex: 1, minWidth: 0 },

    numeroRef: {
      fontFamily: mono.medium,
      fontSize: 20,
      lineHeight: 26,
      textAlign: 'center',
      includeFontPadding: false,
    },

    caja: {
      width: '100%',
      height: 64,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      textAlign: 'center',
      fontFamily: mono.bold,
      fontSize: 30,
      color: colors.textPrimary,
    },
    // El borde de acento marca lo ya cargado sin necesidad de leer el numero.
    cajaCargada: { borderColor: colors.accent },
  });
