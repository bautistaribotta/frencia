/* ============================================================
   Frencia · Lume · Cargando
   El indicador de carga: el anillo clasico. Pista en data-track y un
   cuarto del borde en tinta que gira, una vuelta cada 1,2 s, lineal.
   Con Reducir movimiento gira tres veces mas lento (3,6 s).
     sm 16 px  dentro de un boton (tinta = el texto del boton)
     md 20 px  carga de una pantalla o de una lista, con su leyenda
     lg 28 px  arrastrar para actualizar
   No usa ActivityIndicator para que coincida con el diseño.
   ============================================================ */

import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { lumeSpace } from './tokens';

export type TamanioCargando = 'sm' | 'md' | 'lg';

export interface CargandoProps {
  tam?: TamanioCargando;
  // Leyenda debajo: "Cargando rutinas…".
  texto?: string;
  // Color del tramo que gira. Por defecto text-primary; dentro de un boton,
  // el color del texto del boton (la pista pasa a ese color al 25 %).
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const TAMANIOS: Record<TamanioCargando, { lado: number; borde: number }> = {
  sm: { lado: 16, borde: 1.5 },
  md: { lado: 20, borde: 1.5 },
  lg: { lado: 28, borde: 2 },
};

export function Cargando({ tam = 'md', texto, color, style }: CargandoProps) {
  const { t, reducirMovimiento } = useLume();
  const { lado, borde } = TAMANIOS[tam];
  const tramo = color ?? t.textPrimary;
  const giro = useSharedValue(0);

  useEffect(() => {
    giro.value = 0;
    giro.value = withRepeat(
      withTiming(360, { duration: reducirMovimiento ? 3600 : 1200, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(giro);
  }, [giro, reducirMovimiento]);

  const girando = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value}deg` }] }));
  const circulo = { width: lado, height: lado, borderRadius: lado / 2, borderWidth: borde };

  return (
    <View
      style={[styles.base, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={texto ?? 'Cargando'}
      accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite"
    >
      <View style={{ width: lado, height: lado }}>
        <View
          style={[
            StyleSheet.absoluteFill,
            circulo,
            color ? { borderColor: color, opacity: 0.25 } : { borderColor: t.dataTrack },
          ]}
        />
        <Animated.View style={[StyleSheet.absoluteFill, circulo, styles.tramo, { borderTopColor: tramo }, girando]} />
      </View>
      {texto ? (
        <LumeText rol="bodySm" color={t.textSecondary}>
          {texto}
        </LumeText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', gap: lumeSpace[4] },
  tramo: {
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
