/* ============================================================
   Frencia · Lume · Vidrio
   El panel translucido base: relleno, borde de 1 px (glass-line), brillo
   de canto arriba (glass-highlight) y sombra lejana.
     normal  surface-card           tarjetas, opciones, campos, celdas
     fuerte  surface-card-elevated  lo elegido, la banda de la rueda
     denso   surface-raised + blur  barra del wizard, hojas, tab bar
   El blur va solo en el cromo (denso): veinte BlurView en una lista con
   scroll cuestan cuadros. Con Reducir transparencia no hay blur y el
   relleno ya llega opaco desde useLume().
   ============================================================ */

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useLume } from './useLume';
import { lumeBlur, lumeRadius } from './tokens';

export type NivelVidrio = 'normal' | 'fuerte' | 'denso';

export interface VidrioProps extends ViewProps {
  nivel?: NivelVidrio;
  radio?: number;
  // Borde de otro color (lo elegido lleva el accent, lo en foco el signal).
  borde?: string;
  // Sin la sombra lejana: para piezas chicas dentro de otro vidrio.
  sinSombra?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Vidrio({
  nivel = 'normal',
  radio = lumeRadius.xl,
  borde,
  sinSombra = false,
  style,
  children,
  ...rest
}: VidrioProps) {
  const { t, modo, sombras, reducida } = useLume();
  const relleno =
    nivel === 'denso' ? t.surfaceRaised : nivel === 'fuerte' ? t.surfaceCardElevated : t.surfaceCard;
  const sombra = sinSombra ? undefined : nivel === 'normal' ? sombras.glass : sombras.md;
  const linea = borde ?? t.glassLine;

  return (
    <View style={[{ borderRadius: radio, boxShadow: sombra }, style]} {...rest}>
      {nivel === 'denso' && !reducida ? (
        <BlurView
          intensity={lumeBlur.sheet}
          tint={modo === 'dark' ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: radio, overflow: 'hidden' }]}
        />
      ) : null}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            pointerEvents: 'none',
            borderRadius: radio,
            backgroundColor: relleno,
            borderWidth: 1,
            borderColor: linea,
            // El brillo de canto: el borde de arriba toma el highlight.
            borderTopColor: borde ?? t.glassHighlight,
          },
        ]}
      />
      {children}
    </View>
  );
}
