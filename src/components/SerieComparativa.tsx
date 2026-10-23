/* Frencia · SerieComparativa — las tres lecturas de una serie, en una grilla (Lume).
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
     - el orden fijo rutina > ultima > hoy, que es una linea de tiempo;
     - rutina y ultima son numeros sueltos en una tabla con hairlines; hoy es
       la unica fila con celdas de vidrio, porque es la unica que se completa.
       La celda en foco toma el borde de lume con su brillo y la ya cargada
       pasa a vidrio fuerte. */

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  LumeText,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';

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
   *  campos propios fuera de ella (el cardio y los isometricos). */
  mostrarHoy?: boolean;
  /** Amplia: numeros y celdas de hoy mas grandes, para la fuerza, donde la
   *  grilla es lo unico que se completa en la pantalla. */
  amplia?: boolean;
}

export function SerieComparativa({
  columnas,
  cuandoAnterior,
  mostrarHoy = true,
  amplia = false,
}: SerieComparativaProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);

  return (
    <View>
      {/* Encabezado de columnas, una sola vez para las tres filas */}
      <View style={[styles.fila, styles.filaCabeza]}>
        <View style={styles.etiqueta} />
        {columnas.map((c) => (
          <View key={c.key} style={styles.celda}>
            <LumeText rol="label" color={t.textTertiary} style={styles.centrado} numberOfLines={1}>
              {c.label}
            </LumeText>
          </View>
        ))}
      </View>

      <Referencia
        etiqueta="Rutina"
        detalle={null}
        valores={columnas.map((c) => c.plan)}
        amplia={amplia}
      />

      <Referencia
        etiqueta="Última"
        detalle={cuandoAnterior ?? 'sin registro'}
        valores={columnas.map((c) => (cuandoAnterior ? c.anterior : null))}
        amplia={amplia}
      />

      {/* Hoy: la unica fila con celdas, porque es la unica que se completa. */}
      {mostrarHoy ? (
        <View style={[styles.fila, styles.filaHoy]}>
          <View style={styles.etiqueta}>
            <LumeText rol="label" color={t.signalText}>
              Hoy
            </LumeText>
          </View>
          {columnas.map((c) => (
            <Caja key={c.key} columna={c} amplia={amplia} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* Fila de solo lectura: numeros sueltos, un punto mas chicos que los de hoy y
   en texto secundario. Se leen igual pero no compiten. */
function Referencia({
  etiqueta,
  detalle,
  valores,
  amplia,
}: {
  etiqueta: string;
  detalle: string | null;
  valores: (string | null)[];
  amplia: boolean;
}) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  return (
    <View style={[styles.fila, styles.conLinea]}>
      <View style={styles.etiqueta}>
        <LumeText rol="label" color={t.textTertiary}>
          {etiqueta}
        </LumeText>
        {detalle ? (
          <LumeText rol="label" color={t.textDisabled} numberOfLines={1}>
            {detalle}
          </LumeText>
        ) : null}
      </View>
      {valores.map((v, i) => (
        <View key={i} style={[styles.celda, styles.ref]}>
          {/* Un tiempo largo ("1:05:00") no entra en un tercio de pantalla:
             se achica en vez de cortarse. */}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.numeroRef,
              amplia && styles.numeroRefAmplio,
              v === null && styles.numeroVacio,
            ]}
          >
            {v ?? VACIO}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Caja({ columna, amplia }: { columna: ColumnaSerie; amplia: boolean }) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const [foco, setFoco] = useState(false);
  const cargado = columna.hoy !== '';

  const caja = [styles.caja, amplia && styles.cajaAmplia, cargado && styles.cajaCargada, foco && styles.cajaFoco];

  if (!columna.onHoy) {
    return (
      <View style={styles.celda}>
        <View
          style={[caja, styles.cajaLectura]}
          accessible
          accessibilityLabel={`${columna.accesible}: ${cargado ? columna.hoy : 'sin cargar'}`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.numeroHoy,
              amplia && styles.numeroHoyAmplio,
              !cargado && styles.numeroVacio,
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
      <View style={caja}>
        <TextInput
          style={[styles.entrada, styles.numeroHoy, amplia && styles.numeroHoyAmplio]}
          value={columna.hoy}
          onChangeText={columna.onHoy}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          keyboardType={columna.teclado ?? 'number-pad'}
          accessibilityLabel={columna.accesible}
          placeholder={VACIO}
          placeholderTextColor={t.textDisabled}
          selectionColor={t.signal}
          cursorColor={t.signal}
          maxLength={5}
          selectTextOnFocus
        />
      </View>
    </View>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[2], minHeight: 44 },
    filaCabeza: { minHeight: 28 },
    conLinea: { borderTopWidth: 1, borderTopColor: t.divider },
    // Ancho fijo: es lo que mantiene las columnas alineadas entre las tres
    // filas, que es todo el punto de la grilla.
    etiqueta: { width: 72, gap: 2 },
    celda: { flex: 1, minWidth: 0 },
    centrado: { textAlign: 'center' },

    ref: { height: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: lumeSpace[1] },
    numeroRef: {
      fontFamily: lumeFuente.condMedium,
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: -0.3,
      textAlign: 'center',
      includeFontPadding: false,
      fontVariant: ['tabular-nums'],
      color: t.textSecondary,
    },
    numeroRefAmplio: { fontSize: 22, lineHeight: 26 },
    numeroVacio: { color: t.textDisabled },

    // Hoy se separa con una linea mas marcada y algo de aire: es el corte entre
    // lo que se mira y lo que se hace.
    filaHoy: {
      borderTopWidth: 1,
      paddingTop: lumeSpace[4],
      marginTop: lumeSpace[2],
      borderTopColor: t.borderDefault,
    },

    caja: {
      height: lumeLayout.controlHLg,
      borderRadius: lumeRadius.lg,
      borderWidth: 1,
      backgroundColor: t.surfaceCard,
      borderColor: t.glassLine,
      borderTopColor: t.glassHighlight,
      boxShadow: sombras.glass,
    },
    cajaCargada: { backgroundColor: t.surfaceCardElevated },
    cajaFoco: {
      backgroundColor: t.surfaceCardElevated,
      borderColor: t.signal,
      borderTopColor: t.signal,
      boxShadow: sombras.haloSignal,
    },
    cajaAmplia: { height: 72 },
    cajaLectura: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: lumeSpace[1] },
    entrada: { flex: 1, padding: 0, textAlignVertical: 'center' },
    numeroHoy: {
      textAlign: 'center',
      fontFamily: lumeFuente.condMedium,
      fontSize: 28,
      letterSpacing: -0.56,
      includeFontPadding: false,
      fontVariant: ['tabular-nums'],
      color: t.textPrimary,
    },
    numeroHoyAmplio: { fontSize: 38, letterSpacing: -0.76 },
  });
