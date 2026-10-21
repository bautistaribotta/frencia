/* ============================================================
   Frencia · Lume · Fondo de luces
   Va absoluto detras de cada pantalla. Capas, de abajo hacia arriba:
   bg-app, tres luces radiales (a: lume, b: ambiente, c: acero), el grano y
   el velo que oscurece (o aclara) arriba y abajo.

   Las luces no se mueven, salvo en el onboarding (`animado`): ahi derivan
   despacio y, al cambiar de paso, se desplazan de una posicion a la
   siguiente. Fuera del onboarding, un cambio de posicion es un fundido
   cruzado de 420 ms. Con Reducir movimiento el cambio es directo.
   Se anima la View de cada luz, no el degradado: corre en el hilo de UI y
   no re-renderiza el SVG.
   ============================================================ */

import React, { useCallback, useEffect, useId, useLayoutEffect, useState } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useLume } from './useLume';
import { lumeMotion } from './tokens';
import {
  DERIVA,
  GANANCIA,
  INTENSIDAD_SUAVE,
  POSICIONES,
  type IntensidadFondo,
  type Luz,
  type PosicionFondo,
} from './fondos';

const GRANO = require('../../../assets/images/lume/grano.png');

export interface FondoProps {
  posicion?: PosicionFondo;
  intensidad?: IntensidadFondo;
  // Solo en el onboarding: acceso, textos legales y setup del perfil.
  animado?: boolean;
  grano?: boolean;
}

export function Fondo({ posicion = 'cumbre', intensidad = 'pleno', animado = false, grano = true }: FondoProps) {
  const { t, modo, reducida, reducirMovimiento } = useLume();
  const { width: W, height: H } = useWindowDimensions();

  const [actual, setActual] = useState(posicion);
  // Onboarding: posicion hacia la que se estan desplazando las luces.
  const [hacia, setHacia] = useState<PosicionFondo | null>(null);
  // Fuera del onboarding: posicion que se esta desvaneciendo encima.
  const [saliente, setSaliente] = useState<PosicionFondo | null>(null);
  // Ultima posicion pedida desde afuera, para detectar el cambio en el render.
  const [pedida, setPedida] = useState(posicion);
  const recorrido = useSharedValue(0);
  const fundido = useSharedValue(1);

  if (posicion !== pedida) {
    setPedida(posicion);
    if (reducirMovimiento) {
      setHacia(null);
      setSaliente(null);
      setActual(posicion);
    } else if (animado) {
      setHacia(posicion);
    } else {
      setSaliente(actual);
      setActual(posicion);
    }
  }

  const llegar = useCallback((destino: PosicionFondo) => {
    setActual(destino);
    setHacia(null);
  }, []);

  // Onboarding: las luces viajan hacia la posicion nueva y al llegar se
  // re-renderizan ahi con transform cero.
  useEffect(() => {
    if (hacia === null) return;
    cancelAnimation(recorrido);
    recorrido.set(0);
    recorrido.set(
      withTiming(1, { duration: lumeMotion.recorrido, easing: Easing.inOut(Easing.cubic) }, (terminado) => {
        if (terminado) scheduleOnRN(llegar, hacia);
      }),
    );
  }, [hacia, recorrido, llegar]);

  // Con la posicion nueva ya pintada, las luces vuelven a transform cero.
  useLayoutEffect(() => {
    if (hacia === null) recorrido.set(0);
  }, [actual, hacia, recorrido]);

  // Fuera del onboarding: la posicion anterior se desvanece encima.
  useEffect(() => {
    if (saliente === null) return;
    fundido.set(0);
    fundido.set(
      withTiming(1, { duration: lumeMotion.fundido, easing: Easing.out(Easing.cubic) }, (terminado) => {
        if (terminado) scheduleOnRN(setSaliente, null);
      }),
    );
  }, [saliente, fundido]);

  const ganancia = reducida ? GANANCIA.reducirTransparencia : modo === 'dark' ? GANANCIA.oscuro : GANANCIA.claro;
  const deriva = animado && !reducirMovimiento;
  const destino = hacia ? POSICIONES[hacia] : null;

  const capas = (pos: PosicionFondo, desplazar: boolean) =>
    POSICIONES[pos].map((l, i) => (
      <CapaLuz
        key={l.capa}
        luz={l}
        hacia={desplazar ? destino?.[i] ?? null : null}
        recorrido={recorrido}
        color={t[`glow${l.capa.toUpperCase() as 'A' | 'B' | 'C'}`]}
        alfa={Math.min(1, l.alfa * ganancia * (intensidad === 'suave' ? INTENSIDAD_SUAVE[l.capa] : 1))}
        deriva={deriva}
        W={W}
        H={H}
      />
    ));

  const estiloSaliente = useAnimatedStyle(() => ({ opacity: 1 - fundido.value }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.fondo, { backgroundColor: t.bgApp }]}>
      {capas(actual, true)}
      {saliente ? (
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: t.bgApp }, estiloSaliente]}>
          {capas(saliente, false)}
        </Animated.View>
      ) : null}
      {grano && !reducida ? (
        <Image
          source={GRANO}
          resizeMode="repeat"
          style={[StyleSheet.absoluteFill, { width: W, height: H, opacity: modo === 'dark' ? 0.2 : 0.12 }]}
        />
      ) : null}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={[t.veloTop, sinAlfa(t.veloTop), sinAlfa(t.veloBottom), t.veloBottom]}
        locations={[0, 0.3, 0.64, 1]}
      />
    </View>
  );
}

/** El mismo color con alfa 0. Interpolar hacia 'transparent' tira a negro. */
function sinAlfa(rgba: string): string {
  return rgba.replace(/,\s*[\d.]+\)$/, ', 0)');
}

interface CapaLuzProps {
  luz: Luz;
  hacia: Luz | null;
  recorrido: SharedValue<number>;
  color: string;
  alfa: number;
  deriva: boolean;
  W: number;
  H: number;
}

function CapaLuz({ luz, hacia, recorrido, color, alfa, deriva, W, H }: CapaLuzProps) {
  const id = `luz-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const cx = (luz.x / 100) * W;
  const cy = (luz.y / 100) * H;
  const r = (luz.radio / 100) * W;
  // Cada luz se dibuja en un cuadrado que contiene su circulo entero: afuera
  // del circulo el degradado ya es transparente, asi que al desplazarla o al
  // derivar nunca queda a la vista un borde recto de la capa.
  const lado = 2 * r;

  // Desplazamiento entre posiciones: la luz viaja de su centro al nuevo y su
  // radio crece o se achica, escalando desde su propio centro.
  const dx = hacia ? ((hacia.x - luz.x) / 100) * W : 0;
  const dy = hacia ? ((hacia.y - luz.y) / 100) * H : 0;
  const escala = hacia ? hacia.radio / luz.radio : 1;
  const estiloRecorrido = useAnimatedStyle(() => ({
    transformOrigin: [cx, cy, 0],
    transform: [
      { translateX: recorrido.value * dx },
      { translateY: recorrido.value * dy },
      { scale: 1 + recorrido.value * (escala - 1) },
    ],
  }));

  // Deriva del onboarding: (0, 0, 1) -> (+5 %, -4 %, 1.08) -> (-4 %, +5 %, 0.96),
  // ida y vuelta, cada capa con su ciclo y su desfase.
  const fase = useSharedValue(0);
  useEffect(() => {
    if (!deriva) {
      cancelAnimation(fase);
      fase.set(withTiming(0, { duration: lumeMotion.durSlow }));
      return;
    }
    const { duracion, desfase } = DERIVA[luz.capa];
    const inicio = desfase / duracion;
    const curva = Easing.inOut(Easing.sin);
    fase.set(inicio);
    fase.set(
      withSequence(
        withTiming(1, { duration: duracion * (1 - inicio), easing: curva }),
        withRepeat(
          withSequence(
            withTiming(0, { duration: duracion, easing: curva }),
            withTiming(1, { duration: duracion, easing: curva }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(fase);
  }, [deriva, luz.capa, fase]);

  const estiloDeriva = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(fase.value, [0, 0.5, 1], [0, 0.05 * W, -0.04 * W]) },
      { translateY: interpolate(fase.value, [0, 0.5, 1], [0, -0.04 * H, 0.05 * H]) },
      { scale: interpolate(fase.value, [0, 0.5, 1], [1, 1.08, 0.96]) },
    ],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, estiloRecorrido]}>
      <Animated.View style={[StyleSheet.absoluteFill, estiloDeriva]}>
        <Svg width={lado} height={lado} style={{ position: 'absolute', left: cx - r, top: cy - r }}>
          <Defs>
            <RadialGradient id={id} cx={r} cy={r} r={r} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={color} stopOpacity={alfa} />
              <Stop offset="0.42" stopColor={color} stopOpacity={alfa * 0.45} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={lado} height={lado} fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fondo: { overflow: 'hidden', pointerEvents: 'none' },
});
