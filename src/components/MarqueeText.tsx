/* Frencia · MarqueeText — texto de una linea que, si no entra, se desplaza.
   Si el texto entra en el ancho disponible se muestra quieto. Si no entra, se
   mueve lento de derecha a izquierda como una cinta: dos copias seguidas con
   un espacio entre ellas, asi cuando la primera sale por la izquierda la
   segunda ya ocupa su lugar y el reinicio no se nota. Cada vuelta arranca con
   una pausa para que el comienzo del nombre se pueda leer quieto.

   Con "reducir movimiento" activado en el sistema no se anima: vuelve a los
   puntos suspensivos. */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { FrenciaText, type FrenciaTextProps } from '@/design';

// Pixeles por segundo. Bajo a proposito: tiene que poder leerse en movimiento.
const VELOCIDAD = 28;
// Pausa al comienzo de cada vuelta, con el texto en su posicion inicial.
const PAUSA_MS = 2000;
// Espacio entre el final del texto y el comienzo de la copia que lo sigue.
const SEPARACION = 40;

export interface MarqueeTextProps {
  text: string;
  role?: FrenciaTextProps['role'];
  color?: string;
  /** Estilo del texto. */
  style?: TextStyle;
  /** Estilo de la caja que recorta, por ejemplo `flex: 1` dentro de una fila. */
  boxStyle?: ViewStyle;
}

export function MarqueeText({ text, role, color, style, boxStyle }: MarqueeTextProps) {
  const [anchoCaja, setAnchoCaja] = useState(0);
  const [anchoTexto, setAnchoTexto] = useState(0);
  const reducirMovimiento = useReducedMotion();
  const desplazamiento = useSharedValue(0);

  // Medio pixel de tolerancia: el redondeo de las mediciones no tiene que
  // hacer mover un nombre que entra justo.
  const desborda = anchoCaja > 0 && anchoTexto > anchoCaja + 0.5;
  const animar = desborda && !reducirMovimiento;

  useEffect(() => {
    cancelAnimation(desplazamiento);
    desplazamiento.value = 0;
    if (!animar) return;

    const recorrido = anchoTexto + SEPARACION;
    desplazamiento.value = withRepeat(
      withSequence(
        withDelay(
          PAUSA_MS,
          withTiming(-recorrido, {
            duration: (recorrido / VELOCIDAD) * 1000,
            easing: Easing.linear,
          }),
        ),
        // Vuelve al inicio sin animar: la segunda copia esta justo ahi.
        withTiming(0, { duration: 0 }),
      ),
      -1,
    );
    return () => cancelAnimation(desplazamiento);
  }, [animar, anchoTexto, desplazamiento]);

  // Ancho explicito para cada copia y para la cinta. En iOS el texto se mide
  // contra el ancho del padre, y sin esto la copia se partia en dos lineas en
  // vez de salirse de la caja.
  const anchoCopia = Math.ceil(anchoTexto) + 1;

  const estiloCinta = useAnimatedStyle(() => ({
    transform: [{ translateX: desplazamiento.value }],
  }));

  function medirCaja(e: LayoutChangeEvent) {
    setAnchoCaja(e.nativeEvent.layout.width);
  }

  function medirTexto(e: LayoutChangeEvent) {
    setAnchoTexto(e.nativeEvent.layout.width);
  }

  return (
    <View style={[styles.caja, boxStyle]} onLayout={medirCaja} accessible accessibilityLabel={text}>
      {/* Medidor invisible: el texto sin cortar, en una fila ancha, para saber
          cuanto ocupa entero. */}
      <View style={styles.medidor} pointerEvents="none" aria-hidden>
        <FrenciaText role={role} color={color} style={[style, styles.sinEncoger]} onLayout={medirTexto}>
          {text}
        </FrenciaText>
      </View>

      {animar ? (
        <Animated.View style={[styles.cinta, { width: anchoCopia * 2 + SEPARACION }, estiloCinta]}>
          <FrenciaText role={role} color={color} style={[style, styles.sinEncoger, { width: anchoCopia }]}>
            {text}
          </FrenciaText>
          <View style={styles.separacion} />
          <FrenciaText
            role={role}
            color={color}
            style={[style, styles.sinEncoger, { width: anchoCopia }]}
            aria-hidden
          >
            {text}
          </FrenciaText>
        </Animated.View>
      ) : (
        <FrenciaText role={role} color={color} style={style} numberOfLines={1}>
          {text}
        </FrenciaText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { overflow: 'hidden', alignSelf: 'stretch' },
  medidor: { position: 'absolute', top: 0, left: 0, width: 10000, flexDirection: 'row', opacity: 0 },
  cinta: { flexDirection: 'row' },
  sinEncoger: { flexShrink: 0 },
  separacion: { width: SEPARACION },
});
