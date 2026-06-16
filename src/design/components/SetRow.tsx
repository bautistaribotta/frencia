/* Frencia · SetRow — RN port of components/data/SetRow.jsx
   A single logged set: index · load × reps · RIR · completion toggle. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { mono, radius, tracking, motion, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

type State = 'pending' | 'active' | 'done';

export interface SetRowProps {
  index: React.ReactNode;
  load: React.ReactNode;
  reps: React.ReactNode;
  unit?: string;
  rir?: number | string | null;
  state?: State;
  onToggle?: () => void;
  style?: ViewStyle;
}

export function SetRow({
  index,
  load,
  reps,
  unit = 'kg',
  rir,
  state = 'pending',
  onToggle,
  style,
}: SetRowProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const active = state === 'active';
  const done = state === 'done';

  return (
    <View
      style={[
        styles.base,
        active && { borderColor: colors.surfaceGreenLine, backgroundColor: colors.surfaceCardElevated },
        done && { backgroundColor: colors.surfaceGreenSoft },
        style,
      ]}
    >
      <View
        style={[
          styles.idx,
          active && { backgroundColor: colors.accent },
          done && { backgroundColor: 'transparent' },
        ]}
      >
        <Text
          style={[
            styles.idxText,
            active && { color: colors.textOnAccent },
            done && { color: colors.accentText },
          ]}
        >
          {index}
        </Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.load}>
          {load}
          <Text style={styles.unit}>{unit}</Text>
        </Text>
        <Text style={styles.x}>×</Text>
        <Text style={styles.reps}>
          {reps}
          <Text style={styles.unit}>reps</Text>
        </Text>
      </View>

      <View style={styles.meta}>
        {rir != null ? <Text style={styles.rir}>RIR {rir}</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="completar serie"
          onPress={onToggle}
          style={({ pressed }) => [
            styles.check,
            done && { backgroundColor: colors.accent, borderColor: colors.accent },
            pressed && { transform: [{ scale: motion.pressScale }] },
          ]}
        >
          <Icon name="check" size={20} strokeWidth={2.5} color={done ? colors.textOnAccent : colors.textTertiary} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceCard,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    idx: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceInset,
    },
    idxText: { fontFamily: mono.bold, fontSize: 13, color: colors.textTertiary },
    main: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    load: { fontFamily: mono.bold, fontSize: 19, color: colors.textPrimary },
    reps: { fontFamily: mono.bold, fontSize: 19, color: colors.textPrimary },
    x: { fontFamily: mono.regular, fontSize: 14, color: colors.textTertiary },
    unit: { fontFamily: mono.regular, fontSize: 11, color: colors.textTertiary },
    meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rir: {
      fontFamily: mono.semibold,
      fontSize: 11,
      letterSpacing: tracking.wide,
      textTransform: 'uppercase',
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceOrangeSoft,
      color: colors.intensityText,
      borderWidth: 1,
      borderColor: colors.surfaceOrangeLine,
      overflow: 'hidden',
    },
    check: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.borderDefault,
      backgroundColor: 'transparent',
    },
  });
