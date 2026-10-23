/* ============================================================
   Frencia · Lume · Avatar
   Foto, o el avatar generativo (boring-avatars, variante beam) con la
   cara en bg-app sobre el accent. Con `ring`, un filo de 1 px en
   border-default por dentro.
   ============================================================ */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import BoringAvatar from 'react-native-boring-avatars';

import { useLume, useLumeStyles } from './useLume';
import type { LumePalette } from './tokens';

type TamanioAvatar = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LumeAvatarProps {
  src?: string;
  cacheKey?: string | null;
  name?: string;
  size?: TamanioAvatar;
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

// xl: la vista previa de la hoja de foto de perfil.
const LADO: Record<TamanioAvatar, number> = { xs: 28, sm: 36, md: 44, lg: 64, xl: 120 };

export function LumeAvatar({ src, cacheKey, name = '', size = 'md', ring = false, style }: LumeAvatarProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const lado = LADO[size];
  return (
    <View
      style={[styles.base, { width: lado, height: lado, borderRadius: lado / 2 }, style]}
    >
      {src ? (
        <Image
          source={{ uri: src, cacheKey: cacheKey ?? undefined }}
          style={styles.foto}
          contentFit="cover"
        />
      ) : (
        <BoringAvatar size={lado} name={name} variant="beam" colors={[t.accent, t.bgApp]} />
      )}
      {ring ? (
        <View style={[StyleSheet.absoluteFill, styles.filo, { borderRadius: lado / 2 }]} />
      ) : null}
    </View>
  );
}

const makeStyles = (t: LumePalette) =>
  StyleSheet.create({
    base: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: t.surfaceChip },
    foto: { width: '100%', height: '100%' },
    filo: { borderWidth: 1, pointerEvents: 'none', borderColor: t.borderDefault },
  });
