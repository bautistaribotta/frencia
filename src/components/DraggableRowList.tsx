/* Frencia · DraggableRowList — lista reordenable a mano.
   La usan los ejercicios de un dia y los dias de una rutina: en los dos casos
   el orden es un dato, no una casualidad, asi que las filas se arrastran para
   acomodarlas. No sabe de que son las filas; recibe titulo y detalle ya
   armados.

   Por que a mano y no una libreria: la lista vive adentro de otro ScrollView y
   tiene, como mucho, un punado de filas. Meter una FlatList arrastrable adentro
   de otro scroll trae mas problemas (scroll anidado, virtualizacion, una
   dependencia nativa mas) de los que resuelve.

   Como funciona: las filas quedan en el flujo normal y solo se les anima
   translateY. La que se arrastra sigue al dedo; las demas se corren un lugar
   cuando esa cruza su posicion. Al soltar, la fila cae en el hueco y recien ahi
   se avisa el orden nuevo.

   El gesto se activa recien despues de mantener apretado (200ms) para no
   pelear con el scroll de alrededor: un arrastre corto sigue scrolleando. Ese
   mismo umbral separa las dos acciones de la fila cuando hay onPress: un toque
   corto la abre, mantenerla apretada la levanta. */

import React, { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { MarqueeText } from '@/components/MarqueeText';

import { Icon } from '@/design';
import {
  LumeText,
  lumeMotion,
  lumeRadius,
  lumeSpace,
  useLume,
  type LumePalette,
} from '@/design/lume';

// Separacion entre filas. Entra en el paso de arrastre: cada lugar de la lista
// mide alto de fila + este hueco.
const GAP = lumeSpace[2];

const LONG_PRESS_MS = 200;

// Tic al levantar una fila y cada vez que cambia de lugar.
function tick() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

/** Fila de la lista. `key` tiene que ser estable entre reordenamientos: si
 *  cambia al mover, React desmonta la fila en pleno arrastre. */
export interface RowData {
  key: string;
  title: string;
  /** Texto plano, o un nodo ya armado (por ejemplo un ExerciseSummary). */
  detail: React.ReactNode;
}

export interface DraggableRowListProps {
  items: RowData[];
  /** Mueve el elemento de `from` a `to` (indices sobre `items`). */
  onReorder: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  /** Toque corto sobre una fila. Sin esto la fila no responde al toque. */
  onPress?: (index: number) => void;
}

export function DraggableRowList({
  items,
  onReorder,
  onRemove,
  onPress,
}: DraggableRowListProps) {
  const { t: colors, sombras } = useLume();

  // Alto de fila real, medido una sola vez. Todas las filas tienen la misma
  // estructura, asi que alcanza con la primera. Hasta tenerlo, el arrastre
  // queda deshabilitado: sin el paso no se puede calcular a que lugar va.
  const [rowH, setRowH] = useState(0);

  // Indice de la fila levantada (-1 = ninguna), lugar sobre el que esta
  // parada, y cuanto la corrio el dedo.
  const from = useSharedValue(-1);
  const over = useSharedValue(-1);
  const dragY = useSharedValue(0);

  const measure = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setRowH((prev) => (prev === 0 ? h : prev));
  }, []);

  const commit = useCallback(
    (f: number, t: number) => {
      if (f !== t) onReorder(f, t);
      from.value = -1;
      over.value = -1;
      dragY.value = 0;
    },
    [from, over, dragY, onReorder],
  );

  const step = rowH + GAP;
  const draggable = rowH > 0 && items.length > 1;

  return (
    <View style={styles.list}>
      {items.map((item, i) => (
        <Row
          key={item.key}
          item={item}
          index={i}
          count={items.length}
          step={step}
          draggable={draggable}
          from={from}
          over={over}
          dragY={dragY}
          onMeasure={i === 0 ? measure : undefined}
          onRemove={onRemove}
          onPress={onPress}
          commit={commit}
          colors={colors}
          sombras={sombras}
        />
      ))}
    </View>
  );
}

interface RowProps {
  item: RowData;
  index: number;
  count: number;
  step: number;
  draggable: boolean;
  from: SharedValue<number>;
  over: SharedValue<number>;
  dragY: SharedValue<number>;
  onMeasure?: (e: LayoutChangeEvent) => void;
  onRemove: (index: number) => void;
  onPress?: (index: number) => void;
  commit: (from: number, to: number) => void;
  colors: LumePalette;
  sombras: ReturnType<typeof useLume>['sombras'];
}

function Row({
  item,
  index,
  count,
  step,
  draggable,
  from,
  over,
  dragY,
  onMeasure,
  onRemove,
  onPress,
  commit,
  colors,
  sombras,
}: RowProps) {
  // 1 mientras el dedo esta sobre la fila. Solo alimenta la opacidad, asi que
  // vive en el hilo de UI y no dispara renders.
  const apretada = useSharedValue(0);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(draggable)
        .activateAfterLongPress(LONG_PRESS_MS)
        .onStart(() => {
          from.value = index;
          over.value = index;
          dragY.value = 0;
          scheduleOnRN(tick);
        })
        .onUpdate((e) => {
          dragY.value = e.translationY;
          // A que lugar apunta el dedo: cada `step` recorrido es un lugar.
          const raw = index + Math.round(e.translationY / step);
          const target = Math.max(0, Math.min(count - 1, raw));
          if (target !== over.value) {
            over.value = target;
            scheduleOnRN(tick);
          }
        })
        .onEnd((_e, success) => {
          const f = from.value;
          const t = over.value;
          if (f < 0) return;
          if (!success) {
            // Gesto cancelado: volvemos al orden actual sin tocar nada.
            scheduleOnRN(commit, f, f);
            return;
          }
          // La fila cae en el hueco antes de avisar el orden nuevo, asi el
          // salto entre la posicion del dedo y la definitiva no se ve.
          dragY.value = withTiming((t - f) * step, { duration: lumeMotion.durFast }, (done) => {
            if (done) scheduleOnRN(commit, f, t);
          });
        }),
    [draggable, index, count, step, from, over, dragY, commit],
  );

  const tap = useMemo(
    () =>
      Gesture.Tap()
        .enabled(onPress !== undefined)
        // onBegin/onFinalize y no onStart: el destello tiene que aparecer al
        // apoyar el dedo, no cuando el gesto ya se reconocio.
        .onBegin(() => {
          apretada.value = 1;
        })
        .onFinalize(() => {
          apretada.value = 0;
        })
        .onEnd((_e, success) => {
          if (success && onPress) scheduleOnRN(onPress, index);
        }),
    [onPress, index, apretada],
  );

  // Exclusive y no Simultaneous: son dos acciones distintas sobre la misma
  // fila. El pan tiene prioridad, y como recien se activa despues del long
  // press, un toque corto lo deja pasar y lo reconoce el tap.
  const gesto = useMemo(() => Gesture.Exclusive(pan, tap), [pan, tap]);

  const animStyle = useAnimatedStyle(() => {
    const f = from.value;

    if (f === index) {
      return {
        transform: [{ translateY: dragY.value }, { scale: 1.02 }],
        zIndex: 2,
        backgroundColor: colors.surfaceCardElevated,
        boxShadow: sombras.lg,
        // La fila levantada no se atenua: ya se distingue por la escala, la
        // sombra y el vidrio fuerte, y bajarle la opacidad la haria ver deshabilitada. El numero
        // pelado corta la animacion del toque, que es justo lo que se quiere al
        // pasar de apretar a arrastrar.
        opacity: 1,
      };
    }

    const opacity = withTiming(apretada.value === 1 ? 0.72 : 1, {
      duration: lumeMotion.durFast,
    });

    if (f < 0) {
      return {
        transform: [{ translateY: 0 }, { scale: 1 }],
        zIndex: 0,
        backgroundColor: colors.surfaceCard,
        boxShadow: sombras.glass,
        opacity,
      };
    }

    // Las filas entre el origen y el destino se corren un lugar para abrir el
    // hueco donde va a caer la que se arrastra.
    const t = over.value;
    let shift = 0;
    if (f < index && index <= t) shift = -step;
    else if (t <= index && index < f) shift = step;

    return {
      transform: [{ translateY: withTiming(shift, { duration: lumeMotion.durFast }) }, { scale: 1 }],
      zIndex: 0,
      borderColor: colors.borderSubtle,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[styles.row, { borderColor: colors.glassLine, borderTopColor: colors.glassHighlight }, animStyle]}
      onLayout={onMeasure}
    >
      {/* Solo el asa y el texto reciben los gestos: el tacho queda afuera para
         que mantenerlo apretado no levante la fila ni la abra. */}
      <GestureDetector gesture={gesto}>
        <View
          style={styles.dragZone}
          accessible={onPress !== undefined}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={onPress ? `Editar ${item.title}` : undefined}
        >
          {draggable && (
            <Icon name="grip-vertical" size={18} strokeWidth={1.75} color={colors.textTertiary} />
          )}
          <View style={styles.info}>
            <MarqueeText text={item.title} role="bodySm" color={colors.textPrimary} />
            {typeof item.detail === 'string' ? (
              <LumeText rol="label" color={colors.textTertiary}>
                {item.detail}
              </LumeText>
            ) : (
              item.detail
            )}
          </View>
        </View>
      </GestureDetector>

      <Pressable
        hitSlop={8}
        onPress={() => onRemove(index)}
        accessibilityRole="button"
        accessibilityLabel={`Quitar ${item.title}`}
      >
        <Icon name="trash-2" size={18} strokeWidth={1.75} color={colors.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Filas sueltas en vez de una tarjeta con divisores: al levantar una, el
  // hueco que deja tiene que verse como un lugar vacio, no como una tarjeta
  // partida al medio.
  list: { gap: GAP },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lumeSpace[4],
    paddingVertical: lumeSpace[4],
    paddingRight: lumeSpace[4],
    paddingLeft: lumeSpace[3],
    borderRadius: lumeRadius.lg,
    borderWidth: 1,
  },
  dragZone: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: lumeSpace[4] },
  info: { flex: 1, gap: lumeSpace[1] },
});
