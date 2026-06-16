/* Frencia · SegmentedControl — RN port of components/navigation/SegmentedControl.jsx
   iOS-style segmented control for switching views. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { radius, sans, shadow, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

export type SegOption = string | { value: string; label: string; icon?: string };

export interface SegmentedControlProps {
  options: SegOption[];
  value: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  accent?: boolean;
  style?: ViewStyle;
}

const norm = (o: SegOption) =>
  typeof o === 'string' ? { value: o, label: o, icon: undefined } : o;

export function SegmentedControl({
  options,
  value,
  onChange,
  fullWidth = false,
  accent = false,
  style,
}: SegmentedControlProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.base, fullWidth && styles.full, style]}>
      {options.map((opt) => {
        const { value: val, label, icon } = norm(opt);
        const active = val === value;
        const fg = active ? (accent ? colors.textOnAccent : colors.textPrimary) : colors.textTertiary;
        return (
          <Pressable
            key={val}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange?.(val)}
            style={[
              styles.opt,
              active && (accent ? styles.optActiveAccent : styles.optActive),
            ]}
          >
            {icon ? <Icon name={icon} size={16} color={fg} /> : null}
            <Text style={[styles.label, { color: fg }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      padding: 4,
      gap: 4,
      backgroundColor: colors.surfaceInset,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignSelf: 'flex-start',
    },
    full: { alignSelf: 'stretch' },
    opt: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: radius.sm,
    },
    optActive: { backgroundColor: colors.surfaceCardElevated, ...shadow.sm },
    optActiveAccent: { backgroundColor: colors.accent },
    label: { fontFamily: sans.semibold, fontSize: 14 },
  });
