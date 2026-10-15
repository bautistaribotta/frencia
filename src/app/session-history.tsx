/* Frencia · Detalle de un entrenamiento terminado.
   Muestra las series guardadas en la sesion, sin reconstruirlas desde el plan
   actual ni ofrecer controles que puedan cambiar un registro historico.

   Abajo de todo se puede ver la sesion en formato ticket o compartirla. Para
   compartir sin abrir el ticket, este se dibuja detras del contenido, tapado:
   no se ve, pero la captura lo encuentra igual. */

import React, { useMemo, useRef, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { CargaCentrada } from '@/components/CargaCentrada';
import { MarqueeText } from '@/components/MarqueeText';
import { TicketSesion } from '@/components/TicketSesion';
import { AVISO_COMPARTIR, compartirTicket } from '@/lib/compartir-ticket';
import { useDetalleSesion } from '@/lib/detalle-sesion';
import { duracionEnSegundos, ejerciciosDelHistorial } from '@/lib/resumen-sesion';
import { reloj } from '@/lib/tiempo';
import { distanciaTabla, type UnidadDistancia } from '@/lib/distancia';
import type { DatosRegistrados } from '@/lib/exercises';
import { mostrarPeso, type UnidadPeso } from '@/lib/peso';
import { duracionSesion, fechaSesion, type SerieRealizada } from '@/lib/session-history';
import { Icon } from '@/design';
import {
  Fondo,
  LumeBadge,
  LumeButton,
  LumeText,
  lumeFuente,
  lumeLayout,
  lumeRadius,
  lumeSpace,
  useLume,
} from '@/design/lume';

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
  const { t } = useLume();
  const router = useRouter();
  const { user } = useSession();
  const { profile } = useProfile();
  const { showToast } = useToast();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = typeof id === 'string' && id.length > 0 ? id : null;
  const userId = user?.id ?? null;
  const unidad = profile?.unidadPeso ?? 'kg';
  const unidadDistancia = profile?.unidadDistancia ?? 'km';

  const { resultado, noEncontrada, reintentar } = useDetalleSesion(sessionId);
  const capturaRef = useRef<View>(null);
  const [compartiendo, setCompartiendo] = useState(false);

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
  const ejerciciosTicket = useMemo(
    () => (sesion ? ejerciciosDelHistorial(sesion.ejercicios) : []),
    [sesion],
  );

  function verTicket() {
    if (sessionId) router.push({ pathname: '/session-ticket', params: { id: sessionId } });
  }

  async function compartir() {
    if (compartiendo) return;
    setCompartiendo(true);
    const resultadoCompartir = await compartirTicket(capturaRef);
    setCompartiendo(false);
    if (resultadoCompartir !== 'ok') {
      showToast({ message: AVISO_COMPARTIR[resultadoCompartir], type: 'error' });
    }
  }

  function volver() {
    if (router.canGoBack()) router.back();
    else router.replace('/history');
  }

  return (
    <View style={styles.raiz}>
      {/* El ticket que se comparte. Va antes del Fondo y afuera de la safe
         area: el Fondo, opaco y a pantalla completa, lo tapa entero, incluida
         la zona de la barra de estado. */}
      {sesion && totalSeries > 0 && (
        <View
          style={styles.ticketOculto}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <TicketSesion
            sessionId={sesion.id}
            nombreDia={sesion.dayName ?? 'Día eliminado'}
            inicio={sesion.startedAt}
            duracionSegundos={duracionEnSegundos(sesion.startedAt, sesion.finishedAt)}
            ejercicios={ejerciciosTicket}
            unidad={unidad}
            unidadDistancia={unidadDistancia}
            capturaRef={capturaRef}
          />
        </View>
      )}

      <Fondo posicion="velada" />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.header}>
          <LumeButton variant="ghost" size="sm" icon="chevron-left" onPress={volver}>
            Atrás
          </LumeButton>
        </View>

        {noEncontrada ? (
          <View style={styles.centro}>
            <LumeText rol="subtitle" style={styles.centrado}>
              No encontramos este entrenamiento
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
              Puede que ya no esté disponible en tu historial.
            </LumeText>
          </View>
        ) : resultado?.estado === 'error' ? (
          <View style={styles.centro}>
            <LumeText rol="subtitle" style={styles.centrado}>
              No pudimos cargar el entrenamiento
            </LumeText>
            <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
              Revisá tu conexión y probá de nuevo.
            </LumeText>
            <LumeButton variant="secondary" onPress={reintentar}>
              Reintentar
            </LumeButton>
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
                  <LumeBadge tone="signal">Completada</LumeBadge>
                  <LumeText rol="display" style={styles.nombre} accessibilityRole="header">
                    {sesion.dayName ?? 'Día eliminado'}
                  </LumeText>
                  <LumeText rol="data" color={t.textSecondary}>
                    {fechaSesion(sesion.finishedAt)}
                  </LumeText>
                </View>

                <View style={[styles.resumen, { borderColor: t.divider }]}>
                  <View style={[styles.metrica, styles.duracion]}>
                    <LumeText rol="label" color={t.textSecondary}>
                      Duración
                    </LumeText>
                    <LumeText rol="hero" style={styles.valorMetrica}>
                      {duracionSesion(sesion.startedAt, sesion.finishedAt)}
                    </LumeText>
                  </View>
                  <View style={styles.metrica}>
                    <LumeText rol="label" color={t.textSecondary}>
                      Series
                    </LumeText>
                    <LumeText rol="hero" style={styles.valorMetrica}>
                      {totalSeries}
                    </LumeText>
                  </View>
                  <View style={styles.metrica}>
                    <LumeText rol="label" color={t.textSecondary}>
                      Ejercicios
                    </LumeText>
                    <LumeText rol="hero" style={styles.valorMetrica}>
                      {secciones.length}
                    </LumeText>
                  </View>
                </View>

                {totalSeries > 0 && (
                  <LumeText rol="label" color={t.textSecondary}>
                    Series realizadas
                  </LumeText>
                )}
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View style={styles.ejercicio}>
                <MarqueeText text={section.name} role="subtitle" boxStyle={styles.ejercicioNombre} />
                <LumeText rol="label" color={t.textSecondary}>
                  {section.data.length} {section.data.length === 1 ? 'serie' : 'series'}
                </LumeText>
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
                  style={[styles.serie, { borderBottomColor: t.divider }]}
                  accessible
                  accessibilityLabel={`Serie ${serie.setIndex}. ${accesible}. Completada.`}
                >
                  <LumeText rol="data" color={t.textTertiary} style={styles.indice}>
                    {serie.setIndex}
                  </LumeText>
                  <View style={styles.datosSerie}>
                    <LumeText rol="hero" style={styles.pesoReps}>
                      {datos.map((d, i) => (
                        <React.Fragment key={i}>
                          {i > 0 ? <Text style={[styles.separador, { color: t.textTertiary }]}>{separador}</Text> : null}
                          {d.valor}
                          {d.unidad ? <Text style={[styles.unidad, { color: t.textTertiary }]}> {d.unidad}</Text> : null}
                        </React.Fragment>
                      ))}
                    </LumeText>
                    {esfuerzo ? (
                      <LumeText rol="label" color={t.intensityText}>
                        {esfuerzo}
                      </LumeText>
                    ) : null}
                  </View>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                    <Icon name="check" size={18} strokeWidth={1.75} color={t.textTertiary} />
                  </View>
                </View>
              );
            }}
            renderSectionFooter={() => <View style={styles.finEjercicio} />}
            ListFooterComponent={
              totalSeries > 0 ? (
                <View style={styles.acciones}>
                  <LumeButton variant="secondary" size="lg" icon="ticket" style={styles.accion} onPress={verTicket}>
                    Ver ticket
                  </LumeButton>
                  <LumeButton
                    variant="primary"
                    size="lg"
                    icon="share"
                    style={styles.accion}
                    onPress={compartir}
                    loading={compartiendo}
                  >
                    Compartir
                  </LumeButton>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={[styles.vacio, { backgroundColor: t.surfaceInset, borderColor: t.borderStrong }]}>
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <Icon name="list" size={24} strokeWidth={1.75} color={t.textSecondary} />
                </View>
                <LumeText rol="subtitle" style={styles.centrado}>
                  Sin series registradas
                </LumeText>
                <LumeText rol="bodySm" color={t.textSecondary} style={styles.centrado}>
                  Este entrenamiento se completó sin guardar ninguna serie.
                </LumeText>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  safe: { flex: 1 },
  // Bajado para que la sombra de la silueta, que sobresale unos 60 por
  // arriba del ticket, tampoco quede por encima del borde de la pantalla.
  ticketOculto: { position: 'absolute', top: lumeSpace[12], left: 0, right: 0, pointerEvents: 'none' },
  // El boton ghost trae su propio padding: el margen lo corre 10 px a la
  // izquierda para que el chevron quede alineado con el borde del contenido.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: lumeLayout.padScreen - 10,
    paddingVertical: lumeSpace[4],
    minHeight: 44,
  },
  scroll: {
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[4],
    paddingBottom: lumeSpace[10],
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: lumeSpace[4],
    padding: lumeLayout.padScreen,
  },
  centrado: { textAlign: 'center' },
  intro: { gap: lumeSpace[7], paddingBottom: lumeSpace[4] },
  titulo: { gap: lumeSpace[4], alignItems: 'flex-start' },
  nombre: { fontSize: 34, lineHeight: 36, letterSpacing: -1 },
  resumen: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: lumeSpace[5],
    paddingVertical: lumeSpace[5],
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  metrica: { flexGrow: 1, flexBasis: 72, minWidth: 72, gap: lumeSpace[2] },
  duracion: { flexGrow: 2, flexBasis: 128, minWidth: 128 },
  valorMetrica: { fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  ejercicio: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    columnGap: lumeSpace[4],
    rowGap: lumeSpace[2],
    paddingBottom: lumeSpace[2],
  },
  ejercicioNombre: { flexGrow: 1, flexShrink: 1, flexBasis: 200 },
  // Cada serie en una fila con hairline, el numero a la izquierda.
  serie: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    borderBottomWidth: 1,
  },
  indice: { fontFamily: lumeFuente.semibold, fontSize: 12, lineHeight: 20, minWidth: 22 },
  datosSerie: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: lumeSpace[4],
    rowGap: lumeSpace[3],
  },
  pesoReps: { fontSize: 22, lineHeight: 26, letterSpacing: -0.4, flexShrink: 1 },
  separador: { fontFamily: lumeFuente.regular },
  unidad: { fontFamily: lumeFuente.medium, fontSize: 12, letterSpacing: 0 },
  finEjercicio: { height: lumeSpace[6] },
  acciones: { flexDirection: 'row', gap: lumeSpace[3], paddingTop: lumeSpace[5] },
  accion: { flex: 1 },
  vacio: {
    alignItems: 'center',
    gap: lumeSpace[5],
    paddingVertical: lumeSpace[8],
    paddingHorizontal: lumeLayout.padCard,
    borderRadius: lumeRadius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
