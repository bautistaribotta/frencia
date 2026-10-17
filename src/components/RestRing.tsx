/* Frencia · RestRing — la esfera del descanso (Lume).
   Un disco de vidrio con 60 marcas alrededor y un arco de lume que se vacia
   mientras corre la cuenta regresiva, con el tiempo en el centro. Es la unica
   animacion continua fuera del onboarding.

   Las marcas hacen de esfera de reloj: cada cinco, una mayor. Las que todavia
   quedan por delante del descanso se encienden en lume junto con el arco, asi
   lo que falta se lee de un vistazo aunque no se mire el numero.

   El arco no se redibuja por segundo: se lanza una sola interpolacion lineal
   contra el momento en que termina el descanso. Asi va a 60fps en el hilo de
   UI sin que el hilo de JS tenga que hacer nada. Las marcas si las pinta JS,
   pero solo cambian cuando se apaga una (cada total / 60 segundos), y el
   texto del centro sigue actualizandose una vez por segundo por su cuenta.

   El brillo del arco (halo-signal) es un segundo arco mas ancho y tenue
   debajo del principal: react-native-svg no tiene el drop-shadow de la web. */

import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Vidrio, useLume, type LumePalette } from '@/design/lume';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MARCAS = 60;
const LADO = 240;
const CENTRO = LADO / 2;
const RADIO_ARCO = 96;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO_ARCO;

export interface RestRingProps {
  /** Duracion total del descanso, en segundos. */
  total: number;
  /** Momento (epoch ms) en que termina. 0 = todavia no arranco. */
  finAt: number;
  /** Segundos que quedan, para las marcas. */
  restante: number;
  children?: React.ReactNode;
}

export function RestRing({ total, finAt, restante, children }: RestRingProps) {
  const { t } = useLume();

  // 1 = arco entero, 0 = vacio.
  const progreso = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(progreso);

    // Todavia no se fijo el arranque del descanso: arco entero, sin animar.
    if (finAt <= 0) {
      progreso.value = 1;
      return;
    }

    const restanteMs = Math.max(0, finAt - Date.now());

    // Arranca donde realmente esta, no en 1: al volver a un descanso ya
    // empezado el arco tiene que aparecer a medio vaciar.
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
    strokeDashoffset: CIRCUNFERENCIA * (1 - progreso.value),
  }));

  // El padre recalcula el restante cada medio segundo mientras corre el
  // descanso: alcanza para que las marcas se apaguen a tiempo.
  const fraccion = total > 0 ? Math.min(1, Math.max(0, restante / total)) : 0;
  const encendidas = Math.ceil(fraccion * MARCAS);

  return (
    <View style={styles.base}>
      {/* El disco de vidrio, debajo de las marcas y el arco. */}
      <Vidrio radio={CENTRO} style={StyleSheet.absoluteFill} />
      <Svg width={LADO} height={LADO} style={StyleSheet.absoluteFill}>
        <Esfera encendidas={encendidas} t={t} />
        <Circle
          cx={CENTRO}
          cy={CENTRO}
          r={RADIO_ARCO}
          stroke={t.dataTrack}
          strokeWidth={2}
          fill="none"
        />
        <AnimatedCircle
          cx={CENTRO}
          cy={CENTRO}
          r={RADIO_ARCO}
          stroke={t.signal}
          strokeOpacity={0.3}
          strokeWidth={7}
          fill="none"
          strokeDasharray={CIRCUNFERENCIA}
          animatedProps={animatedProps}
          // Arranca a las 12 en vez de a las 3.
          transform={`rotate(-90 ${CENTRO} ${CENTRO})`}
        />
        <AnimatedCircle
          cx={CENTRO}
          cy={CENTRO}
          r={RADIO_ARCO}
          stroke={t.signal}
          strokeWidth={2}
          fill="none"
          strokeDasharray={CIRCUNFERENCIA}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${CENTRO} ${CENTRO})`}
        />
      </Svg>
      <View style={styles.centro}>{children}</View>
    </View>
  );
}

/* Las 60 marcas. Memorizadas por cuantas quedan encendidas: entre que se
   apaga una y la siguiente no hace falta volver a dibujar ninguna. */
const Esfera = memo(function Esfera({ encendidas, t }: { encendidas: number; t: LumePalette }) {
  const lineas: React.ReactNode[] = [];
  for (let i = 0; i < MARCAS; i++) {
    const a = (i / MARCAS) * 2 * Math.PI - Math.PI / 2;
    const mayor = i % 5 === 0;
    const r1 = CENTRO - 2;
    const r2 = r1 - (mayor ? 9 : 5);
    const color = i < encendidas ? t.signal : mayor ? t.textTertiary : t.dataTick;
    lineas.push(
      <Line
        key={i}
        x1={CENTRO + r1 * Math.cos(a)}
        y1={CENTRO + r1 * Math.sin(a)}
        x2={CENTRO + r2 * Math.cos(a)}
        y2={CENTRO + r2 * Math.sin(a)}
        stroke={color}
        strokeWidth={1}
      />,
    );
  }
  return <>{lineas}</>;
});

const styles = StyleSheet.create({
  base: { width: LADO, height: LADO },
  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    pointerEvents: 'none',
  },
});
