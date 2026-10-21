/* ============================================================
   Frencia · Lume · Rueda
   Columna vertical con snap por item. El numero centrado queda nitido en
   el ancho condensado y los vecinos se achican y se desvanecen. La banda
   de seleccion es una pastilla de vidrio fuerte de 52 px que dibuja
   EscenarioRueda, detras de las ruedas.
   El area tactil es mas ancha que la columna (`alcance`): el scroll se
   estira hacia los costados con margenes negativos y repone ese espacio
   como padding, asi los numeros no se mueven y se puede arrastrar desde
   cualquier parte del escenario, no solo encima del numero.
   ============================================================ */

import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';

import { useLume } from './useLume';
import { LumeText } from './LumeText';
import { Vidrio } from './Vidrio';
import { lumeFuente } from './tipografia';
import { lumeRadius, lumeSpace } from './tokens';

export const RUEDA_ITEM = 44;
const VISIBLES = 7;
const ALTO = RUEDA_ITEM * VISIBLES;
// Ventana de virtualizacion alrededor del centro actual: evita montar cientos
// de nodos con worklets de Reanimated (ej. las 375 libras del selector de peso)
// manteniendo el alto total del contenido intacto para el snap nativo.
const RADIO_VENTANA = 12;
const PASO_VENTANA = 4;

// Tic suave cada vez que un numero pasa por el centro.
function tic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

type Alinear = 'centro' | 'izq' | 'der';

// Cuanto se estira el area tactil a cada lado. AMPLIO llega hasta el borde
// del escenario; JUNTO es la mitad del hueco hasta la rueda vecina, para que
// dos ruedas no se pisen.
const AMPLIO = 200;
const JUNTO = 20;
const ALCANCE = {
  solo: { izq: AMPLIO, der: AMPLIO },
  primera: { izq: AMPLIO, der: JUNTO },
  segunda: { izq: JUNTO, der: AMPLIO },
} as const;

export interface RuedaProps {
  valores: (string | number)[];
  indice: number;
  onIndice: (i: number) => void;
  ancho?: number;
  alinear?: Alinear;
  // Rueda sola, o la primera / segunda de un par (ft · in, min · s, kg . dec).
  alcance?: keyof typeof ALCANCE;
}

export function Rueda({
  valores,
  indice,
  onIndice,
  ancho = 96,
  alinear = 'centro',
  alcance = 'solo',
}: RuedaProps) {
  const { izq, der } = ALCANCE[alcance];
  const { t } = useLume();
  const ref = useRef<ScrollView>(null);
  const maxIndice = Math.max(0, valores.length - 1);
  const indiceSeguro = Math.max(0, Math.min(maxIndice, indice));
  const y = useSharedValue(indiceSeguro * RUEDA_ITEM);
  const centrado = useSharedValue(indiceSeguro);
  const ventana = useSharedValue(indiceSeguro);
  const [centroVentana, setCentroVentana] = useState(indiceSeguro);
  const [ultimoIndice, setUltimoIndice] = useState(indiceSeguro);
  const listo = useRef(false);
  const pad = (ALTO - RUEDA_ITEM) / 2;
  const esLarga = valores.length > RADIO_VENTANA * 2 + 1;

  if (indiceSeguro !== ultimoIndice) {
    setUltimoIndice(indiceSeguro);
    setCentroVentana(indiceSeguro);
  }

  const centroSeguro = Math.max(0, Math.min(maxIndice, centroVentana));
  const desde = Math.max(0, centroSeguro - RADIO_VENTANA);
  const hasta = Math.min(maxIndice, centroSeguro + RADIO_VENTANA);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      y.set(e.contentOffset.y);
      const i = Math.round(e.contentOffset.y / RUEDA_ITEM);
      if (i !== centrado.get()) {
        centrado.set(i);
        scheduleOnRN(tic);
      }
      if (esLarga && Math.abs(i - ventana.get()) >= PASO_VENTANA) {
        ventana.set(i);
        scheduleOnRN(setCentroVentana, i);
      }
    },
  });

  function asentar(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.max(0, Math.min(valores.length - 1, Math.round(e.nativeEvent.contentOffset.y / RUEDA_ITEM)));
    if (esLarga) {
      ventana.set(i);
      setCentroVentana(i);
    }
    if (i !== indice) onIndice(i);
  }

  // Si el indice cambia desde afuera, la rueda lo sigue.
  useEffect(() => {
    ventana.set(indiceSeguro);
    if (!listo.current) return;
    ref.current?.scrollTo({ y: indiceSeguro * RUEDA_ITEM, animated: true });
  }, [indiceSeguro, ventana]);

  return (
    <Animated.ScrollView
      ref={ref}
      style={{ height: ALTO, width: ancho + izq + der, marginLeft: -izq, marginRight: -der, flexGrow: 0 }}
      showsVerticalScrollIndicator={false}
      snapToInterval={RUEDA_ITEM}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={onScroll}
      onMomentumScrollEnd={asentar}
      onScrollEndDrag={asentar}
      onContentSizeChange={() => {
        if (listo.current) return;
        listo.current = true;
        ref.current?.scrollTo({ y: indiceSeguro * RUEDA_ITEM, animated: false });
      }}
      contentContainerStyle={{ paddingVertical: pad, paddingLeft: izq, paddingRight: der }}
    >
      <View style={{ height: valores.length * RUEDA_ITEM, paddingTop: desde * RUEDA_ITEM }}>
        {valores.slice(desde, hasta + 1).map((v, idx) => {
          const i = desde + idx;
          return <Item key={i} texto={String(v)} i={i} y={y} alinear={alinear} color={t.textPrimary} />;
        })}
      </View>
    </Animated.ScrollView>
  );
}

const Item = memo(function Item({
  texto,
  i,
  y,
  alinear,
  color,
}: {
  texto: string;
  i: number;
  y: SharedValue<number>;
  alinear: Alinear;
  color: string;
}) {
  // Tamaños del kit: 34 el elegido, 25 / 21 / 18 los vecinos.
  const estilo = useAnimatedStyle(() => {
    const d = Math.abs(y.get() / RUEDA_ITEM - i);
    return {
      opacity: interpolate(d, [0, 1, 2, 3], [1, 0.48, 0.26, 0.14], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 1, 2, 3], [1, 25 / 34, 21 / 34, 18 / 34], Extrapolation.CLAMP) }],
    };
  });
  const origen = alinear === 'der' ? 'right' : alinear === 'izq' ? 'left' : 'center';
  return (
    <Animated.View style={[styles.item, { transformOrigin: origen }, estilo]}>
      <LumeText rol="hero" color={color} style={[styles.numero, { textAlign: origen }]}>
        {texto}
      </LumeText>
    </Animated.View>
  );
});

/* Escenario: la banda de seleccion en vidrio fuerte, las ruedas encima y la
   unidad al costado. */
export interface EscenarioRuedaProps {
  unidad?: string;
  children: React.ReactNode;
}

export function EscenarioRueda({ unidad, children }: EscenarioRuedaProps) {
  const { t } = useLume();
  return (
    <View style={styles.escenario}>
      <Vidrio nivel="fuerte" radio={lumeRadius.lg} style={styles.banda} />
      <View style={styles.ruedas}>{children}</View>
      {unidad ? (
        <View style={styles.unidadLado}>
          <LumeText rol="body" color={t.textTertiary} style={styles.unidad}>
            {unidad}
          </LumeText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: { height: RUEDA_ITEM, justifyContent: 'center' },
  numero: { fontSize: 34, lineHeight: 40, letterSpacing: -0.7 },
  escenario: { height: ALTO, alignSelf: 'stretch' },
  banda: { position: 'absolute', left: 0, right: 0, top: (ALTO - 52) / 2, height: 52 },
  ruedas: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: lumeSpace[2] },
  unidadLado: { pointerEvents: 'none', position: 'absolute', right: lumeSpace[5], top: 0, bottom: 0, justifyContent: 'center' },
  unidad: { fontFamily: lumeFuente.medium, lineHeight: 22 },
});
