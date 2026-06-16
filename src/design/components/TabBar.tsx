/* Frencia · TabBar — RN port of components/navigation/TabBar.jsx
   Bottom navigation with optional center action FAB.
   NOTE: web version uses backdrop blur; on RN add expo-blur behind
   if you want translucency. Here it's a solid translucent fill. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mono, shadow, tracking, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';
import { Icon } from '../Icon';

export interface TabItem {
  value: string;
  label: string;
  icon: string;
}
export interface TabFab {
  icon?: string;
  label?: string;
  onPress?: () => void;
}

export interface TabBarProps {
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  fab?: TabFab;
  style?: ViewStyle;
}

export function TabBar({ items, value, onChange, fab, style }: TabBarProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const mid = Math.ceil(items.length / 2);
  const left = fab ? items.slice(0, mid) : items;
  const right = fab ? items.slice(mid) : [];

  const renderTab = (item: TabItem) => {
    const active = item.value === value;
    const fg = active ? colors.accent : colors.textTertiary;
    return (
      <Pressable key={item.value} style={styles.tab} onPress={() => onChange?.(item.value)}>
        <Icon name={item.icon} size={24} color={fg} />
        <Text style={[styles.tabLabel, { color: fg }]}>{item.label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: 10 + Math.max(insets.bottom, 8) }, style]}>
      {left.map(renderTab)}
      {fab ? (
        <View style={styles.fabSlot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fab.label || 'acción'}
            onPress={fab.onPress}
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <Icon name={fab.icon || 'plus'} size={26} strokeWidth={2.5} color={colors.textOnAccent} />
          </Pressable>
        </View>
      ) : null}
      {right.map(renderTab)}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      backgroundColor: colors.bgApp,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingHorizontal: 8,
      paddingTop: 10,
    },
    tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
    tabLabel: {
      fontFamily: mono.medium,
      fontSize: 9,
      letterSpacing: tracking.wide,
      textTransform: 'uppercase',
    },
    fabSlot: { flexGrow: 0, marginTop: -28, alignItems: 'center', justifyContent: 'flex-start' },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.bgApp,
      ...shadow.glowOrange,
    },
  });
