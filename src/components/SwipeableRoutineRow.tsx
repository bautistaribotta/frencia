/* Frencia · SwipeableRoutineRow — una fila de rutina que se desliza.
   En la vista de Rutinas la fila es la rutina entera, y sobre ella hay dos
   acciones opuestas que se piden con el mismo gesto en dos sentidos:

   - Arrastrar a la derecha descubre "Activar": deja esa rutina como la que esta
     en curso. Es reversible (se puede volver a activar otra), asi que se aplica
     al soltar sin preguntar.
   - Arrastrar a la izquierda descubre "Eliminar": borra la rutina. Es
     destructivo y no se puede deshacer, asi que cruzar el umbral no borra: pide
     confirmacion (el Alert lo levanta la pantalla).

   La rutina que ya esta en curso no se puede volver a activar, asi que hacia la
   derecha el arrastre ofrece resistencia y no descubre nada.

   El gesto se reconoce solo cuando el dedo va claramente en horizontal
   (activeOffsetX) y le cede el paso al scroll vertical de la lista
   (failOffsetY). Un toque corto, en cambio, abre la rutina. */

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

export interface SwipeableRoutineRowProps {
  title: string;
  /** Toque corto: abre la rutina. */
  onPress: () => void;
  /** Cruzo el umbral hacia la derecha. Solo si `canActivate`. */
  onActivate: () => void;
  /** Cruzo el umbral hacia la izquierda. La pantalla confirma antes de borrar. */
  onDelete: () => void;
  /** La rutina en curso no puede volver a activarse: sin accion a la derecha. */
  canActivate: boolean;
  children: React.ReactNode;
}

export function SwipeableRoutineRow({
  title,
  onPress,
  onActivate,
  onDelete,
  canActivate,
  children,
}: SwipeableRoutineRowProps) {
  const styles = useThemedStyles(makeStyles);
  const colors = useColors();

  const tx = useSharedValue(0);
  // 1 cuando el arrastre ya cruzo el umbral, para pegar un solo golpe al cruzar
  // y no uno por frame. Vive en el hilo de UI.
  const armado = useSharedValue(0);
  // 1 mientras el dedo esta apoyado sobre la fila: solo alimenta la opacidad.
  const apretada = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .failOffsetY([-14, 14])
        .onUpdate((e) => {
          // Resistencia progresiva pasado el umbral, y sentido sin accion
          // bloqueado (la rutina en curso no se puede reactivar).
          let v = e.translationX;
          if (v > 0 && !canActivate) v = 0;
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
          // Siempre vuelve a cero: la accion se ejecuta afuera (activar reordena
          // la lista, eliminar abre un Alert), y la fila no tiene por que
          // quedar colgada mientras tanto.
          tx.value = withTiming(0, { duration: motion.durBase });
          if (!paso) return;
          if (haciaDerecha) {
            if (canActivate) runOnJS(onActivate)();
          } else {
            runOnJS(onDelete)();
          }
        }),
    [tx, armado, canActivate, onActivate, onDelete],
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
  const activarStyle = useAnimatedStyle(() => {
    const p = interpolate(tx.value, [0, ANCHO_ACCION], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: p,
      transform: [
        { scale: interpolate(tx.value, [0, UMBRAL], [0.8, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  const eliminarStyle = useAnimatedStyle(() => {
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
      ...(canActivate ? [{ name: 'activar', label: 'Poner en curso' }] : []),
      { name: 'eliminar', label: 'Eliminar rutina' },
    ],
    [canActivate],
  );

  return (
    <View style={styles.wrap}>
      {/* Detras de la fila: las dos acciones, cada una anclada a su lado. */}
      <View style={styles.acciones} pointerEvents="none">
        {canActivate && (
          <Animated.View style={[styles.accion, styles.accionActivar, activarStyle]}>
            <Icon name="flame" size={22} color={colors.textOnAccent} />
          </Animated.View>
        )}
        <Animated.View style={[styles.accion, styles.accionEliminar, eliminarStyle]}>
          <Icon name="trash-2" size={22} color={colors.textOnAccent} />
        </Animated.View>
      </View>

      <GestureDetector gesture={gesto}>
        <Animated.View
          style={cardStyle}
          accessibilityActions={acciones}
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'activar') onActivate();
            else if (e.nativeEvent.actionName === 'eliminar') onDelete();
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
    wrap: { borderRadius: radius.lg, overflow: 'hidden' },
    acciones: { ...StyleSheet.absoluteFillObject, flexDirection: 'row' },
    accion: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: ANCHO_ACCION,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accionActivar: { left: 0, backgroundColor: colors.accent },
    accionEliminar: { right: 0, backgroundColor: colors.danger },
  });
