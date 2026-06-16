/* Frencia · Tag — RN port of components/core/Tag.jsx
   Pill tag for muscle groups, categories, filters. */

import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { radius, sans, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';

export interface TagProps {
  selected?: boolean;
  selectable?: boolean;
  dot?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Tag({ selected = false, selectable = false, dot = false, onPress, children, style }: TagProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const fg = selected ? colors.accentText : colors.textSecondary;
  const content = (
    <>
      {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      <Text style={[styles.text, { color: fg }]}>{children}</Text>
    </>
  );
  const boxStyle = [
    styles.base,
    selected && { backgroundColor: colors.surfaceGreenSoft, borderColor: colors.surfaceGreenLine },
    style,
  ];

  if (selectable || onPress) {
    return (
      <Pressable onPress={onPress} style={boxStyle}>
        {content}
      </Pressable>
    );
  }
  return <View style={boxStyle}>{content}</View>;
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceChip,
      borderWidth: 1,
      borderColor: 'transparent',
      alignSelf: 'flex-start',
    },
    text: { fontFamily: sans.medium, fontSize: 13 },
    dot: { width: 7, height: 7, borderRadius: 3.5, opacity: 0.9 },
  });
