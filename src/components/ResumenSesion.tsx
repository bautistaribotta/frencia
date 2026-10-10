/* Frencia · Resumen de la sesion — el ticket del design system
   (ui_kits/ios_app/SessionStub.jsx). Ver docs/specs/registro-de-sesion.md,
   seccion 6.4.

   Es el ultimo paso del wizard: se muestra antes de cerrar la sesion, asi un
   toque sin querer en Terminar no cierra nada. Hecho setea finished_at y
   vuelve al home; Volver a la sesion deja todo como estaba.

   Los recortes del ticket (muescas laterales y borde festoneado) son circulos
   del color del fondo de la app que la tarjeta recorta con overflow. */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
import { reloj } from '@/lib/tiempo';
import {
  Button,
  FrenciaText,
  display,
  mono,
  radius,
  sans,
  shadow,
  space,
  spacing,
  tracking,
  useThemedStyles,
  type Palette,
} from '@/design';

// Festones del borde inferior. Con space-between se reparten en el ancho que
// toque; once es lo que entra a 330 de ancho, el del design system.
const FESTONES = 11;
// El codigo se repite hasta cubrir el ancho; lo que sobra lo corta el contenedor.
const REPETICIONES_BARRAS = 3;

export interface ResumenSesionProps {
  sessionId: string;
  nombreDia: string;
  /** Arranque de la sesion, en epoch ms. */
  inicio: number;
  duracionSegundos: number;
  ejercicios: EjercicioResumen[];
  unidad: UnidadPeso;
  unidadDistancia: UnidadDistancia;
  guardando: boolean;
  onVolver: () => void;
  onCompartir: () => void;
  onHecho: () => void;
}

export function ResumenSesion({
  sessionId,
  nombreDia,
  inicio,
  duracionSegundos,
  ejercicios,
  unidad,
  unidadDistancia,
  guardando,
  onVolver,
  onCompartir,
  onHecho,
}: ResumenSesionProps) {
  const styles = useThemedStyles(makeStyles);

  const series = useMemo(() => ejercicios.flatMap((e) => e.series), [ejercicios]);
  const volumen = tieneVolumen(series) ? miles(mostrarPeso(volumenKg(series), unidad)) : '—';
  const { fecha, hora } = fechaTicket(inicio);
  const barras = useMemo(() => barrasTicket(sessionId), [sessionId]);

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Button variant="ghost" size="sm" icon="chevron-left" onPress={onVolver} disabled={guardando}>
          Volver a la sesión
        </Button>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sombra}>
          <View style={styles.ticket}>
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
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View style={[styles.muesca, styles.muescaIzq]} />
              <View style={[styles.muesca, styles.muescaDer]} />
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

            {/* Borde festoneado */}
            <View
              style={styles.festoneado}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <View style={styles.festones}>
                {Array.from({ length: FESTONES }).map((_, i) => (
                  <View key={i} style={styles.feston} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.acciones}>
        <Button
          variant="secondary"
          size="lg"
          icon="share"
          style={styles.accion}
          onPress={onCompartir}
          disabled={guardando}
        >
          Compartir
        </Button>
        <Button
          variant="primary"
          size="lg"
          icon="check"
          style={styles.accion}
          onPress={onHecho}
          loading={guardando}
        >
          Hecho
        </Button>
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

const ANCHO_TICKET = 360;
const MUESCA = 22;

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      flexDirection: 'row',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[5],
    },
    scroll: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.padScreen,
      paddingBottom: space[7],
    },
    // La sombra va en un contenedor aparte: en iOS overflow hidden la recorta.
    sombra: {
      width: '100%',
      maxWidth: ANCHO_TICKET,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      ...shadow.lg,
    },
    ticket: {
      backgroundColor: colors.surfaceCardElevated,
      borderTopLeftRadius: radius['2xl'],
      borderTopRightRadius: radius['2xl'],
      overflow: 'hidden',
    },

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

    perforacion: { height: 24, justifyContent: 'center' },
    muesca: {
      position: 'absolute',
      top: 1,
      width: MUESCA,
      height: MUESCA,
      borderRadius: MUESCA / 2,
      backgroundColor: colors.bgApp,
    },
    muescaIzq: { left: -MUESCA / 2 },
    muescaDer: { right: -MUESCA / 2 },
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
    conteo: { flex: 1, gap: space[1] },
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
    festones: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -MUESCA / 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: space[2],
    },
    feston: {
      width: MUESCA,
      height: MUESCA,
      borderRadius: MUESCA / 2,
      backgroundColor: colors.bgApp,
    },

    acciones: {
      flexDirection: 'row',
      gap: 10,
      alignSelf: 'center',
      width: '100%',
      maxWidth: ANCHO_TICKET + spacing.padScreen * 2,
      paddingHorizontal: spacing.padScreen,
      paddingBottom: space[5],
    },
    accion: { flex: 1 },
  });
