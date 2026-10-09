/* Frencia · SerieComparativa — las tres lecturas de una serie, en una grilla.
   Ver docs/specs/registro-de-sesion.md seccion 6.2

   Lo que indico quien armo la rutina, lo que se hizo la vez anterior y lo que
   se esta cargando ahora son el mismo dato en tres momentos, asi que van en la
   misma grilla: mismas columnas, mismo orden, misma tipografia. Alineadas, la
   comparacion se lee de arriba hacia abajo sin que nadie la explique.

   Las columnas salen de los datos que registra el ejercicio, en el orden fijo
   del design system: peso, reps, tiempo, distancia e intensidad. Lo que el
   ejercicio no registra no tiene columna.

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

/** Una columna de la grilla: el mismo dato en las tres filas. */
export interface ColumnaSerie {
  key: string;
  /** Encabezado: "kg", "Reps", "RIR", "Tiempo", "km". */
  label: string;
  /** Lo indicado por quien armo la rutina. null = el plan no lo dice. */
  plan: string | null;
  /** Lo hecho la vez anterior. null = sin registro. */
  anterior: string | null;
  /** Lo que se esta cargando ahora. '' = todavia no. */
  hoy: string;
  /** Sin handler la celda de hoy es solo lectura: el dato se carga con un
   *  campo propio fuera de la grilla (el tiempo y la distancia del cardio). */
  onHoy?: (texto: string) => void;
  teclado?: 'decimal-pad' | 'number-pad';
  /** Nombre del dato para el lector de pantalla: "Peso en kg". */
  accesible: string;
}

export interface SerieComparativaProps {
  columnas: ColumnaSerie[];
  /** Hace cuanto fue la vez anterior. null = sin registro en la ventana. */
  cuandoAnterior: string | null;
  /** Sin la fila de hoy la grilla es solo referencia: lo de hoy se carga en
   *  campos propios fuera de ella (el cardio). */
  mostrarHoy?: boolean;
  /** Amplia: mas aire entre filas y cajas de hoy mas altas, para la fuerza,
   *  donde la grilla es lo unico que se completa en la pantalla. */
  amplia?: boolean;
}

export function SerieComparativa({
  columnas,
  cuandoAnterior,
  mostrarHoy = true,
  amplia = false,
}: SerieComparativaProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.grilla, amplia && styles.grillaAmplia]}>
      {/* Encabezado de columnas, una sola vez para las tres filas */}
      <View style={styles.fila}>
        <View style={styles.etiqueta} />
        {columnas.map((c) => (
          <View key={c.key} style={styles.celda}>
            <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.centrado}>
              {c.label}
            </FrenciaText>
          </View>
        ))}
      </View>

      <Referencia
        etiqueta="Rutina"
        detalle={null}
        valores={columnas.map((c) => c.plan)}
        amplia={amplia}
        styles={styles}
        colors={colors}
      />

      <Referencia
        etiqueta="Última"
        detalle={cuandoAnterior ?? 'sin registro'}
        valores={columnas.map((c) => (cuandoAnterior ? c.anterior : null))}
        amplia={amplia}
        styles={styles}
        colors={colors}
      />

      {/* Hoy: la unica fila con cajas, porque es la unica que se completa. */}
      {mostrarHoy ? (
        <View style={[styles.fila, styles.filaHoy, amplia && styles.filaHoyAmplia]}>
          <View style={styles.etiqueta}>
            <FrenciaText role="dataLabel" color={colors.accentText}>
              Hoy
            </FrenciaText>
          </View>
          {columnas.map((c) => (
            <Caja key={c.key} columna={c} amplia={amplia} styles={styles} colors={colors} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* Fila de solo lectura. Los numeros van en la misma mono y en la misma columna
   que los de hoy, un punto mas chicos: se leen igual pero no compiten. */
function Referencia({
  etiqueta,
  detalle,
  valores,
  amplia,
  styles,
  colors,
}: {
  etiqueta: string;
  detalle: string | null;
  valores: (string | null)[];
  amplia: boolean;
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
          <View style={[styles.cajaRef, amplia && styles.cajaRefAmplia]}>
            {/* Un tiempo largo ("1:05:00") no entra en un tercio de pantalla:
               se achica en vez de cortarse. */}
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.numeroRef,
                amplia && styles.numeroRefAmplio,
                { color: v === null ? colors.textDisabled : colors.textSecondary },
              ]}
            >
              {v ?? VACIO}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Caja({
  columna,
  amplia,
  styles,
  colors,
}: {
  columna: ColumnaSerie;
  amplia: boolean;
  styles: ReturnType<typeof makeStyles>;
  colors: Palette;
}) {
  const cargado = columna.hoy !== '';

  if (!columna.onHoy) {
    return (
      <View style={styles.celda}>
        <View
          style={[
            styles.caja,
            amplia && styles.cajaAmplia,
            styles.cajaLectura,
            cargado && styles.cajaCargada,
          ]}
          accessible
          accessibilityLabel={`${columna.accesible}: ${cargado ? columna.hoy : 'sin cargar'}`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.numeroHoy,
              amplia && styles.numeroHoyAmplio,
              !cargado && { color: colors.textDisabled },
            ]}
          >
            {cargado ? columna.hoy : VACIO}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.celda}>
      <TextInput
        style={[
          styles.caja,
          styles.numeroHoy,
          amplia && styles.cajaAmplia,
          amplia && styles.numeroHoyAmplio,
          cargado && styles.cajaCargada,
        ]}
        value={columna.hoy}
        onChangeText={columna.onHoy}
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
      paddingHorizontal: space[1],
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
      borderTopColor: colors.surfaceGreenLine,
    },

    caja: {
      height: sizing.controlHLg,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    cajaLectura: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[1] },
    numeroHoy: {
      textAlign: 'center',
      fontFamily: mono.bold,
      fontSize: 24,
      color: colors.textPrimary,
    },
    // El borde de acento marca lo ya cargado sin necesidad de leer el numero.
    cajaCargada: { borderColor: colors.accent },

    // Variante amplia. Las referencias pierden la caja y quedan como numeros
    // sueltos: con menos bordes la grilla deja de leerse como planilla y las
    // unicas cajas de la pantalla son las que se completan.
    grillaAmplia: { gap: space[3] },
    cajaRefAmplia: {
      height: sizing.controlHMd,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    numeroRefAmplio: { fontSize: 22, lineHeight: 28 },
    filaHoyAmplia: { marginTop: space[2], paddingTop: space[5] },
    cajaAmplia: { height: 72 },
    numeroHoyAmplio: { fontSize: 32 },
  });
