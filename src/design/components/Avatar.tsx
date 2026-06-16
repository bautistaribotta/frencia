/* Frencia · Avatar — RN port of components/core/Avatar.jsx
   Imagen, o avatar generativo (boring-avatars, variante beam) con la
   paleta de la app cuando no hay foto. */

import React from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';
import BoringAvatar from 'react-native-boring-avatars';
import { palette, type Palette } from '../theme';
import { useColors, useThemedStyles } from '../theme-context';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: Size;
  ring?: boolean;
  style?: ViewStyle;
}

const DIM: Record<Size, number> = { xs: 28, sm: 36, md: 44, lg: 64, xl: 120 };

// Solo colores de la app: naranja (acento) + grises calidos (ink).
const AVATAR_COLORS = [
  palette.orange500,
  palette.orange400,
  palette.orange300,
  palette.ink700,
  palette.ink400,
];

export function Avatar({ src, name = '', size = 'md', ring = false, style }: AvatarProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const dim = DIM[size];
  return (
    <View
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: dim / 2 },
        ring && { borderWidth: 2, borderColor: colors.accent },
        style,
      ]}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <BoringAvatar size={dim} name={name} variant="beam" colors={AVATAR_COLORS} />
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors.surfaceChip,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
  });
