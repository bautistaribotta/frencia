/* Frencia · Hoy — estado vacio (cuenta nueva).
   Onboarding editorial: placeholder de sesion + primeros pasos.
   Lo que ve un usuario recien registrado, sin rutinas ni historial. */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useProfile } from '@/contexts/profile';

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

const TABS = [
  { value: 'hoy', label: 'Hoy', icon: 'home' },
  { value: 'historial', label: 'Historial', icon: 'calendar' },
  { value: 'rutinas', label: 'Rutinas', icon: 'list' },
  { value: 'perfil', label: 'Perfil', icon: 'user' },
];

export default function HomeScreen() {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { displayName, profile } = useProfile();
  const first = displayName.split(' ')[0];

  const openProfile = () => router.push('/profile');
  const onCreateRoutine = () => router.push('/create-routine');

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

        {/* Placeholder de la sesion de hoy */}
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
