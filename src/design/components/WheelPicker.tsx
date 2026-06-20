/* Frencia · WheelPicker — rueda de seleccion scrolleable (estilo dial).
   Columna vertical con snap por item: el valor centrado queda nitido y los
   vecinos se desvanecen y achican. Pensado para datos numericos (altura, peso),
   por eso usa la tipografia mono. La barra de seleccion la dibuja el contenedor
   (ver MeasurePicker), aca solo va la columna de numeros. */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { mono, type Palette } from '../theme';
import { useThemedStyles } from '../theme-context';

type Align = 'center' | 'left' | 'right';

export interface WheelPickerProps {
  values: (string | number)[];
  index: number;
  onIndexChange: (i: number) => void;
  itemHeight?: number;
  visibleCount?: number;
  width?: number;
  align?: Align;
}

export function WheelPicker({
  values,
  index,
  onIndexChange,
  itemHeight = 44,
  visibleCount = 7,
  width,
  align = 'center',
}: WheelPickerProps) {
  const styles = useThemedStyles(makeStyles);
  const scrollRef = useRef<React.ElementRef<typeof Animated.ScrollView>>(null);
  const scrollY = useSharedValue(index * itemHeight);
  const inited = useRef(false);

  const height = itemHeight * visibleCount;
  const pad = (height - itemHeight) / 2;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Al frenar, el item mas cercano al centro pasa a ser el seleccionado.
  function settle(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.max(0, Math.min(values.length - 1, Math.round(y / itemHeight)));
    if (i !== index) onIndexChange(i);
  }

  // Sincroniza la posicion cuando el indice cambia desde afuera (ej. cambio
  // de unidad recalcula el valor).
  useEffect(() => {
    if (!inited.current) return;
    scrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
  }, [index, itemHeight]);

  // Posicion inicial sin animacion, una sola vez, cuando ya hay contenido.
  function onContentSizeChange() {
    if (inited.current) return;
    inited.current = true;
    scrollRef.current?.scrollTo({ y: index * itemHeight, animated: false });
  }

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{ height, width }}
      showsVerticalScrollIndicator={false}
      snapToInterval={itemHeight}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={onScroll}
      onMomentumScrollEnd={settle}
      onScrollEndDrag={settle}
      onContentSizeChange={onContentSizeChange}
      contentContainerStyle={{ paddingVertical: pad }}
    >
      {values.map((v, i) => (
        <WheelItem
          key={`${v}-${i}`}
          label={String(v)}
          i={i}
          scrollY={scrollY}
          itemHeight={itemHeight}
          align={align}
          textStyle={styles.text}
        />
      ))}
    </Animated.ScrollView>
  );
}

function WheelItem({
  label,
  i,
  scrollY,
  itemHeight,
  align,
  textStyle,
}: {
  label: string;
  i: number;
  scrollY: SharedValue<number>;
  itemHeight: number;
  align: Align;
  textStyle: TextStyle;
}) {
  const animStyle = useAnimatedStyle(() => {
    const pos = scrollY.value / itemHeight;
    const dist = Math.abs(pos - i);
    const opacity = interpolate(dist, [0, 1, 2, 3], [1, 0.4, 0.18, 0.07], Extrapolation.CLAMP);
    const scale = interpolate(dist, [0, 1, 2], [1, 0.82, 0.7], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const textAlign: TextStyle['textAlign'] =
    align === 'right' ? 'right' : align === 'left' ? 'left' : 'center';

  return (
    <Animated.View style={[{ height: itemHeight, justifyContent: 'center' }, animStyle]}>
      <Animated.Text style={[textStyle, { textAlign }]}>{label}</Animated.Text>
    </Animated.View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    text: {
      fontFamily: mono.medium,
      fontSize: 28,
      color: colors.textPrimary,
      includeFontPadding: false,
    },
  });
