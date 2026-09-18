/* Frencia · Historial — lo que ya se entreno.
   Lista las sesiones terminadas, de la mas reciente a la mas vieja, agrupadas
   por mes y paginadas: se traen de a HISTORIAL_PAGINA y se pide la siguiente
   al llegar al final. Se recarga desde cero cada vez que la pestania recupera
   el foco, asi aparece la sesion recien cerrada. */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { useSession } from '@/contexts/session';
import { cargarHistorial, haceCuanto, type SesionTerminada } from '@/lib/session';

import {
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

interface SeccionMes {
  key: string;
  title: string;
  data: SesionTerminada[];
}

/** Agrupa por anio-mes. La lista ya viene ordenada, asi que basta con cortar
 *  cuando cambia el mes. */
function agruparPorMes(sesiones: SesionTerminada[]): SeccionMes[] {
  const secciones: SeccionMes[] = [];
  for (const s of sesiones) {
    const d = new Date(s.finishedAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const ultima = secciones[secciones.length - 1];
    if (ultima && ultima.key === key) {
      ultima.data.push(s);
    } else {
      secciones.push({ key, title: tituloMes(s.finishedAt), data: [s] });
    }
  }
  return secciones;
}

export default function HistoryScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { user } = useSession();

  const [sesiones, setSesiones] = useState<SesionTerminada[]>([]);
  const [hayMas, setHayMas] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  // Ref y no estado: evita disparar dos pedidos de la misma pagina si
  // onEndReached se dispara antes de que el estado se actualice.
  const pidiendo = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        const r = user ? await cargarHistorial(user.id, 0) : { sesiones: [], hayMas: false };
        if (cancelado) return;
        setSesiones(r.sesiones);
        setHayMas(r.hayMas);
        setLoaded(true);
      })();
      return () => {
        cancelado = true;
      };
    }, [user]),
  );

  const cargarMas = useCallback(async () => {
    if (!user || !hayMas || pidiendo.current) return;
    pidiendo.current = true;
    setCargandoMas(true);
    const r = await cargarHistorial(user.id, sesiones.length);
    setSesiones((prev) => [...prev, ...r.sesiones]);
    setHayMas(r.hayMas);
    setCargandoMas(false);
    pidiendo.current = false;
  }, [user, hayMas, sesiones.length]);

  const secciones = useMemo(() => agruparPorMes(sesiones), [sesiones]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SectionList
        sections={secciones}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.header}>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              Historial
            </FrenciaText>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <FrenciaText role="subtitle">{section.title}</FrenciaText>
            <FrenciaText role="dataLabel" color={colors.textTertiary}>
              {section.data.length} {section.data.length === 1 ? 'sesión' : 'sesiones'}
            </FrenciaText>
          </View>
        )}
        renderItem={({ item: s }) => (
          <View style={styles.card}>
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

            <MetricPill icon="timer" label="Duración" value={duracion(s.startedAt, s.finishedAt)} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        SectionSeparatorComponent={() => <View style={styles.separadorSeccion} />}
        /* Hasta tener la primera lectura no decidimos que mostrar. */
        ListEmptyComponent={
          !loaded ? null : (
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
          cargandoMas ? (
            <ActivityIndicator color={colors.textTertiary} style={styles.footer} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bgApp },
    scroll: {
      paddingHorizontal: spacing.padScreen,
      paddingTop: space[7],
      paddingBottom: space[12],
    },
    header: { paddingHorizontal: space[1], paddingBottom: space[6] },
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
