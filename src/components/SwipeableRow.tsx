/* Frencia · SwipeableRow — una fila que se desliza para descubrir acciones.
   Cada sentido del arrastre puede tener su accion, y la accion aparece
   anclada del lado que la fila deja al descubierto:

   - `derecha`: se pide arrastrando hacia la derecha; aparece a la izquierda.
   - `izquierda`: se pide arrastrando hacia la izquierda; aparece a la derecha.

   La fila nunca queda abierta: al soltar vuelve a cero y, si el arrastre cruzo
   el umbral, dispara la accion. Las destructivas no borran directo: la
   pantalla confirma con un Alert. Un sentido sin accion ofrece resistencia y
   no descubre nada.

   Hoy lo usan Rutinas (derecha elimina, izquierda pone en curso) e Historial
   (derecha elimina el entrenamiento).

   El gesto se reconoce solo cuando el dedo va claramente en horizontal
   (activeOffsetX) y le cede el paso al scroll vertical de la lista
   (failOffsetY). Un toque corto, en cambio, abre la fila. */

import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  Icon,
  motion,
  radius,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

// Ancho que descubre cada accion cuando la fila queda abierta en reposo... solo
// que no queda abierta: al soltar siempre vuelve a cero. Es la referencia con
// la que se dibuja el arrastre y desde donde se mide el umbral.
const ANCHO_ACCION = 96;

// Cuanto hay que arrastrar para que la accion se dispare al soltar. Un poco mas
// que el ancho descubierto: obliga a un gesto decidido, no a un roce.
const UMBRAL = 104;

// Mas alla del umbral el arrastre se endurece: la fila sigue al dedo cada vez
// menos, para que se sienta el tope sin frenarlo en seco.
const RESISTENCIA = 0.35;

function golpe(estilo: Haptics.ImpactFeedbackStyle) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(estilo).catch(() => {});
}

export interface AccionDeslizable {
  icon: string;
  /** accent para acciones reversibles, danger para las destructivas. */
  tono: 'accent' | 'danger';
  /** Nombre de la accion para el lector de pantalla. */
  label: string;
  /** Cruzo el umbral. Si es destructiva, la pantalla confirma antes. */
  onTrigger: () => void;
}

export interface SwipeableRowProps {
  /** Toque corto: abre lo que representa la fila. */
  onPress: () => void;
  /** Accion al arrastrar hacia la derecha. */
  derecha?: AccionDeslizable;
  /** Accion al arrastrar hacia la izquierda. */
  izquierda?: AccionDeslizable;
  /** Radio de la tarjeta que envuelve, para recortar las acciones a su forma. */
  radio?: 'lg' | 'xl';
  children: React.ReactNode;
}

export function SwipeableRow({
  onPress,
  derecha,
  izquierda,
  radio = 'lg',
  children,
}: SwipeableRowProps) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  const tx = useSharedValue(0);
  // 1 cuando el arrastre ya cruzo el umbral, para pegar un solo golpe al cruzar
  // y no uno por frame. Vive en el hilo de UI.
  const armado = useSharedValue(0);
  // 1 mientras el dedo esta apoyado sobre la fila: solo alimenta la opacidad.
  const apretada = useSharedValue(0);

  const onDerecha = derecha?.onTrigger;
  const onIzquierda = izquierda?.onTrigger;
  const hayDerecha = onDerecha !== undefined;
  const hayIzquierda = onIzquierda !== undefined;

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-14, 14])
        .onUpdate((e) => {
          // Resistencia progresiva pasado el umbral, y sentido sin accion
          // bloqueado.
          let v = e.translationX;
          if (v > 0 && !hayDerecha) v = 0;
          if (v < 0 && !hayIzquierda) v = 0;
          if (Math.abs(v) > UMBRAL) {
            v = Math.sign(v) * (UMBRAL + (Math.abs(v) - UMBRAL) * RESISTENCIA);
          }
          tx.value = v;
          const cruzo = Math.abs(v) >= UMBRAL ? 1 : 0;
          if (cruzo !== armado.value) {
            armado.value = cruzo;
            if (cruzo === 1) runOnJS(golpe)(Haptics.ImpactFeedbackStyle.Medium);
          }
        })
        .onEnd(() => {
          const paso = Math.abs(tx.value) >= UMBRAL;
          const haciaDerecha = tx.value > 0;
          armado.value = 0;
          // Siempre vuelve a cero: la accion se ejecuta afuera (reordenar la
          // lista, abrir un Alert), y la fila no tiene por que quedar colgada
          // mientras tanto.
          tx.value = withTiming(0, { duration: motion.durBase });
          if (!paso) return;
          if (haciaDerecha) {
            if (onDerecha) runOnJS(onDerecha)();
          } else if (onIzquierda) {
            runOnJS(onIzquierda)();
          }
        }),
    [tx, armado, hayDerecha, hayIzquierda, onDerecha, onIzquierda],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(10)
        // onBegin/onFinalize y no onStart: el destello aparece al apoyar el
        // dedo, no cuando el gesto ya se reconocio.
        .onBegin(() => {
          apretada.value = 1;
        })
        .onFinalize(() => {
          apretada.value = 0;
        })
        .onEnd((_e, success) => {
          if (success) runOnJS(onPress)();
        }),
    [onPress, apretada],
  );

  const gesto = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
    // El destello solo cuando la fila esta en reposo: durante el arrastre la
    // opacidad se queda quieta para que no titile.
    opacity:
      tx.value === 0
        ? withTiming(apretada.value === 1 ? 0.72 : 1, { duration: motion.durFast })
        : 1,
  }));

  // La accion crece con el arrastre en su sentido y se apaga en el otro. El
  // icono se agranda un toque al llegar al umbral, como aviso de que ya dispara.
  const derechaStyle = useAnimatedStyle(() => {
    const p = interpolate(tx.value, [0, ANCHO_ACCION], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [
        { scale: interpolate(tx.value, [0, UMBRAL], [0.8, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const izquierdaStyle = useAnimatedStyle(() => {
    const p = interpolate(tx.value, [-ANCHO_ACCION, 0], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [
        { scale: interpolate(tx.value, [-UMBRAL, 0], [1, 0.8], Extrapolation.CLAMP) },
      ],
    };
  });

  // Acciones accesibles: el gesto no puede ser la unica via. El lector de
  // pantalla las ofrece como acciones sobre la fila.
  const acciones = useMemo(
    () => [
      ...(derecha ? [{ name: 'derecha', label: derecha.label }] : []),
      ...(izquierda ? [{ name: 'izquierda', label: izquierda.label }] : []),
    ],
    [derecha, izquierda],
  );

  const fondo = (tono: AccionDeslizable['tono']) =>
    tono === 'danger' ? styles.tonoDanger : styles.tonoAccent;

  return (
    <View style={[styles.wrap, radio === 'xl' ? styles.radioXl : styles.radioLg]}>
      {/* Detras de la fila: cada accion anclada al lado que se descubre. */}
      <View style={styles.acciones}>
        {derecha && (
          <Animated.View style={[styles.accion, styles.ladoIzquierdo, fondo(derecha.tono), derechaStyle]}>
            <Icon name={derecha.icon} size={22} color={colors.textOnAccent} />
          </Animated.View>
        )}
        {izquierda && (
          <Animated.View style={[styles.accion, styles.ladoDerecho, fondo(izquierda.tono), izquierdaStyle]}>
            <Icon name={izquierda.icon} size={22} color={colors.textOnAccent} />
          </Animated.View>
        )}
      </View>

      <GestureDetector gesture={gesto}>
        <Animated.View
          style={cardStyle}
          accessibilityActions={acciones}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'derecha') derecha?.onTrigger();
            else if (e.nativeEvent.actionName === 'izquierda') izquierda?.onTrigger();
          }}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    // Recorta las acciones a la forma de la tarjeta: sin esto, los rectangulos
    // de color asoman por las esquinas redondeadas.
    wrap: { overflow: 'hidden' },
    radioLg: { borderRadius: radius.lg },
    radioXl: { borderRadius: radius.xl },
    acciones: { ...StyleSheet.absoluteFill, flexDirection: 'row', pointerEvents: 'none' },
    accion: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: ANCHO_ACCION,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ladoIzquierdo: { left: 0 },
    ladoDerecho: { right: 0 },
    tonoAccent: { backgroundColor: colors.accent },
    tonoDanger: { backgroundColor: colors.danger },
  });
