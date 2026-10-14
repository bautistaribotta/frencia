/* ============================================================
   Frencia · Lume · Regla curva (el peso del setup)
   La misma lectura grande que la regla recta y, debajo, una banda de vidrio
   en un arco muy abierto (radio exterior 420, mismo grosor que la regla
   recta de la altura) mas ancha que la pantalla: los extremos salen por
   los costados, como el visor de una balanza. La aguja de lume queda fija arriba al centro y la banda gira al
   arrastrar de costado: cada 1,7 grados es un paso, con un haptico liviano
   en cada kilo (o libra).
   Trabaja en la unidad que se muestra; la conversion al canonico la hace
   quien la monta.
   ============================================================ */

import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Svg, { G, Line, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { useLume } from './useLume';
import { ALTO_REGLA } from './Regla';
import { LumeText } from './LumeText';
import { lumeFuente } from './tipografia';
import { lumeSpace } from './tokens';

// Geometria del kit (ReglaCurva en pantallas-base.jsx).
const W = 560;
// Alto del dibujo: con la banda mas gruesa, el borde de adentro baja hacia
// los costados y tiene que entrar hasta el borde de un telefono ancho.
const H = 170;
const R = 420;
// Mismo grosor que la regla recta de la altura.
const GROSOR = ALTO_REGLA;
const CX = W / 2;
const CY = R + 6;
const R_IN = R - GROSOR;
// Radio de las marcas (borde exterior) y de los numeros, 42 px hacia adentro.
const R_T = R - 8;
const R_N = R_T - 42;
// Grados dibujados a cada lado: mas alla del borde de la pantalla.
const LIM = 42;

const rad = (grados: number) => ((grados - 90) * Math.PI) / 180;
const punto = (r: number, grados: number) =>
  `${(CX + r * Math.cos(rad(grados))).toFixed(2)} ${(CY + r * Math.sin(rad(grados))).toFixed(2)}`;

const BANDA = (() => {
  const L = LIM + 4;
  return `M ${punto(R, -L)} A ${R} ${R} 0 0 1 ${punto(R, L)} L ${punto(R_IN, L)} A ${R_IN} ${R_IN} 0 0 0 ${punto(R_IN, -L)} Z`;
})();
const BRILLO = `M ${punto(R - 1.5, -LIM - 4)} A ${R - 1.5} ${R - 1.5} 0 0 1 ${punto(R - 1.5, LIM + 4)}`;

export interface ReglaCurvaProps {
  min: number;
  max: number;
  paso?: number;
  valor: number;
  onChange: (valor: number) => void;
  unidad?: string;
  decimales?: number;
  // Grados de giro por paso.
  grados?: number;
  // Cada cuantos pasos va una marca larga con numero, y una media.
  mayor?: number;
  media?: number;
  accessibilityLabel?: string;
}

function hapticoLiviano() {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function ReglaCurva({
  min,
  max,
  paso = 0.5,
  valor,
  onChange,
  unidad,
  decimales = 1,
  grados = 1.7,
  mayor = 10,
  media = 2,
  accessibilityLabel,
}: ReglaCurvaProps) {
  const { t } = useLume();
  // Posicion continua de la banda mientras se arrastra; la lectura muestra el
  // paso mas cercano. El gesto corre en el hilo de UI: lleva su propia copia
  // de la posicion y avisa al render solo lo que cambia.
  const ajustar = (v: number) => {
    'worklet';
    return Math.max(min, Math.min(max, Math.round(v / paso) * paso));
  };
  const [continuo, setContinuo] = useState(() => ajustar(valor));
  const posicion = useSharedValue(continuo);
  const inicio = useSharedValue(continuo);
  const ultimoPaso = useSharedValue(continuo);
  const ultimoEntero = useSharedValue(Math.round(continuo));

  const actual = ajustar(continuo);

  // El desplazamiento horizontal se convierte en giro sobre el radio de las
  // marcas; arrastrar a la derecha trae los valores menores al centro.
  const pxPorGrado = (R_T * Math.PI) / 180;
  const pan = Gesture.Pan()
    .activeOffsetX([-6, 6])
    .failOffsetY([-14, 14])
    .onBegin(() => {
      inicio.set(posicion.get());
    })
    .onUpdate((e) => {
      const c = Math.max(min, Math.min(max, inicio.get() - (e.translationX / pxPorGrado / grados) * paso));
      posicion.set(c);
      runOnJS(setContinuo)(c);
      const p = ajustar(c);
      if (p !== ultimoPaso.get()) {
        ultimoPaso.set(p);
        runOnJS(onChange)(p);
      }
      const entero = Math.round(c);
      if (entero !== ultimoEntero.get()) {
        ultimoEntero.set(entero);
        runOnJS(hapticoLiviano)();
      }
    })
    .onFinalize(() => {
      const p = ajustar(posicion.get());
      posicion.set(p);
      runOnJS(setContinuo)(p);
    });

  // Marcas y numeros visibles alrededor de la posicion actual.
  const marcas: React.ReactNode[] = [];
  const numeros: React.ReactNode[] = [];
  const n = Math.ceil(LIM / grados) + 1;
  const base = Math.round(continuo / paso);
  for (let i = -n; i <= n; i++) {
    const k = base + i;
    const v = k * paso;
    if (v < min - 1e-9 || v > max + 1e-9) continue;
    const a = ((v - continuo) / paso) * grados;
    if (Math.abs(a) > LIM) continue;
    const esMayor = k % mayor === 0;
    const esMedia = !esMayor && k % media === 0;
    const largo = esMayor ? 30 : esMedia ? 20 : 12;
    const r = rad(a);
    marcas.push(
      <Line
        key={`m${k}`}
        x1={CX + R_T * Math.cos(r)}
        y1={CY + R_T * Math.sin(r)}
        x2={CX + (R_T - largo) * Math.cos(r)}
        y2={CY + (R_T - largo) * Math.sin(r)}
        stroke={esMayor ? t.textTertiary : esMedia ? t.textDisabled : t.dataTick}
        strokeWidth={1}
      />,
    );
    if (esMayor) {
      numeros.push(
        <SvgText
          key={`n${k}`}
          x={CX}
          y={CY - R_N}
          transform={`rotate(${a} ${CX} ${CY})`}
          textAnchor="middle"
          alignmentBaseline="central"
          fontFamily={lumeFuente.medium}
          fontSize={11}
          fill={t.textTertiary}
        >
          {v.toFixed(0)}
        </SvgText>,
      );
    }
  }

  return (
    <View style={styles.lectura}>
      <View style={styles.valor} accessibilityLiveRegion="polite">
        <LumeText rol="hero" style={styles.num}>
          {actual.toFixed(decimales)}
        </LumeText>
        {unidad ? (
          <LumeText rol="subtitle" style={styles.unidad}>
            {unidad}
          </LumeText>
        ) : null}
      </View>

      <GestureDetector gesture={pan}>
        <View
          style={styles.contenedor}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ text: `${actual.toFixed(decimales)} ${unidad ?? ''}`.trim() }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            const v = ajustar(actual + (e.nativeEvent.actionName === 'increment' ? paso : -paso));
            ultimoPaso.set(v);
            posicion.set(v);
            setContinuo(v);
            onChange(v);
          }}
        >
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Path d={BANDA} fill={t.surfaceCard} stroke={t.glassLine} strokeWidth={1} strokeLinejoin="round" />
            <Path d={BRILLO} fill="none" stroke={t.glassHighlight} strokeWidth={1} />
            <G>
              {marcas}
              {numeros}
            </G>
            {/* La aguja con su brillo: un trazo ancho y tenue debajo del fino. */}
            <Line
              x1={CX}
              y1={CY - R + 2}
              x2={CX}
              y2={CY - R_T + 36}
              stroke={t.signal}
              strokeOpacity={0.3}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <Line x1={CX} y1={CY - R + 2} x2={CX} y2={CY - R_T + 36} stroke={t.signal} strokeWidth={2} strokeLinecap="round" />
            <Path d={`M ${CX - 5} ${CY - R + 2} L ${CX + 5} ${CY - R + 2} L ${CX} ${CY - R + 8} Z`} fill={t.signal} />
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  lectura: { alignItems: 'center', gap: lumeSpace[6], alignSelf: 'stretch' },
  valor: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  num: { fontSize: 88, lineHeight: 92, letterSpacing: -4 },
  unidad: { fontSize: 18, lineHeight: 22 },
  // La banda es mas ancha que la pantalla: se centra y el borde del telefono
  // corta los extremos.
  contenedor: { alignSelf: 'stretch', alignItems: 'center', height: H },
});
