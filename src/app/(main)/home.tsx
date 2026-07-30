/* Frencia · Hoy — pantalla principal.
   Sin rutinas: onboarding editorial (placeholder de sesion + primeros pasos).
   Con rutinas: las lista en tarjetas con sus dias y un boton "Empezar" (que
   por ahora no inicia ninguna sesion). Las rutinas se releen cada vez que la
   pantalla recupera el foco, asi reflejan lo recien creado en el wizard. */

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';
import { supabase } from '@/lib/supabase';

import {
  Avatar,
  Badge,
  Button,
  FrenciaText,
  Icon,
  TabBar,
  useColors,
  useThemedStyles,
  mono,
  radius,
  sans,
  space,
  spacing,
  type Palette,
} from '@/design';

interface Step {
  n: number;
  title: string;
  sub: string;
  state: 'active' | 'locked';
}

const STEPS: Step[] = [
  { n: 1, title: 'Crea tu primera rutina', sub: 'Define ejercicios, series y repeticiones', state: 'active' },
  { n: 2, title: 'Registra una sesion', sub: 'Anota peso, reps y RIR mientras entrenas', state: 'locked' },
  { n: 3, title: 'Sigue tu progreso', sub: 'PRs, volumen semanal y 1RM estimado', state: 'locked' },
];

// Por ahora solo Hoy y Perfil: Historial y Rutinas se suman cuando existan sus
// pantallas. El TabBar reparte los items a los lados del boton central, asi que
// con dos queda uno de cada lado.
const TABS = [
  { value: 'hoy', label: 'Hoy', icon: 'home' },
  { value: 'perfil', label: 'Perfil', icon: 'user' },
];

// Iniciales (preview) y nombres cortos (resumen) de la semana. 0 = lunes.
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SEMANA_CORTA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Un dia de entrenamiento de la rutina activa, tal como se muestra en el home.
interface TrainingDayCard {
  id: string;
  name: string;
  weekdays: number[];
  exerciseCount: number;
}

interface ActiveRoutine {
  id: string;
  name: string;
  days: TrainingDayCard[];
}

export default function HomeScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { displayName, profile } = useProfile();
  const first = displayName.split(' ')[0];

  const [routine, setRoutine] = useState<ActiveRoutine | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Relee la rutina activa al enfocar la pantalla (incluye volver del wizard).
  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      (async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelado) {
            setRoutine(null);
            setLoaded(true);
          }
          return;
        }
        // Solo hay una rutina activa (archived_at nulo); traemos sus dias con
        // los weekdays y la cuenta de ejercicios en una sola consulta.
        const { data } = await supabase
          .from('routines')
          .select(
            'id, name, training_days(id, name, position, training_day_weekdays(weekday), training_day_exercises(id))',
          )
          .eq('user_id', user.id)
          .is('archived_at', null)
          .maybeSingle();
        if (cancelado) return;
        setRoutine(
          data
            ? {
                id: data.id,
                name: data.name,
                days: (data.training_days ?? [])
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((d) => ({
                    id: d.id,
                    name: d.name,
                    weekdays: (d.training_day_weekdays ?? [])
                      .map((w) => w.weekday)
                      .sort((a, b) => a - b),
                    exerciseCount: (d.training_day_exercises ?? []).length,
                  })),
              }
            : null,
        );
        setLoaded(true);
      })();
      return () => {
        cancelado = true;
      };
    }, []),
  );

  const openProfile = () => router.push('/profile');
  const onCreateRoutine = () => router.push('/create-routine');
  const hasRoutine = routine !== null && routine.days.length > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo */}
        <View style={styles.greeting}>
          <Pressable
            style={styles.greetingLeft}
            onPress={openProfile}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
          >
            <Avatar
              name={profile?.avatarSeed ?? displayName}
              src={profile?.avatarUrl ?? undefined}
              size="md"
              ring
            />
            <View>
              <FrenciaText role="subtitle">Hola, {first}</FrenciaText>
              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                Jueves · 12 jun
              </FrenciaText>
            </View>
          </Pressable>
          <Badge tone="neutral">Dia 1</Badge>
        </View>

        {/* Hasta tener la primera lectura no decidimos que mostrar. */}
        {!loaded ? null : hasRoutine ? (
          /* Rutina activa y sus dias de entrenamiento */
          <View style={styles.routinesBlock}>
            <View style={styles.routinesHeader}>
              <FrenciaText role="subtitle" numberOfLines={1} style={styles.routineName}>
                {routine.name}
              </FrenciaText>
              <FrenciaText role="dataLabel" color={colors.textTertiary}>
                {routine.days.length} {routine.days.length === 1 ? 'día' : 'días'}
              </FrenciaText>
            </View>

            {routine.days.map((d) => (
              <View key={d.id} style={styles.routineCard}>
                <View style={styles.routineText}>
                  <FrenciaText role="subtitle" numberOfLines={1}>
                    {d.name}
                  </FrenciaText>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    {d.exerciseCount} {d.exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
                    {d.weekdays.length > 0
                      ? ` · ${d.weekdays.map((w) => SEMANA_CORTA[w]).join(', ')}`
                      : ''}
                  </FrenciaText>
                </View>

                {/* Tira de semana del dia */}
                <View style={styles.weekRow}>
                  {SEMANA.map((letra, i) => {
                    const on = d.weekdays.includes(i);
                    return (
                      <View
                        key={letra}
                        style={[styles.weekCell, on ? styles.weekCellOn : styles.weekCellOff]}
                      >
                        <FrenciaText
                          role="dataLabel"
                          color={on ? colors.textOnAccent : colors.textTertiary}
                          style={styles.weekLetter}
                        >
                          {letra}
                        </FrenciaText>
                      </View>
                    );
                  })}
                </View>

                <Button
                  variant="primary"
                  size="lg"
                  icon="play"
                  fullWidth
                  onPress={() =>
                    router.push({
                      pathname: '/session',
                      params: { dia: d.id, nombre: d.name },
                    })
                  }
                >
                  Empezar
                </Button>
              </View>
            ))}

            {/* Solo puede haber una rutina activa, asi que crear otra archiva
               la actual. Lo avisamos para que no sea una sorpresa. */}
            <View style={styles.newRoutineBlock}>
              <Button variant="secondary" size="lg" icon="plus" fullWidth onPress={onCreateRoutine}>
                Crear rutina nueva
              </Button>
              <FrenciaText role="dataLabel" color={colors.textTertiary} style={styles.centerText}>
                Archiva la rutina actual
              </FrenciaText>
            </View>
          </View>
        ) : (
          /* Estado vacio: onboarding para cuentas nuevas */
          <>
            <View style={styles.heroBlock}>
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Icon name="dumbbell" size={28} color={colors.accentText} />
                </View>

                <View style={styles.heroText}>
                  <FrenciaText role="dataLabel" color={colors.textTertiary}>
                    Tu sesion de hoy
                  </FrenciaText>
                  <FrenciaText role="display" style={styles.heroTitle}>
                    EMPIEZA AQUI
                  </FrenciaText>
                  <FrenciaText role="bodySm" color={colors.textSecondary} style={styles.heroPara}>
                    Aun no tienes rutinas. Crea la primera y registra cada serie a tu manera.
                  </FrenciaText>
                </View>

                <Button
                  variant="primary"
                  size="lg"
                  icon="plus"
                  fullWidth
                  onPress={onCreateRoutine}
                  style={styles.heroBtn}
                >
                  Crear primera rutina
                </Button>
              </View>

              <View style={styles.noSession}>
                <Icon name="calendar-off" size={13} color={colors.textTertiary} />
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  Sin sesiones programadas
                </FrenciaText>
              </View>
            </View>

            {/* Primeros pasos */}
            <View style={styles.stepsBlock}>
              <View style={styles.stepsHeader}>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  Primeros pasos
                </FrenciaText>
                <FrenciaText role="dataLabel" color={colors.textTertiary}>
                  0 / 3
                </FrenciaText>
              </View>

              <View style={styles.stepsList}>
                {STEPS.map((s, i) => {
                  const active = s.state === 'active';
                  return (
                    <Pressable
                      key={s.n}
                      onPress={active ? onCreateRoutine : undefined}
                      disabled={!active}
                      style={[
                        styles.stepRow,
                        i > 0 && styles.stepRowDivider,
                        !active && styles.stepRowLocked,
                      ]}
                    >
                      <View style={[styles.stepBadge, active ? styles.stepBadgeActive : styles.stepBadgeLocked]}>
                        <FrenciaText
                          role="data"
                          color={active ? colors.textOnAccent : colors.textTertiary}
                          style={styles.stepNum}
                        >
                          {s.n}
                        </FrenciaText>
                      </View>
                      <View style={styles.stepText}>
                        <FrenciaText role="bodySm" style={styles.stepTitle}>
                          {s.title}
                        </FrenciaText>
                        <FrenciaText role="bodySm" color={colors.textTertiary} style={styles.stepSub}>
                          {s.sub}
                        </FrenciaText>
                      </View>
                      <Icon
                        name={active ? 'chevron-right' : 'lock'}
                        size={17}
                        color={active ? colors.accentText : colors.textDisabled}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Barra de pestanas fija */}
      <TabBar
        items={TABS}
        value="hoy"
        onChange={(value) => {
          if (value === 'perfil') openProfile();
        }}
        fab={{ icon: 'plus', label: 'Crear', onPress: onCreateRoutine }}
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
    gap: space[7],
  },

  // Saludo
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingLeft: { flexDirection: 'row', alignItems: 'center', gap: space[4] },

  // Lista de rutinas
  routinesBlock: { gap: space[4] },
  routinesHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space[4],
    paddingHorizontal: space[1],
  },
  // El nombre de la rutina se achica antes que la cuenta de dias.
  routineName: { flexShrink: 1 },
  newRoutineBlock: { gap: space[3] },
  centerText: { textAlign: 'center' },
  routineCard: {
    gap: space[4],
    padding: spacing.padCard,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  routineText: { gap: space[1] },
  weekRow: { flexDirection: 'row', gap: space[2] },
  weekCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekCellOn: { backgroundColor: colors.accent },
  weekCellOff: { backgroundColor: colors.surfaceInset, borderWidth: 1, borderColor: colors.borderSubtle },
  weekLetter: { lineHeight: 14 },

  // Hero
  heroBlock: { gap: space[4] },
  heroCard: {
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceCard,
    paddingTop: space[8],
    paddingHorizontal: space[7],
    paddingBottom: space[7],
    alignItems: 'center',
    gap: space[5],
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceOrangeSoft,
    borderWidth: 1,
    borderColor: colors.surfaceOrangeLine,
  },
  heroText: { alignItems: 'center', gap: space[3] },
  heroTitle: {
    fontSize: 38,
    lineHeight: 44,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  heroPara: { textAlign: 'center', maxWidth: 260, marginTop: space[1] },
  heroBtn: { marginTop: space[2] },

  noSession: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },

  // Primeros pasos
  stepsBlock: { gap: space[4] },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space[1],
  },
  stepsList: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[4],
    padding: space[5],
  },
  stepRowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  stepRowLocked: { opacity: 0.62 },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: { backgroundColor: colors.accent },
  stepBadgeLocked: { borderWidth: 1.5, borderColor: colors.borderDefault },
  stepNum: { fontFamily: mono.bold, fontSize: 14 },
  stepText: { flex: 1, gap: space[1] },
  stepTitle: { fontFamily: sans.semibold, color: colors.textPrimary },
  stepSub: { fontSize: 12.5, lineHeight: 17 },
});
