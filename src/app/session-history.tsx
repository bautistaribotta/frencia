/* Frencia · Detalle de un entrenamiento terminado.
   Muestra las series guardadas en la sesion, sin reconstruirlas desde el plan
   actual ni ofrecer controles que puedan cambiar un registro historico. */

import React, { useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { CargaCentrada } from '@/components/CargaCentrada';
import { MarqueeText } from '@/components/MarqueeText';
import { reloj } from '@/lib/tiempo';
import { distanciaTabla, type UnidadDistancia } from '@/lib/distancia';
import type { DatosRegistrados } from '@/lib/exercises';
import { mostrarPeso, type UnidadPeso } from '@/lib/peso';
import {
  cargarDetalleSesion,
  duracionSesion,
  fechaSesion,
  type ResultadoDetalleSesion,
  type SerieRealizada,
} from '@/lib/session-history';
import {
  Badge,
  Button,
  FrenciaText,
  Icon,
  display,
  mono,
  radius,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

interface LecturaDetalle {
  userId: string;
  sessionId: string;
  intento: number;
  resultado: ResultadoDetalleSesion | null;
}

interface SeccionEjercicio {
  key: string;
  name: string;
  tracks: DatosRegistrados;
  data: SerieRealizada[];
}

/** null si la serie no tiene intensidad (cardio sin RPE). */
function esfuerzoSerie(serie: SerieRealizada): string | null {
  if (serie.intensityKind === null || serie.intensityValue === null) return null;
  if (serie.intensityKind === 'rir' && serie.intensityValue === -1) return 'Al fallo';
  return `${serie.intensityKind.toUpperCase()} ${serie.intensityValue}`;
}

/** Los datos de la serie que registra el ejercicio, cada uno con su unidad
 *  aparte: "82.5 kg", "10 reps", "30:00", "5.04 km". */
function datosSerie(
  serie: SerieRealizada,
  tracks: DatosRegistrados,
  unidad: UnidadPeso,
  unidadDistancia: UnidadDistancia,
): { valor: string; unidad: string | null; accesible: string }[] {
  const datos: { valor: string; unidad: string | null; accesible: string }[] = [];
  if (tracks.weight && serie.weightKg !== null) {
    const peso = String(mostrarPeso(serie.weightKg, unidad));
    datos.push({ valor: peso, unidad, accesible: `${peso} ${unidad}` });
  }
  if (tracks.reps && serie.reps !== null) {
    datos.push({ valor: String(serie.reps), unidad: 'reps', accesible: `${serie.reps} repeticiones` });
  }
  if (tracks.duration && serie.durationSeconds !== null) {
    const tiempo = reloj(serie.durationSeconds);
    datos.push({ valor: tiempo, unidad: null, accesible: tiempo });
  }
  if (tracks.distance && serie.distanceM !== null) {
    const dist = distanciaTabla(serie.distanceM, unidadDistancia);
    datos.push({ valor: dist, unidad: unidadDistancia, accesible: `${dist} ${unidadDistancia}` });
  }
  return datos;
}

export default function SessionHistoryScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user, initializing } = useSession();
  const { profile } = useProfile();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = typeof id === 'string' && id.length > 0 ? id : null;
  const userId = user?.id ?? null;
  const unidad = profile?.unidadPeso ?? 'kg';
  const unidadDistancia = profile?.unidadDistancia ?? 'km';

  const [lectura, setLectura] = useState<LecturaDetalle | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!userId || !sessionId) return;

    const controller = new AbortController();
    const propietario = { userId, sessionId, intento };

    async function cargar() {
      let resultado: ResultadoDetalleSesion;
      try {
        resultado = await cargarDetalleSesion(
          propietario.userId,
          propietario.sessionId,
          controller.signal,
        );
      } catch {
        resultado = { estado: 'error' };
      }
      if (!controller.signal.aborted) setLectura({ ...propietario, resultado });
    }

    void cargar();
    return () => controller.abort();
  }, [userId, sessionId, intento]);

  // Se comprueba el propietario antes del render: el efecto de una cuenta o
  // ruta nueva todavia puede no haberse ejecutado y conservar la lectura vieja.
  const resultado =
    lectura?.userId === userId &&
    lectura?.sessionId === sessionId &&
    lectura?.intento === intento
      ? lectura.resultado
      : null;
  const noEncontrada =
    !sessionId || (!userId && !initializing) || resultado?.estado === 'no-encontrada';
  const sesion = resultado?.estado === 'ok' ? resultado.sesion : null;
  const secciones = useMemo<SeccionEjercicio[]>(
    () => sesion?.ejercicios.map((ejercicio) => ({
      key: ejercicio.exerciseId,
      name: ejercicio.name,
      tracks: ejercicio.tracks,
      data: ejercicio.series,
    })) ?? [],
    [sesion],
  );
  const totalSeries = secciones.reduce((total, seccion) => total + seccion.data.length, 0);

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/history');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Button variant="ghost" size="sm" icon="chevron-left" style={styles.boton} onPress={volver}>
          Atrás
        </Button>
      </View>

      {noEncontrada ? (
        <View style={styles.centro}>
          <FrenciaText role="subtitle" style={styles.centerText}>
            No encontramos este entrenamiento
          </FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
            Puede que ya no esté disponible en tu historial.
          </FrenciaText>
        </View>
      ) : resultado?.estado === 'error' ? (
        <View style={styles.centro}>
          <FrenciaText role="subtitle" style={styles.centerText}>
            No pudimos cargar el entrenamiento
          </FrenciaText>
          <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
            Comprueba tu conexión y vuelve a intentarlo.
          </FrenciaText>
          <Button variant="secondary" style={styles.boton} onPress={() => setIntento((n) => n + 1)}>
            Reintentar
          </Button>
        </View>
      ) : !sesion ? (
        <CargaCentrada texto="Cargando entrenamiento…" />
      ) : (
        <SectionList<SerieRealizada, SeccionEjercicio>
          key={`${userId}:${sessionId}`}
          sections={secciones}
          keyExtractor={(serie) => serie.id}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          extraData={`${unidad}:${unidadDistancia}`}
          ListHeaderComponent={
            <View style={styles.intro}>
              <View style={styles.titulo}>
                <Badge tone="green">Completada</Badge>
                <FrenciaText role="display" style={styles.nombre} accessibilityRole="header">
                  {sesion.dayName ?? 'Día eliminado'}
                </FrenciaText>
                <FrenciaText role="data" color={colors.textSecondary}>
                  {fechaSesion(sesion.finishedAt)}
                </FrenciaText>
              </View>

              <View style={styles.resumen}>
                <View style={[styles.metrica, styles.duracion]}>
                  <FrenciaText role="dataLabel" color={colors.textSecondary}>Duración</FrenciaText>
                  <FrenciaText role="display" style={styles.valorMetrica}>
                    {duracionSesion(sesion.startedAt, sesion.finishedAt)}
                  </FrenciaText>
                </View>
                <View style={styles.metrica}>
                  <FrenciaText role="dataLabel" color={colors.textSecondary}>Series</FrenciaText>
                  <FrenciaText role="display" style={styles.valorMetrica}>{totalSeries}</FrenciaText>
                </View>
                <View style={styles.metrica}>
                  <FrenciaText role="dataLabel" color={colors.textSecondary}>Ejercicios</FrenciaText>
                  <FrenciaText role="display" style={styles.valorMetrica}>{secciones.length}</FrenciaText>
                </View>
              </View>

              {totalSeries > 0 && (
                <FrenciaText role="dataLabel" color={colors.textSecondary}>
                  Series realizadas
                </FrenciaText>
              )}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.ejercicio}>
              <MarqueeText text={section.name} role="subtitle" boxStyle={styles.ejercicioNombre} />
              <FrenciaText role="dataLabel" color={colors.textSecondary}>
                {section.data.length} {section.data.length === 1 ? 'serie' : 'series'}
              </FrenciaText>
            </View>
          )}
          renderItem={({ item: serie, section }) => {
            const datos = datosSerie(serie, section.tracks, unidad, unidadDistancia);
            const esfuerzo = esfuerzoSerie(serie);
            // Peso por reps se lee como un producto; los demas datos van uno
            // al lado del otro.
            const separador = section.tracks.weight && section.tracks.reps ? ' × ' : ' · ';
            const accesible = [datos.map((d) => d.accesible).join(', '), esfuerzo]
              .filter(Boolean)
              .join('. ');
            return (
              <View
                style={styles.serie}
                accessible
                accessibilityLabel={`Serie ${serie.setIndex}. ${accesible}. Completada.`}
              >
                <FrenciaText role="data" style={styles.indice} color={colors.accentText}>
                  {serie.setIndex}
                </FrenciaText>
                <View style={styles.datosSerie}>
                  <FrenciaText role="data" style={styles.pesoReps}>
                    {datos.map((d, i) => (
                      <React.Fragment key={i}>
                        {i > 0 ? (
                          <FrenciaText role="data" color={colors.textSecondary}>{separador}</FrenciaText>
                        ) : null}
                        {d.valor}
                        {d.unidad ? (
                          <FrenciaText role="dataLabel" style={styles.unidad}> {d.unidad}</FrenciaText>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </FrenciaText>
                  {esfuerzo ? (
                    <FrenciaText role="dataLabel" style={styles.esfuerzo}>{esfuerzo}</FrenciaText>
                  ) : null}
                </View>
                <View
                  style={styles.completada}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Icon name="check" size={20} color={colors.accentText} />
                </View>
              </View>
            );
          }}
          renderSectionFooter={() => <View style={styles.finEjercicio} />}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <Icon name="list" size={24} color={colors.textSecondary} />
              </View>
              <FrenciaText role="subtitle" style={styles.centerText}>Sin series registradas</FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
                Este entrenamiento se completó sin guardar ninguna serie.
              </FrenciaText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.padScreen,
      paddingVertical: space[5],
    },
    boton: { minHeight: 48 },
    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[4],
      paddingBottom: space[10],
    },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[4],
      padding: spacing.padScreen,
    },
    centerText: { textAlign: 'center' },
    intro: { gap: space[7], paddingBottom: space[4] },
    titulo: { gap: space[3], alignItems: 'flex-start' },
    nombre: { fontFamily: display, fontSize: 34, lineHeight: 40, textTransform: 'uppercase' },
    resumen: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space[5],
      paddingVertical: space[5],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.divider,
    },
    metrica: { flexGrow: 1, flexBasis: 72, minWidth: 72, gap: space[2] },
    duracion: { flexGrow: 2, flexBasis: 128, minWidth: 128 },
    valorMetrica: { fontSize: 28, lineHeight: 34 },
    ejercicio: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      columnGap: space[4],
      rowGap: space[2],
      paddingBottom: space[4],
    },
    ejercicioNombre: { flexGrow: 1, flexShrink: 1, flexBasis: 200 },
    serie: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[4],
      paddingHorizontal: space[4],
      marginBottom: space[3],
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceGreenSoft,
    },
    indice: { fontFamily: mono.bold, minWidth: 24, textAlign: 'center' },
    datosSerie: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: space[4],
      rowGap: space[3],
    },
    pesoReps: { fontFamily: mono.bold, fontSize: 18, lineHeight: 26, flexShrink: 1 },
    unidad: { textTransform: 'none', color: colors.textSecondary },
    esfuerzo: {
      flexShrink: 1,
      paddingHorizontal: space[3],
      paddingVertical: space[2],
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.surfaceOrangeLine,
      backgroundColor: colors.surfaceOrangeSoft,
      color: colors.intensityText,
      overflow: 'hidden',
    },
    completada: { alignItems: 'center', justifyContent: 'center' },
    finEjercicio: { height: space[5] },
    vacio: {
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[8],
      paddingHorizontal: spacing.padCard,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
    },
  });
