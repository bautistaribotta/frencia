/* Frencia · Ticket de una sesion — el SessionStub del design system
   (ui_kits/ios_app/SessionStub.jsx). Lo usan el resumen al terminar la sesion
   y el ticket de una sesion del historial. Ver docs/specs/registro-de-sesion.md,
   seccion 6.4.

   El fondo del ticket es una silueta SVG (src/lib/silueta-ticket.ts) con las
   muescas laterales y el borde festoneado recortados de verdad. La sombra la
   dibuja el mismo SVG con un desenfoque sobre esa forma: shadow* de iOS y
   elevation de Android siguen el rectangulo de la vista, y en el tema claro
   se veia una sombra recta debajo de los festones.

   `capturaRef` apunta al ticket con un margen del fondo de la app: es lo que
   se comparte como imagen, asi los recortes se leen en ella. */

import React, { useMemo, useState, type RefObject } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
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
  FrenciaText,
  display,
  mono,
  radius,
  sans,
  shadowSpecs,
  space,
  spacing,
  tracking,
  useTheme,
  useThemedStyles,
  type Palette,
  type ShadowSpec,
} from '@/design';

// Festones del borde inferior. Con space-between se reparten en el ancho que
// toque; once es lo que entra a ANCHO_TICKET (360), el ancho maximo del ticket.
const FESTONES = 11;
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
  const styles = useThemedStyles(makeStyles);
  const { colors, mode } = useTheme();
  // La silueta se dibuja con las medidas reales: el alto depende de cuantos
  // ejercicios haya y la perforacion, de cuanto ocupe el encabezado.
  const [tamano, setTamano] = useState<{ ancho: number; alto: number } | null>(null);
  const [yPerforacion, setYPerforacion] = useState<number | null>(null);

  function medirTicket(e: LayoutChangeEvent) {
    const { width, height } = e.nativeEvent.layout;
    setTamano((t) => (t?.ancho === width && t?.alto === height ? t : { ancho: width, alto: height }));
  }

  const series = useMemo(() => ejercicios.flatMap((e) => e.series), [ejercicios]);
  const volumen = tieneVolumen(series) ? miles(mostrarPeso(volumenKg(series), unidad)) : '—';
  const { fecha, hora } = fechaTicket(inicio);
  const barras = useMemo(() => barrasTicket(sessionId), [sessionId]);

  // collapsable en false: Android optimiza las vistas sin dibujo propio y la
  // captura no las encuentra.
  return (
    <View ref={capturaRef} collapsable={false} style={styles.captura}>
      <View style={styles.contenedorTicket}>
        <View style={styles.ticket} onLayout={medirTicket}>
          {tamano && yPerforacion !== null && (
            <SiluetaTicket
              ancho={tamano.ancho}
              alto={tamano.alto}
              yMuesca={yPerforacion + ALTO_PERFORACION / 2}
              relleno={colors.surfaceCardElevated}
              sombra={shadowSpecs[mode].lg}
            />
          )}

          {/* Encabezado */}
          <View style={styles.encabezado}>
            <View style={styles.marca}>
              <FrenciaText style={styles.marcaTexto}>FRENCIA</FrenciaText>
              <View style={styles.punto} />
            </View>
            {/* Dos textos y no un salto de linea: con el interlineado apretado
               del design system, iOS recorta el acento y el tope de Anton.
               Cada linea lleva su aire y la segunda se sube sobre la primera. */}
            <View accessible accessibilityRole="header" accessibilityLabel="Sesión completa">
              <FrenciaText style={[styles.completa, styles.completaPrimera]}>Sesión</FrenciaText>
              <FrenciaText style={[styles.completa, styles.completaSegunda]}>completa</FrenciaText>
            </View>
            <FrenciaText style={styles.meta} numberOfLines={2}>
              {nombreDia} · {fecha} · {hora}
            </FrenciaText>
          </View>

          {/* Duracion y volumen */}
          <View style={styles.grandes}>
            <View style={styles.grande} accessible accessibilityLabel={`Duración ${reloj(duracionSegundos)}`}>
              <FrenciaText style={styles.grandeValor}>{reloj(duracionSegundos)}</FrenciaText>
              <FrenciaText style={styles.etiqueta}>Duración</FrenciaText>
            </View>
            <View style={styles.separadorVertical} />
            <View style={styles.grande} accessible accessibilityLabel={`Tonelaje ${volumen} ${unidad}`}>
              <FrenciaText style={styles.grandeValor}>{volumen}</FrenciaText>
              <FrenciaText style={styles.etiqueta}>Tonelaje · {unidad}</FrenciaText>
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
            <Conteo label="Ejercicios" valor={ejercicios.length} styles={styles} />
            <Conteo label="Series" valor={series.length} styles={styles} />
          </View>

          {/* Lo que se hizo, ejercicio por ejercicio */}
          <View style={styles.registro}>
            {ejercicios.map((ej, i) => {
              const marca = mejorMarca(ej, unidad, unidadDistancia);
              return (
                <View
                  key={ej.exerciseId}
                  style={[styles.fila, i < ejercicios.length - 1 && styles.filaDivisor]}
                  accessible
                  accessibilityLabel={`${ej.name}, ${ej.series.length} ${ej.series.length === 1 ? 'serie' : 'series'}${marca ? `, mejor ${marca}` : ''}`}
                >
                  <View style={styles.filaIzq}>
                    <FrenciaText style={styles.filaSeries}>{ej.series.length}×</FrenciaText>
                    <FrenciaText style={styles.filaNombre} numberOfLines={1}>
                      {ej.name}
                    </FrenciaText>
                  </View>
                  <FrenciaText style={styles.filaMarca}>{marca}</FrenciaText>
                </View>
              );
            })}
          </View>

          {/* Codigo de barras */}
          <View
            style={styles.codigo}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
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
            <FrenciaText style={styles.codigoTexto}>{codigoTicket(sessionId)}</FrenciaText>
          </View>

          {/* Lugar para el borde festoneado, que dibuja la silueta */}
          <View style={styles.festoneado} />
        </View>
      </View>
    </View>
  );
}

function Conteo({
  label,
  valor,
  styles,
}: {
  label: string;
  valor: number;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.conteo} accessible accessibilityLabel={`${label} ${valor}`}>
      <FrenciaText style={styles.etiqueta}>{label}</FrenciaText>
      <FrenciaText style={styles.conteoValor}>{valor}</FrenciaText>
    </View>
  );
}

/** Fondo y sombra del ticket con la forma recortada. Va detras del contenido y
 *  se sale de la vista por los cuatro lados para que entre el desenfoque. */
function SiluetaTicket({
  ancho,
  alto,
  yMuesca,
  relleno,
  sombra,
}: {
  ancho: number;
  alto: number;
  yMuesca: number;
  relleno: string;
  sombra: ShadowSpec;
}) {
  const d = useMemo(
    () =>
      pathSilueta({
        ancho,
        alto,
        radio: radius['2xl'],
        yMuesca,
        radioRecorte: MUESCA / 2,
        festones: FESTONES,
        margenFestones: space[2],
      }),
    [ancho, alto, yMuesca],
  );

  // El blur de CSS es el doble del desvio del gaussiano; tres desvios cubren
  // practicamente toda la sombra.
  const desvio = sombra.blur / 2;
  const margen = Math.ceil(desvio * 3 + Math.abs(sombra.y));
  const lienzo = { ancho: ancho + margen * 2, alto: alto + margen * 2 };

  return (
    <Svg
      width={lienzo.ancho}
      height={lienzo.alto}
      style={[estaticos.silueta, { left: -margen, top: -margen }]}
    >
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
        <Path d={d} fill={relleno} />
      </G>
    </Svg>
  );
}

/** Ancho maximo del ticket; las acciones de la pantalla se alinean con el. */
export const ANCHO_TICKET = 360;
// Diametro de las muescas laterales y de los festones.
const MUESCA = 22;
const ALTO_PERFORACION = 24;
/** Aire de la captura alrededor del ticket: abajo mas que arriba porque la
 *  sombra cae hacia abajo. El marco de la pantalla lo descuenta de su scroll. */
export const MARGEN_CAPTURA = { arriba: space[5], abajo: space[8] };

const estaticos = StyleSheet.create({
  silueta: { position: 'absolute', pointerEvents: 'none' },
});

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    // El margen de la imagen compartida: el mismo de la pantalla a los lados.
    captura: {
      width: '100%',
      maxWidth: ANCHO_TICKET + spacing.padScreen * 2,
      alignItems: 'center',
      paddingHorizontal: spacing.padScreen,
      paddingTop: MARGEN_CAPTURA.arriba,
      paddingBottom: MARGEN_CAPTURA.abajo,
      backgroundColor: colors.bgApp,
    },
    contenedorTicket: { width: '100%', maxWidth: ANCHO_TICKET },
    // Sin fondo ni overflow: la forma y la sombra las pone la silueta, que
    // se sale de la vista por los costados.
    ticket: {},

    encabezado: {
      alignItems: 'center',
      paddingTop: 26,
      paddingHorizontal: space[7],
      paddingBottom: space[6],
    },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
    marcaTexto: {
      fontFamily: display,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: 1,
      color: colors.textPrimary,
    },
    punto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
    completa: {
      fontFamily: display,
      fontSize: 38,
      lineHeight: 48,
      textAlign: 'center',
      textTransform: 'uppercase',
      color: colors.accent,
    },
    // El acento de la O sobresale mas que el tope de Anton: la primera linea
    // necesita mas alto, y la segunda sube lo mismo para no separarse.
    completaPrimera: { lineHeight: 58 },
    completaSegunda: { marginTop: -16 },
    meta: {
      fontFamily: mono.regular,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: tracking.wide,
      textAlign: 'center',
      textTransform: 'uppercase',
      color: colors.textTertiary,
      marginTop: space[4],
    },

    grandes: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: space[4],
      paddingTop: space[2],
      paddingHorizontal: space[7],
      paddingBottom: 22,
    },
    grande: { flex: 1, alignItems: 'center', gap: space[2] },
    grandeValor: {
      fontFamily: display,
      fontSize: 40,
      lineHeight: 50,
      color: colors.textPrimary,
    },
    separadorVertical: { width: 1, backgroundColor: colors.divider },
    etiqueta: {
      fontFamily: mono.medium,
      fontSize: 9,
      lineHeight: 12,
      letterSpacing: tracking.wider,
      textTransform: 'uppercase',
      color: colors.textTertiary,
    },

    perforacion: { height: ALTO_PERFORACION, justifyContent: 'center' },
    lineaRecorte: { height: 2, marginHorizontal: 18, overflow: 'hidden' },
    lineaPunteada: {
      height: 6,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
      borderRadius: 1,
    },

    conteos: {
      flexDirection: 'row',
      gap: space[5],
      paddingTop: 18,
      paddingHorizontal: space[7],
      paddingBottom: space[3],
    },
    conteo: { flex: 1, alignItems: 'center', gap: space[1] },
    conteoValor: {
      fontFamily: mono.bold,
      fontSize: 18,
      lineHeight: 24,
      color: colors.textPrimary,
    },

    registro: { paddingTop: space[4], paddingHorizontal: space[7], paddingBottom: space[2] },
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: space[4],
      paddingVertical: 9,
    },
    filaDivisor: { borderBottomWidth: 1, borderBottomColor: colors.divider },
    filaIzq: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7 },
    filaSeries: {
      fontFamily: mono.regular,
      fontSize: 11,
      lineHeight: 16,
      color: colors.textTertiary,
    },
    filaNombre: {
      flexShrink: 1,
      fontFamily: sans.regular,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    filaMarca: {
      fontFamily: mono.semibold,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textPrimary,
    },

    codigo: {
      alignItems: 'center',
      gap: space[3],
      paddingTop: space[6],
      paddingHorizontal: space[7],
      paddingBottom: 14,
    },
    barras: {
      alignSelf: 'stretch',
      height: 46,
      flexDirection: 'row',
      overflow: 'hidden',
      opacity: 0.92,
    },
    barra: { height: '100%', backgroundColor: colors.textPrimary },
    codigoTexto: {
      fontFamily: mono.regular,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: tracking.widest,
      color: colors.textTertiary,
    },

    festoneado: { height: 14 },

  });
