/* Frencia · Historial — lo que ya se entreno.
   Lista las sesiones terminadas, de la mas reciente a la mas vieja, agrupadas
   por mes y paginadas: se traen de a HISTORIAL_PAGINA y se pide la siguiente
   al llegar al final. Conserva las paginas al volver del detalle; se actualiza
   al entrar desde otra pestania o al tirar hacia abajo desde el inicio.
   Arrastrar una sesion hacia la derecha la elimina, previa confirmacion. */

import React, { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useSession } from '@/contexts/session';
import { useToast } from '@/contexts/toast';
import { alerta } from '@/lib/alerta';
import { SwipeableRow } from '@/components/SwipeableRow';
import { CargaCentrada } from '@/components/CargaCentrada';
import { eliminarSesion, haceCuanto, type SesionTerminada } from '@/lib/session';
import { agruparHistorial, type MesHistorial } from '@/lib/history';
import { crearHistorial } from '@/lib/history-store';
import { useVolverArribaAlRetocar } from '@/lib/volver-arriba';

import {
  Button,
  FrenciaText,
  Icon,
  MetricPill,
  radius,
  space,
  spacing,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** "Jue 12 jun" y, si no es de este anio, "Jue 12 jun 2025". */
function fechaCorta(epochMs: number): string {
  const d = new Date(epochMs);
  const base = `${SEMANA[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]}`;
  return d.getFullYear() === new Date().getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** "Septiembre" y, si no es de este anio, "Septiembre 2025". */
function tituloMes(epochMs: number): string {
  const d = new Date(epochMs);
  const nombre = MESES_LARGO[d.getMonth()];
  return d.getFullYear() === new Date().getFullYear() ? nombre : `${nombre} ${d.getFullYear()}`;
}

/** "48 min" o "1 h 12 min". Menos de un minuto se redondea a "1 min". */
function duracion(startedAt: number, finishedAt: number): string {
  const min = Math.max(1, Math.round((finishedAt - startedAt) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${h} h` : `${h} h ${resto} min`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
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
      showToast({ message: 'No pudimos eliminar el entrenamiento. Proba de nuevo.', type: 'error' });
    }
  }

  // Primera lectura: la carga ocupa la pantalla, como en el detalle de un
  // entrenamiento. El titulo queda en el mismo lugar que tendra en la lista.
  if (!loaded && error !== 'inicio') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.tituloCarga}>
          <FrenciaText role="dataLabel" color={colors.textTertiary}>
            Historial
          </FrenciaText>
        </View>
        <CargaCentrada texto="Cargando historial…" />
      </SafeAreaView>
    );
  }

  return (
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
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.surfaceCard}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Historial
            </FrenciaText>
            {error === 'inicio' && (
              <View style={styles.error} accessibilityLiveRegion="polite">
                <FrenciaText role="bodySm" style={styles.centerText}>
                  {loaded ? 'No pudimos actualizar el historial.' : 'No pudimos cargar el historial.'}
                </FrenciaText>
                <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.centerText}>
                  Revisá tu conexión y probá de nuevo.
                </FrenciaText>
                <Button variant="secondary" onPress={() => { void historial.reintentar(); }}>Reintentar</Button>
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <FrenciaText role="subtitle">{tituloMes(section.finishedAt)}</FrenciaText>
            {section.completo && (
              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                {section.data.length} {section.data.length === 1 ? 'sesión' : 'sesiones'}
              </FrenciaText>
            )}
          </View>
        )}
        renderItem={({ item: s }) => (
          <SwipeableRow
            radio="xl"
            onPress={() => abrirDetalle(s)}
            derecha={{
              icon: 'trash-2',
              tono: 'danger',
              label: 'Eliminar entrenamiento',
              onTrigger: () => pedirEliminar(s),
            }}
          >
          <View
            accessibilityRole="button"
            accessibilityLabel={`${s.dayName ?? 'Día eliminado'}, ${fechaCorta(s.finishedAt)}`}
            accessibilityHint="Ver las series realizadas en este entrenamiento"
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardText}>
                <FrenciaText role="subtitle" numberOfLines={1}>
                  {s.dayName ?? 'Día eliminado'}
                </FrenciaText>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  {fechaCorta(s.finishedAt)} · {haceCuanto(s.finishedAt)}
                </FrenciaText>
              </View>
              <View style={styles.doneIcon}>
                <Icon name="check" size={16} color={colors.accentText} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <MetricPill icon="timer" label="Duración" value={duracion(s.startedAt, s.finishedAt)} />
              <View style={styles.verSeries}>
                <FrenciaText role="bodySm" color={colors.textSecondary}>Ver series</FrenciaText>
                <Icon name="chevron-right" size={18} color={colors.textTertiary} />
              </View>
            </View>
          </View>
          </SwipeableRow>
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        SectionSeparatorComponent={() => <View style={styles.separadorSeccion} />}
        /* Hasta tener la primera lectura no decidimos que mostrar. */
        ListEmptyComponent={
          !loaded || error || cargando === 'inicio' ? null : (
            <View style={styles.vacio}>
              <Icon name="history" size={26} color={colors.textTertiary} />
              <FrenciaText role="subtitle" style={styles.centerText}>
                Todavía no hay sesiones
              </FrenciaText>
              <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.vacioPara}>
                Cuando termines tu primer entrenamiento va a aparecer acá, con las series que
                hiciste y el peso que levantaste.
              </FrenciaText>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {cargando === 'mas' ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <ActivityIndicator color={colors.accent} />
                <FrenciaText role="bodySm" color={colors.textSecondary}>
                  Cargando más entrenamientos…
                </FrenciaText>
              </View>
            ) : error === 'mas' ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <FrenciaText role="bodySm" style={styles.centerText}>No pudimos cargar más entrenamientos.</FrenciaText>
                <Button variant="secondary" onPress={() => { void historial.reintentar(); }}>Reintentar</Button>
              </View>
            ) : siguiente && !error && !cargando ? (
              <Button variant="ghost" onPress={() => { void historial.cargarMas(); }}>Cargar más</Button>
            ) : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    // flexGrow: el contenido ocupa toda la altura aunque la lista sea corta,
    // asi el gesto de tirar hacia abajo se toma desde cualquier punto.
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[7],
      paddingBottom: space[12],
    },
    header: { paddingHorizontal: space[1], paddingBottom: space[6] },
    tituloCarga: { paddingHorizontal: spacing.padScreen + space[1], paddingTop: space[7] },
    feedback: { alignItems: 'center', gap: space[4] },
    error: {
      alignItems: 'center', gap: space[4], padding: spacing.padCard,
      marginTop: space[4], borderRadius: radius.xl,
      backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle, borderWidth: 1,
    },
    centerText: { textAlign: 'center' },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space[4],
      paddingHorizontal: space[1],
      paddingBottom: space[3],
    },
    // El separador de seccion se renderiza tanto arriba como abajo de cada
    // seccion; el de arriba de la primera no suma porque el header ya deja aire.
    separadorSeccion: { height: space[3] },
    separador: { height: space[4] },
    footer: { paddingVertical: space[6] },

    card: {
      gap: space[4],
      padding: spacing.padCard,
      borderRadius: radius.xl,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
    cardFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
    verSeries: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
    cardText: { flex: 1, gap: space[1] },
    doneIcon: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceGreenSoft,
      borderWidth: 1,
      borderColor: colors.surfaceGreenLine,
    },

    vacio: {
      alignItems: 'center',
      gap: space[4],
      paddingVertical: space[10],
      paddingHorizontal: space[6],
      borderRadius: radius.xl,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.borderDefault,
    },
    vacioPara: { textAlign: 'center', maxWidth: 300 },
  });
