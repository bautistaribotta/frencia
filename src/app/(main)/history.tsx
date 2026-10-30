/* Frencia · Historial — lo que ya se entreno.
   Lista las sesiones terminadas, de la mas reciente a la mas vieja, agrupadas
   por mes y paginadas: se traen de a HISTORIAL_PAGINA y se pide la siguiente
   al llegar al final. Conserva las paginas al volver del detalle; se actualiza
   al entrar desde otra pestania o al tirar hacia abajo desde el inicio.
   Arrastrar una sesion hacia la izquierda la elimina, previa confirmacion. */

import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { SwipeableRow } from '@/components/SwipeableRow';
import { AvisoPie, CargaPestania, ErrorPestania, VacioPestania } from '@/components/EstadosPestania';
import { eliminarSesion, haceCuanto } from '@/lib/session';
import { agruparHistorial, type MesHistorial, type SesionTerminada } from '@/lib/history';
import { crearHistorial } from '@/lib/history-store';
import { SEMANA_CORTA } from '@/lib/dia';
import { duracionSesion, indiceSemanaLunes, MESES_CORTO, MESES_LARGO } from '@/lib/tiempo';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import { Icon } from '@/design';
import {
  Cargando,
  Fondo,
  LumeButton,
  LumeMetricPill,
  LumeText,
  Vidrio,
  lumeLayout,
  lumeSpace,
  useLume,
  useLumeStyles,
  type LumePalette,
  type LumeSombras,
} from '@/design/lume';

/** "Jue 12 jun" y, si no es de este anio, "Jue 12 jun 2025". */
function fechaCorta(epochMs: number): string {
  const d = new Date(epochMs);
  const base = `${SEMANA_CORTA[indiceSemanaLunes(d)]} ${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** "Septiembre" y, si no es de este anio, "Septiembre 2025". */
function tituloMes(epochMs: number): string {
  const d = new Date(epochMs);
  const nombre = MESES_LARGO[d.getMonth()];
  return d.getFullYear() === new Date().getFullYear() ? nombre : `${nombre} ${d.getFullYear()}`;
}

export default function HistoryScreen() {
  const { t } = useLume();
  const tema = useLumeStyles(makeStyles);
  const { user } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  const scrollRef = useRef<SectionList<SesionTerminada, MesHistorial>>(null);
  useVolverArribaAlRetocar(scrollRef);

  const userId = user?.id ?? null;
  const historial = useMemo(() => crearHistorial(userId), [userId]);
  const estado = useSyncExternalStore(historial.subscribe, historial.getSnapshot, historial.getSnapshot);
  const { sesiones, loaded, cargando, error, proximaFecha, siguiente } = estado;
  const conservarAlVolver = useRef(false);
  // Evita borrar dos veces la misma sesion mientras el pedido esta en vuelo.
  const eliminando = useRef(false);
  // El RefreshControl solo se muestra cuando la recarga la inicio el gesto de
  // tirar hacia abajo. Las recargas silenciosas (al volver a la pestania) no
  // lo activan: si lo hicieran, iOS lo despliega solo y corre la lista 60pt.
  const [refrescandoPorGesto, setRefrescandoPorGesto] = useState(false);
  const refrescando = refrescandoPorGesto && cargando === 'inicio';
  // Termino (o se cancelo) la recarga del gesto: se apaga en el mismo render
  // para que la proxima recarga silenciosa no herede el flag.
  if (refrescandoPorGesto && cargando !== 'inicio') setRefrescandoPorGesto(false);

  useFocusEffect(
    useCallback(() => {
      void historial.activar(conservarAlVolver.current);
      conservarAlVolver.current = false;
      return historial.desactivar;
    }, [historial]),
  );

  const secciones = useMemo(() => agruparHistorial(sesiones, proximaFecha), [sesiones, proximaFecha]);

  function abrirDetalle(sesion: SesionTerminada) {
    conservarAlVolver.current = true;
    router.push({ pathname: '/session-history', params: { id: sesion.id } });
  }

  function pedirEliminar(sesion: SesionTerminada) {
    if (eliminando.current) return;
    const nombre = sesion.dayName ?? 'este entrenamiento';
    alerta(
      'Eliminar entrenamiento',
      `Se va a borrar ${nombre} del ${fechaCorta(sesion.finishedAt)} con todas sus series. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => { void eliminar(sesion); } },
      ],
    );
  }

  async function eliminar(sesion: SesionTerminada) {
    if (eliminando.current) return;
    eliminando.current = true;
    const ok = await eliminarSesion(sesion.id);
    eliminando.current = false;
    if (ok) {
      historial.quitar(sesion.id);
      showToast({ message: 'Entrenamiento eliminado', type: 'success' });
    } else {
      showToast({ message: 'No pudimos eliminar el entrenamiento. Probá de nuevo.', type: 'error' });
    }
  }

  // Primera lectura: la carga ocupa la pantalla, como en el detalle de un
  // entrenamiento. El titulo queda en el mismo lugar que tendra en la lista.
  if (!loaded && error !== 'inicio') {
    return (
      <View style={styles.pantalla}>
        <Fondo posicion="cumbre" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <CargaPestania titulo="Historial" texto="Cargando historial…" />
        </SafeAreaView>
      </View>
    );
  }

  const primera = secciones[0];

  return (
    <View style={styles.pantalla}>
      <Fondo posicion="cumbre" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <SectionList
          ref={scrollRef}
          key={userId ?? 'sin-sesion'}
          sections={secciones}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          onEndReached={() => { void historial.cargarMas(); }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => {
                setRefrescandoPorGesto(true);
                void historial.recargar();
              }}
              tintColor={t.textPrimary}
              colors={[t.textPrimary]}
              progressBackgroundColor={t.surfaceRaisedOpaco}
            />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.titulo}>
                <LumeText rol="label" color={t.textTertiary}>
                  Historial
                </LumeText>
              </View>
              {error === 'inicio' && (
                <ErrorPestania
                  titulo={loaded ? 'No pudimos actualizar tu historial.' : 'No pudimos cargar tu historial.'}
                  texto="Revisá tu conexión y probá de nuevo."
                  onReintentar={() => { void historial.reintentar(); }}
                />
              )}
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={[styles.mes, section !== primera && styles.mesSeparado]}>
              <LumeText rol="subtitle">{tituloMes(section.finishedAt)}</LumeText>
              {section.completo && (
                <LumeText rol="label" color={t.textTertiary}>
                  {section.data.length} {section.data.length === 1 ? 'sesión' : 'sesiones'}
                </LumeText>
              )}
            </View>
          )}
          renderItem={({ item: s }) => (
            <SwipeableRow
              onPress={() => abrirDetalle(s)}
              izquierda={{
                icon: 'trash-2',
                tono: 'danger',
                label: 'Eliminar entrenamiento',
                onTrigger: () => pedirEliminar(s),
              }}
            >
              <Vidrio
                accessibilityRole="button"
                accessibilityLabel={`${s.dayName ?? 'Día eliminado'}, ${fechaCorta(s.finishedAt)}`}
                accessibilityHint="Ver las series realizadas en este entrenamiento"
                style={styles.tarjeta}
              >
                <View style={styles.tarjetaCabeza}>
                  <View style={styles.tarjetaTexto}>
                    <LumeText rol="subtitle" numberOfLines={1}>
                      {s.dayName ?? 'Día eliminado'}
                    </LumeText>
                    <LumeText rol="label" color={t.textTertiary}>
                      {fechaCorta(s.finishedAt)} · {haceCuanto(s.finishedAt)}
                    </LumeText>
                  </View>
                  {/* Terminado: el check en un circulo de accent con su resplandor. */}
                  <View style={[styles.hecho, tema.hecho]}>
                    <Icon name="check" size={16} color={t.textOnAccent} strokeWidth={2} />
                  </View>
                </View>

                <View style={styles.tarjetaPie}>
                  <LumeMetricPill icon="timer" label="Duración" value={duracionSesion(s.startedAt, s.finishedAt)} />
                  <View style={styles.verSeries}>
                    <LumeText rol="bodySm" color={t.textSecondary}>
                      Ver series
                    </LumeText>
                    <Icon name="chevron-right" size={18} color={t.textTertiary} strokeWidth={1.75} />
                  </View>
                </View>
              </Vidrio>
            </SwipeableRow>
          )}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          /* Hasta tener la primera lectura no decidimos que mostrar. */
          ListEmptyComponent={
            !loaded || error || cargando === 'inicio' ? undefined : (
              <VacioPestania
                icono="history"
                titulo="Todavía no hay sesiones"
                texto="Cuando termines tu primer entrenamiento va a aparecer acá, con las series que hiciste y el peso que levantaste."
              />
            )
          }
          ListFooterComponent={
            cargando === 'mas' ? (
              <View style={styles.footer}>
                <Cargando texto="Cargando más entrenamientos…" />
              </View>
            ) : error === 'mas' ? (
              <AvisoPie
                texto="No pudimos cargar más entrenamientos."
                onReintentar={() => { void historial.reintentar(); }}
              />
            ) : siguiente && !error && !cargando ? (
              <View style={styles.footer}>
                <LumeButton variant="ghost" onPress={() => { void historial.cargarMas(); }}>
                  Cargar más
                </LumeButton>
              </View>
            ) : undefined
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1 },
  safe: { flex: 1 },
  // flexGrow: el contenido ocupa toda la altura aunque la lista sea corta,
  // asi el gesto de tirar hacia abajo se toma desde cualquier punto.
  scroll: {
    flexGrow: 1,
    paddingHorizontal: lumeLayout.padScreen,
    paddingTop: lumeSpace[6],
    paddingBottom: lumeSpace[12],
  },
  header: { gap: lumeSpace[6], paddingBottom: lumeSpace[6] },
  titulo: { paddingHorizontal: lumeSpace[1] },
  footer: { alignItems: 'center', paddingVertical: lumeSpace[6] },

  mes: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: lumeSpace[4],
    paddingHorizontal: lumeSpace[1],
    paddingBottom: lumeSpace[3],
  },
  mesSeparado: { marginTop: lumeSpace[7] },
  separador: { height: lumeSpace[3] },

  tarjeta: { gap: lumeSpace[4], padding: lumeLayout.padCard },
  tarjetaCabeza: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[3] },
  tarjetaTexto: { flex: 1, gap: lumeSpace[1] },
  hecho: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tarjetaPie: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: lumeSpace[3],
  },
  verSeries: { flexDirection: 'row', alignItems: 'center', gap: lumeSpace[1] },
});

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    hecho: { backgroundColor: t.accent, boxShadow: sombras.haloAccent },
  });
