/* Frencia · SerieComparativa — las tres lecturas de una serie, en una grilla.
   Ver docs/specs/registro-de-sesion.md seccion 6.2

   Lo que indico quien armo la rutina, lo que se hizo la vez anterior y lo que
   se esta cargando ahora son el mismo dato en tres momentos, asi que van en la
   misma grilla: mismas columnas, mismo orden, misma tipografia. Alineadas, la
   comparacion se lee de arriba hacia abajo sin que nadie la explique.

   El plan no trae peso: la rutina prescribe reps e intensidad, nunca kilos. Esa
   celda queda vacia a proposito y es lo mas importante de la pantalla: el plan
   da la forma del esfuerzo y el peso es lo que elige el usuario para que esa
   forma sea cierta. Es para lo que existe el RIR.

   Lo que las diferencia no es el color:
     - la etiqueta de la izquierda, que es texto y no depende del color;
     - el orden fijo plan > ultima > hoy, que es una linea de tiempo;
     - las tres filas comparten la caja redondeada, pero la de hoy es mas alta,
       editable y toma el borde de acento al cargarse: es la unica que se
       completa. La diferencia es funcional antes que decorativa.
   El acento naranja va encima de todo eso, no en lugar de eso. */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  FrenciaText,
  mono,
  radius,
  sizing,
  space,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// Marca de dato ausente. El mismo signo para "el plan no lo dice", "no hay
// registro" y "todavia no lo cargaste": en los tres casos no hay numero.
const VACIO = '—';

export interface SerieComparativaProps {
  /** Etiquetas de las columnas: unidad de peso y medidor de esfuerzo. */
  unidadPeso: string;
  medidor: string;
  /** Lo indicado por quien armo la rutina. Sin peso, que no se prescribe. */
  planReps: string;
  planIntensidad: string;
  /** Lo hecho la vez anterior. null = sin registro en la ventana. */
  anterior: { peso: string; reps: string; intensidad: string; cuando: string } | null;
  /** Lo que se esta cargando ahora. */
  peso: string;
  reps: string;
  intensidad: string;
  onPeso: (t: string) => void;
  onReps: (t: string) => void;
  onIntensidad: (t: string) => void;
}

export function SerieComparativa({
  unidadPeso,
  medidor,
  planReps,
  planIntensidad,
  anterior,
  peso,
  reps,
  intensidad,
  onPeso,
  onReps,
  onIntensidad,
}: SerieComparativaProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.grilla}>
      {/* Encabezado de columnas, una sola vez para las tres filas */}
      <View style={styles.fila}>
        <View style={styles.etiqueta} />
        <Columna label={unidadPeso} styles={styles} colors={colors} />
        <Columna label="Reps" styles={styles} colors={colors} />
        <Columna label={medidor} styles={styles} colors={colors} />
      </View>

      <Referencia
        etiqueta="Plan"
        detalle={null}
        valores={[VACIO, planReps, planIntensidad]}
        styles={styles}
        colors={colors}
      />

      <Referencia
        etiqueta="Última"
        detalle={anterior ? anterior.cuando : 'sin registro'}
        valores={
          anterior
            ? [anterior.peso, anterior.reps, anterior.intensidad]
            : [VACIO, VACIO, VACIO]
        }
        styles={styles}
        colors={colors}
      />

      {/* Hoy: la unica fila con cajas, porque es la unica que se completa. */}
      <View style={[styles.fila, styles.filaHoy]}>
        <View style={styles.etiqueta}>
          <FrenciaText role="dataLabel" color={colors.accentText}>
            Hoy
          </FrenciaText>
        </View>
        <Caja
          value={peso}
          onChangeText={onPeso}
          keyboardType="decimal-pad"
          accessibilityLabel={`Peso en ${unidadPeso}`}
          styles={styles}
          colors={colors}
        />
        <Caja
          value={reps}
          onChangeText={onReps}
          keyboardType="number-pad"
          accessibilityLabel="Repeticiones"
          styles={styles}
          colors={colors}
        />
        <Caja
          value={intensidad}
          onChangeText={onIntensidad}
          keyboardType="number-pad"
          accessibilityLabel={medidor}
          styles={styles}
          colors={colors}
        />
      </View>
    </View>
  );
}

function Columna({
  label,
  styles,
  colors,
}: {
  label: string;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.celda}>
      <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.centrado}>
        {label}
      </FrenciaText>
    </View>
  );
}

/* Fila de solo lectura. Los numeros van en la misma mono y en la misma columna
   que los de hoy, un punto mas chicos: se leen igual pero no compiten. */
function Referencia({
  etiqueta,
  detalle,
  valores,
  styles,
  colors,
}: {
  etiqueta: string;
  detalle: string | null;
  valores: [string, string, string];
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  return (
    <View style={styles.fila}>
      <View style={styles.etiqueta}>
        <FrenciaText role="dataLabel" color={colors.textTertiary}>
          {etiqueta}
        </FrenciaText>
        {detalle ? (
          <FrenciaText role="dataLabel" color={colors.textDisabled} numberOfLines={1}>
            {detalle}
          </FrenciaText>
        ) : null}
      </View>
      {valores.map((v, i) => (
        <View key={i} style={styles.celda}>
          <View style={styles.cajaRef}>
            <Text
              style={[
                styles.numeroRef,
                { color: v === VACIO ? colors.textDisabled : colors.textSecondary },
              ]}
            >
              {v}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Caja({
  value,
  onChangeText,
  keyboardType,
  accessibilityLabel,
  styles,
  colors,
}: {
  value: string;
  onChangeText: (t: string) => void;
  keyboardType: 'decimal-pad' | 'number-pad';
  accessibilityLabel: string;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  const cargado = value !== '';
  return (
    <View style={styles.celda}>
      <TextInput
        style={[styles.caja, cargado && styles.cajaCargada]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        accessibilityLabel={accessibilityLabel}
        placeholder={VACIO}
        placeholderTextColor={colors.textDisabled}
        maxLength={5}
        selectTextOnFocus
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    grilla: { gap: space[2] },

    fila: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
    // Ancho fijo: es lo que mantiene las columnas alineadas entre las tres
    // filas, que es todo el punto de la grilla.
    etiqueta: { width: 76, gap: 2 },
    celda: { flex: 1 },
    centrado: { textAlign: 'center' },

    numeroRef: {
      fontFamily: mono.medium,
      fontSize: 20,
      lineHeight: 26,
      textAlign: 'center',
      includeFontPadding: false,
    },

    // Plan y ultima comparten la caja redondeada de hoy, pero mas bajas y en el
    // relleno base: son referencia, no el campo que se completa. La jerarquia la
    // sostienen el alto y la tipografia, no un color distinto.
    cajaRef: {
      height: sizing.controlHMd,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Hoy se separa con una linea de acento y algo mas de aire arriba: es el
    // corte entre lo que se mira y lo que se hace.
    filaHoy: {
      marginTop: space[3],
      paddingTop: space[3],
      borderTopWidth: 1,
      borderTopColor: colors.surfaceOrangeLine,
    },

    caja: {
      height: sizing.controlHLg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      textAlign: 'center',
      fontFamily: mono.bold,
      fontSize: 24,
      color: colors.textPrimary,
    },
    // El borde de acento marca lo ya cargado sin necesidad de leer el numero.
    cajaCargada: { borderColor: colors.accent },
  });
