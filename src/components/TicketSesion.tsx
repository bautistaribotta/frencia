/* Frencia · Ticket de una sesion — el SessionStub del design system
   (ui_kits/ios_app/SessionStub.jsx). Lo usan el resumen al terminar la sesion
   y el ticket de una sesion del historial. Ver docs/specs/registro-de-sesion.md,
   seccion 6.4.

   Va en Lume: vidrio denso (surface-raised) con su filo, el encabezado
   alineado a la izquierda, la marca con el punto en lume y el borde de abajo
   recto. El fondo es una silueta SVG (src/lib/silueta-ticket.ts) con las
   muescas laterales recortadas de verdad. La sombra la
   dibuja el mismo SVG con un desenfoque sobre esa forma: shadow* de iOS y
   elevation de Android siguen el rectangulo de la vista, y en el tema claro
   se veia una sombra recta que no seguia los recortes.

   `capturaRef` apunta al ticket con un margen transparente alrededor: es lo
   que se comparte como imagen. La captura no lleva fondo propio (sobre las
   luces se veia como un bloque); por eso el ticket va en la version opaca
   del vidrio, asi se ve igual en pantalla y en la imagen. */

import React, { useMemo, useState, type RefObject } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, FeGaussianBlur, FeOffset, Filter, G, Path } from 'react-native-svg';

import type { UnidadDistancia } from '@/lib/distancia';
import { mostrarPeso, type UnidadPeso } from '@/lib/peso';
import {
  barrasTicket,
  codigoTicket,
  fechaTicket,
  mejorMarca,
  miles,
  tieneVolumen,
  volumenKg,
  type EjercicioResumen,
} from '@/lib/resumen-sesion';
import { pathSilueta } from '@/lib/silueta-ticket';
import { reloj } from '@/lib/tiempo';
import {
  lumeFuente,
  lumeLayout,
  lumePalette,
  lumeRadius,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';

// El codigo se repite hasta cubrir el ancho; lo que sobra lo corta el contenedor.
const REPETICIONES_BARRAS = 3;

export interface TicketSesionProps {
  sessionId: string;
  nombreDia: string;
  /** Arranque de la sesion, en epoch ms. */
  inicio: number;
  duracionSegundos: number;
  ejercicios: EjercicioResumen[];
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  /** Lo que se captura como imagen al compartir. */
  capturaRef: RefObject<View | null>;
}

export function TicketSesion({
  sessionId,
  nombreDia,
  inicio,
  duracionSegundos,
  ejercicios,
  unidad,
  unidadDistancia,
  capturaRef,
}: TicketSesionProps) {
  const { t, modo } = useLume();
  const styles = useLumeStyles(makeStyles);
  // La silueta se dibuja con las medidas reales: el alto depende de cuantos
  // ejercicios haya y la perforacion, de cuanto ocupe el encabezado.
  const [tamano, setTamano] = useState<{ ancho: number; alto: number } | null>(null);
  const [yPerforacion, setYPerforacion] = useState<number | null>(null);

  function medirTicket(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setTamano((x) => (x?.ancho === width && x?.alto === height ? x : { ancho: width, alto: height }));
  }

  const series = useMemo(() => ejercicios.flatMap((e) => e.series), [ejercicios]);
  const volumen = tieneVolumen(series) ? miles(mostrarPeso(volumenKg(series), unidad)) : '—';
  const { fecha, hora } = fechaTicket(inicio);
  const barras = useMemo(() => barrasTicket(sessionId), [sessionId]);
  const numero = sessionId.replace(/-/g, '').slice(0, 6).toUpperCase();

  // collapsable en false: Android optimiza las vistas sin dibujo propio y la
  // captura no las encuentra.
  return (
    <View ref={capturaRef} collapsable={false} style={styles.captura}>
      <View style={styles.contenedorTicket}>
        <View onLayout={medirTicket}>
          {tamano && yPerforacion !== null && (
            <SiluetaTicket
              ancho={tamano.ancho}
              alto={tamano.alto}
              yMuesca={yPerforacion + ALTO_PERFORACION / 2}
              relleno={t.surfaceRaisedOpaco}
              filo={t.glassLine}
              sombra={SOMBRA[modo]}
            />
          )}

          {/* Encabezado */}
          <View style={styles.encabezado}>
            <View style={styles.marca}>
              <View style={styles.marcaNombre}>
                <Text style={styles.marcaTexto}>FRENCIA</Text>
                <View style={styles.punto} />
              </View>
              <Text style={styles.meta}>Nº {numero}</Text>
            </View>
            <Text style={styles.completa} accessibilityRole="header">
              Sesión completa
            </Text>
            <Text style={styles.meta} numberOfLines={2}>
              {nombreDia} · {fecha} · {hora}
            </Text>
          </View>

          {/* Duracion y volumen */}
          <View style={styles.grandes}>
            <View style={styles.grande} accessible accessibilityLabel={`Duración ${reloj(duracionSegundos)}`}>
              <Text style={styles.etiqueta}>Duración</Text>
              <Text style={styles.grandeValor}>{reloj(duracionSegundos)}</Text>
            </View>
            <View style={styles.separadorVertical} />
            <View
              style={[styles.grande, styles.grandeSegundo]}
              accessible
              accessibilityLabel={`Tonelaje ${volumen} ${unidad}`}
            >
              <Text style={styles.etiqueta}>Tonelaje · {unidad}</Text>
              <Text style={styles.grandeValor}>{volumen}</Text>
            </View>
          </View>

          {/* Perforacion */}
          <View
            style={styles.perforacion}
            onLayout={(e) => setYPerforacion(e.nativeEvent.layout.y)}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {/* iOS no dibuja un borde punteado de un solo lado: se dibuja la
               caja entera y se deja ver solo su borde de arriba. */}
            <View style={styles.lineaRecorte}>
              <View style={styles.lineaPunteada} />
            </View>
          </View>

          {/* Conteos */}
          <View style={styles.conteos}>
            <Conteo label="Ejercicios" valor={ejercicios.length} />
            <Conteo label="Series" valor={series.length} />
          </View>

          {/* Lo que se hizo, ejercicio por ejercicio */}
          <View style={styles.registro}>
            {ejercicios.map((ej, i) => {
              const marca = mejorMarca(ej, unidad, unidadDistancia);
              return (
                <View
                  key={ej.exerciseId}
                  style={[styles.fila, i > 0 && styles.filaConLinea]}
                  accessible
                  accessibilityLabel={`${ej.name}, ${ej.series.length} ${ej.series.length === 1 ? 'serie' : 'series'}${marca ? `, mejor ${marca}` : ''}`}
                >
                  <View style={styles.filaIzq}>
                    <Text style={styles.filaSeries}>{ej.series.length}×</Text>
                    <Text style={styles.filaNombre} numberOfLines={1}>
                      {ej.name}
                    </Text>
                  </View>
                  <Text style={styles.filaMarca}>{marca}</Text>
                </View>
              );
            })}
          </View>

          {/* Codigo de barras */}
          <View style={styles.codigo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.barras}>
              {Array.from({ length: REPETICIONES_BARRAS }).flatMap((_, r) =>
                barras.map((b, i) => (
                  <View
                    key={`${r}-${i}`}
                    style={[styles.barra, { width: b.barra, marginRight: b.espacio }]}
                  />
                )),
              )}
            </View>
            <Text style={styles.codigoTexto}>{codigoTicket(sessionId)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Conteo({ label, valor }: { label: string; valor: number }) {
  const styles = useLumeStyles(makeStyles);
  return (
    <View style={styles.conteo} accessible accessibilityLabel={`${label} ${valor}`}>
      <Text style={styles.etiqueta}>{label}</Text>
      <Text style={styles.conteoValor}>{valor}</Text>
    </View>
  );
}

interface SombraTicket {
  y: number;
  blur: number;
  color: string;
  opacity: number;
}

// La sombra lejana de Lume (shadow-lg): 0 24 56, negra al 55 % en oscuro y
// tinta al 14 % en claro.
const SOMBRA: Record<'dark' | 'light', SombraTicket> = {
  dark: { y: 24, blur: 56, color: lumePalette.graphite1000, opacity: 0.55 },
  light: { y: 24, blur: 56, color: lumePalette.ivory900, opacity: 0.14 },
};

/** Fondo, filo y sombra del ticket con la forma recortada. Va detras del
 *  contenido y se sale de la vista por los cuatro lados para que entre el
 *  desenfoque. */
function SiluetaTicket({
  ancho,
  alto,
  yMuesca,
  relleno,
  filo,
  sombra,
}: {
  ancho: number;
  alto: number;
  yMuesca: number;
  relleno: string;
  filo: string;
  sombra: SombraTicket;
}) {
  const styles = useLumeStyles(makeStyles);
  const d = useMemo(
    () =>
      pathSilueta({
        ancho,
        alto,
        radio: RADIO,
        yMuesca,
        radioRecorte: MUESCA / 2,
        festones: 0,
        radioAbajo: RADIO,
        margenFestones: 0,
      }),
    [ancho, alto, yMuesca],
  );

  // El blur de CSS es el doble del desvio del gaussiano; tres desvios cubren
  // practicamente toda la sombra.
  const desvio = sombra.blur / 2;
  const margen = Math.ceil(desvio * 3 + Math.abs(sombra.y));
  const lienzo = { ancho: ancho + margen * 2, alto: alto + margen * 2 };

  return (
    <Svg width={lienzo.ancho} height={lienzo.alto} style={[styles.silueta, { left: -margen, top: -margen }]}>
      <Defs>
        <Filter
          id="sombra-ticket"
          filterUnits="userSpaceOnUse"
          x={-margen}
          y={-margen}
          width={lienzo.ancho}
          height={lienzo.alto}
        >
          <FeGaussianBlur stdDeviation={desvio} />
          <FeOffset dx={0} dy={sombra.y} />
        </Filter>
      </Defs>
      <G transform={`translate(${margen} ${margen})`}>
        <Path d={d} fill={sombra.color} fillOpacity={sombra.opacity} filter="url(#sombra-ticket)" />
        <Path d={d} fill={relleno} stroke={filo} strokeWidth={1} />
      </G>
    </Svg>
  );
}

/** Ancho maximo del ticket; las acciones de la pantalla se alinean con el. */
export const ANCHO_TICKET = 342;
// Radio de las esquinas y diametro de las muescas laterales.
const RADIO = lumeRadius.xl;
const MUESCA = 20;
const ALTO_PERFORACION = 24;
/** Aire de la captura alrededor del ticket: abajo mas que arriba porque la
 *  sombra cae hacia abajo. El marco de la pantalla lo descuenta de su scroll. */
export const MARGEN_CAPTURA = { arriba: lumeSpace[5], abajo: lumeSpace[8] };

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    silueta: { position: 'absolute', pointerEvents: 'none' },
    // El margen de la imagen compartida: el mismo de la pantalla a los lados,
    // sin fondo.
    captura: {
      width: '100%',
      maxWidth: ANCHO_TICKET + lumeLayout.padScreen * 2,
      alignItems: 'center',
      paddingHorizontal: lumeLayout.padScreen,
      paddingTop: MARGEN_CAPTURA.arriba,
      paddingBottom: MARGEN_CAPTURA.abajo,
    },
    contenedorTicket: { width: '100%', maxWidth: ANCHO_TICKET },

    encabezado: {
      alignItems: 'flex-start',
      gap: lumeSpace[4],
      paddingTop: lumeSpace[6],
      paddingHorizontal: lumeSpace[6],
      paddingBottom: lumeSpace[5],
    },
    marca: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    marcaNombre: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    marcaTexto: {
      fontFamily: lumeFuente.condBold,
      fontSize: 13,
      lineHeight: 16,
      letterSpacing: 1.8,
      color: t.textPrimary,
    },
    punto: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 6,
      backgroundColor: t.signal,
      boxShadow: sombras.haloSignal,
    },
    completa: {
      fontFamily: lumeFuente.medium,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.9,
      color: t.textPrimary,
    },
    meta: {
      fontFamily: lumeFuente.monoRegular,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.44,
      textTransform: 'uppercase',
      color: t.textTertiary,
    },

    grandes: {
      flexDirection: 'row',
      paddingTop: lumeSpace[2],
      paddingHorizontal: lumeSpace[6],
      paddingBottom: lumeSpace[6],
    },
    grande: { flex: 1, alignItems: 'flex-start', gap: lumeSpace[2] },
    grandeSegundo: { paddingLeft: lumeSpace[5] },
    grandeValor: {
      fontFamily: lumeFuente.condMedium,
      fontSize: 44,
      lineHeight: 46,
      letterSpacing: -1.76,
      fontVariant: ['tabular-nums'],
      color: t.textPrimary,
    },
    separadorVertical: { width: 1, backgroundColor: t.divider },
    etiqueta: {
      fontFamily: lumeFuente.semiSemibold,
      fontSize: 9.5,
      lineHeight: 12,
      letterSpacing: 0.76,
      textTransform: 'uppercase',
      color: t.textTertiary,
    },

    perforacion: { height: ALTO_PERFORACION, justifyContent: 'center', paddingHorizontal: 20 },
    lineaRecorte: { height: 1, overflow: 'hidden' },
    lineaPunteada: { height: 4, borderWidth: 1, borderStyle: 'dashed', borderRadius: 1, borderColor: t.borderStrong },

    // Los conteos se reparten parejo: el mismo espacio entre ellos y contra los
    // bordes del ticket.
    conteos: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      paddingTop: lumeSpace[5],
      paddingBottom: lumeSpace[2],
    },
    conteo: { alignItems: 'center', gap: lumeSpace[1] },
    conteoValor: {
      fontFamily: lumeFuente.condMedium,
      fontSize: 22,
      lineHeight: 26,
      fontVariant: ['tabular-nums'],
      color: t.textPrimary,
    },

    registro: { paddingTop: lumeSpace[3], paddingHorizontal: lumeSpace[6], paddingBottom: lumeSpace[2] },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: lumeSpace[4],
      paddingVertical: 10,
    },
    filaConLinea: { borderTopWidth: 1, borderTopColor: t.divider },
    filaIzq: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3] },
    filaSeries: { fontFamily: lumeFuente.monoRegular, fontSize: 11, lineHeight: 14, color: t.textTertiary },
    filaNombre: {
      flexShrink: 1,
      fontFamily: lumeFuente.regular,
      fontSize: 13,
      lineHeight: 18,
      color: t.textSecondary,
    },
    filaMarca: {
      fontFamily: lumeFuente.semibold,
      fontSize: 13,
      lineHeight: 18,
      fontVariant: ['tabular-nums'],
      color: t.textPrimary,
    },

    codigo: {
      alignItems: 'stretch',
      gap: lumeSpace[3],
      paddingTop: lumeSpace[5],
      paddingHorizontal: lumeSpace[6],
      paddingBottom: lumeSpace[6],
    },
    barras: { height: 36, flexDirection: 'row', overflow: 'hidden' },
    barra: { height: '100%', backgroundColor: t.textPrimary },
    codigoTexto: {
      fontFamily: lumeFuente.monoRegular,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.76,
      textAlign: 'center',
      color: t.textTertiary,
    },
  });
