/* ============================================================
   Frencia · Lume · Regla
   Altura y peso se eligen con una lectura grande arriba y una regla en
   vidrio abajo: se desliza de costado y la aguja de lume, fija al centro,
   marca el valor. Las marcas largas caen cada `mayor` pasos (con numero),
   las medias cada `media`. La banda es mas ancha que la pantalla: los
   extremos salen por los costados, igual que la regla curva del peso.
   Trabaja en la unidad que se muestra; la conversion al canonico la hace
   quien la monta.
   ============================================================ */

import React, { useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Polygon } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { useLume, useLumeStyles, type LumeSombras } from './useLume';
import { LumeText } from './LumeText';
import { Vidrio } from './Vidrio';
import { lumeFuente } from './tipografia';
import { lumeLayout, lumeRadius, lumeSpace, type LumePalette } from './tokens';

// Separacion entre marcas, en px.
const ESP = 10;
// Alto de la regla. La regla curva del peso usa el mismo grosor.
export const ALTO_REGLA = 92;
const ALTO = ALTO_REGLA;
// Cuanto sobresale la regla por cada costado: el margen de pantalla mas el
// radio, asi las esquinas redondeadas quedan afuera y el borde del telefono
// corta la banda, igual que la regla curva del peso.
const SANGRE = lumeLayout.padScreen + lumeRadius.xl;

export interface ReglaProps {
  min: number;
  max: number;
  paso?: number;
  valor: number;
  onChange: (valor: number) => void;
  unidad?: string;
  decimales?: number;
  // Cada cuantos pasos va una marca larga con numero, y una media.
  mayor?: number;
  media?: number;
  // Texto de los numeros bajo las marcas largas.
  fmt?: (v: number) => string;
  // Lectura propia (altura en pies y pulgadas).
  lectura?: (v: number) => React.ReactNode;
  accessibilityLabel?: string;
}

const redondear = (v: number) => Math.round(v * 1000) / 1000;

function tic() {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function Regla({
  min,
  max,
  paso = 1,
  valor,
  onChange,
  unidad,
  decimales = 0,
  mayor = 10,
  media = 5,
  fmt,
  lectura,
  accessibilityLabel,
}: ReglaProps) {
  const { t } = useLume();
  const styles = useLumeStyles(makeStyles);
  const ref = useRef<ScrollViewInstance>(null);
  const [ancho, setAncho] = useState(0);
  const total = Math.round((max - min) / paso);
  const indiceDe = (v: number) => Math.max(0, Math.min(total, Math.round((v - min) / paso)));
  const [indice, setIndice] = useState(() => indiceDe(valor));
  const centrado = useSharedValue(indice);
  const posicionado = useRef(false);

  const marcas = useMemo(() => Array.from({ length: total + 1 }, (_, i) => redondear(min + i * paso)), [min, total, paso]);

  // La lectura sigue al dedo; el valor se avisa cada vez que cambia de marca.
  function mover(i: number) {
    setIndice(i);
    tic();
    onChange(marcas[i]);
  }

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const i = Math.max(0, Math.min(total, Math.round(e.contentOffset.x / ESP)));
      if (i !== centrado.value) {
        centrado.value = i;
        scheduleOnRN(mover, i);
      }
    },
  });

  function asentar(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.max(0, Math.min(total, Math.round(e.nativeEvent.contentOffset.x / ESP)));
    if (i !== indice) mover(i);
  }

  function medir(e: LayoutChangeEvent) {
    setAncho(e.nativeEvent.layout.width);
  }

  const actual = marcas[indice];
  const media2 = ancho / 2;

  const escala = (
      <Animated.ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ESP}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={asentar}
        onScrollEndDrag={asentar}
        onContentSizeChange={() => {
          if (posicionado.current) return;
          posicionado.current = true;
          ref.current?.scrollTo({ x: indice * ESP, animated: false });
        }}
        contentContainerStyle={{ paddingHorizontal: media2 }}
      >
        {marcas.map((v, i) => {
          const k = Math.round(v / paso);
          const esMayor = k % mayor === 0;
          const esMedia = !esMayor && k % media === 0;
          return (
            <View key={i} style={[styles.ranura, i === total && styles.ultima]}>
              <View
                style={[styles.marca, esMayor ? styles.marcaMayor : esMedia ? styles.marcaMedia : styles.marcaMenor]}
              />
              {esMayor ? (
                <LumeText rol="data" color={t.textTertiary} style={styles.numero}>
                  {fmt ? fmt(v) : v.toFixed(0)}
                </LumeText>
              ) : null}
            </View>
          );
        })}
      </Animated.ScrollView>
  );

  return (
    <View style={styles.lectura}>
      <View style={styles.valor} accessibilityLiveRegion="polite">
        {lectura ? (
          lectura(actual)
        ) : (
          <>
            <LumeText rol="hero" style={styles.num}>
              {actual.toFixed(decimales)}
            </LumeText>
            {unidad ? (
              <LumeText rol="subtitle" style={styles.unidad}>
                {unidad}
              </LumeText>
            ) : null}
          </>
        )}
      </View>

      <Vidrio
        radio={lumeRadius.xl}
        style={styles.regla}
        onLayout={medir}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: `${actual.toFixed(decimales)} ${unidad ?? ''}`.trim() }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const i = Math.max(0, Math.min(total, indice + (e.nativeEvent.actionName === 'increment' ? 1 : -1)));
          ref.current?.scrollTo({ x: i * ESP, animated: false });
          mover(i);
        }}
      >
        {ancho > 0 ? <View style={StyleSheet.absoluteFill}>{escala}</View> : null}

        <View style={[styles.aguja, { left: media2 - 1 }]} />
        <Svg width={10} height={6} style={[styles.punta, { left: media2 - 5 }]}>
          <Polygon points="0,0 10,0 5,6" fill={t.signal} />
        </Svg>
      </Vidrio>
    </View>
  );
}

const makeStyles = (t: LumePalette, sombras: LumeSombras) =>
  StyleSheet.create({
    lectura: { alignItems: 'center', gap: lumeSpace[6], alignSelf: 'stretch' },
    valor: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    num: { fontSize: 88, lineHeight: 92, letterSpacing: -4 },
    unidad: { fontSize: 18, lineHeight: 22 },
    regla: { alignSelf: 'stretch', height: ALTO, marginHorizontal: -SANGRE },
    ranura: { width: ESP, height: ALTO },
    ultima: { width: 1 },
    marca: { position: 'absolute', left: 0, top: 12, width: 1, height: 14 },
    marcaMayor: { height: 32, backgroundColor: t.textTertiary },
    marcaMedia: { height: 22, backgroundColor: t.textDisabled },
    marcaMenor: { backgroundColor: t.dataTick },
    numero: {
      position: 'absolute',
      left: -20,
      width: 40,
      bottom: 10,
      textAlign: 'center',
      fontSize: 11,
      lineHeight: 16,
      fontFamily: lumeFuente.medium,
    },
    aguja: {
      pointerEvents: 'none',
      position: 'absolute',
      top: 8,
      width: 2,
      height: 50,
      borderRadius: 1,
      backgroundColor: t.signal,
      boxShadow: sombras.haloSignal,
    },
    punta: { pointerEvents: 'none', position: 'absolute', top: 8 },
  });
