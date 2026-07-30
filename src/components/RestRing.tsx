/* Frencia · RestRing — anillo de descanso.
   Un aro que se vacia mientras corre la cuenta regresiva, con el tiempo en el
   centro. Es la unica animacion continua del design system.

   El aro no se redibuja por segundo: se lanza una sola interpolacion lineal
   contra el momento en que termina el descanso. Asi va a 60fps en el hilo de
   UI sin que el hilo de JS tenga que hacer nada, y el texto del centro puede
   seguir actualizandose una vez por segundo por su cuenta. */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RestRingProps {
  /** Duracion total del descanso, en segundos. */
  total: number;
  /** Momento (epoch ms) en que termina. De aca sale cuanto queda por animar. */
  finAt: number;
  size?: number;
  grosor?: number;
  color: string;
  colorPista: string;
  children?: React.ReactNode;
}

export function RestRing({
  total,
  finAt,
  size = 220,
  grosor = 10,
  color,
  colorPista,
  children,
}: RestRingProps) {
  const radio = (size - grosor) / 2;
  const centro = size / 2;
  const circunferencia = 2 * Math.PI * radio;

  // 1 = aro entero, 0 = vacio.
  const progreso = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(progreso);

    // Todavia no se fijo el arranque del descanso: aro entero, sin animar.
    if (finAt <= 0) {
      progreso.value = 1;
      return;
    }

    const restanteMs = Math.max(0, finAt - Date.now());

    // Arranca donde realmente esta, no en 1: al volver a un descanso ya
    // empezado el aro tiene que aparecer a medio vaciar.
    progreso.value = total > 0 ? Math.min(1, restanteMs / (total * 1000)) : 0;

    if (restanteMs > 0) {
      progreso.value = withTiming(0, {
        duration: restanteMs,
        easing: Easing.linear,
      });
    }

    return () => cancelAnimation(progreso);
  }, [finAt, total, progreso]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circunferencia * (1 - progreso.value),
  }));

  return (
    <View style={[styles.base, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={centro}
          cy={centro}
          r={radio}
          stroke={colorPista}
          strokeWidth={grosor}
          fill="none"
        />
        <AnimatedCircle
          cx={centro}
          cy={centro}
          r={radio}
          stroke={color}
          strokeWidth={grosor}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          animatedProps={animatedProps}
          // Arranca a las 12 en vez de a las 3.
          transform={`rotate(-90 ${centro} ${centro})`}
        />
      </Svg>
      <View style={styles.centro} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  centro: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
