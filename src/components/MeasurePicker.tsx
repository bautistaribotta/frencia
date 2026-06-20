/* Frencia · MeasurePicker — eleccion de altura o peso con ruedas tipo dial.
   Combina el toggle de unidad (cm/ft, kg/lbs) con una o dos ruedas y una barra
   de seleccion centrada. Guarda siempre el valor canonico en metrico (cm para
   altura, kg para peso); el toggle solo cambia como se ingresa. Se usa tanto en
   el setup inicial como al editar el perfil, para que el dato se actualice
   igual que cuando se definio. */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  FrenciaText,
  SegmentedControl,
  WheelPicker,
  radius,
  space,
  useColors,
  useThemedStyles,
  type Palette,
} from '@/design';

type Kind = 'height' | 'weight';
type Unit = 'metric' | 'imperial';

export interface MeasurePickerProps {
  kind: Kind;
  // Valor canonico inicial (cm para altura, kg para peso).
  initial: number;
  onChange: (canonical: number) => void;
}

const ITEM_H = 44;
const VISIBLE = 7;
const STAGE_H = ITEM_H * VISIBLE;

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

// Rangos de cada rueda.
const HEIGHT_CM = range(120, 220);
const FEET = range(4, 7);
const INCH = range(0, 11);
const KG_INT = range(30, 200);
const LB_INT = range(66, 440);
const DEC = range(0, 9);

// Defaults razonables si no hay dato previo.
const DEFAULT = { height: 170, weight: 70 };

// canonico -> indices de rueda segun unidad.
function toIndices(kind: Kind, unit: Unit, value: number): [number, number] {
  if (kind === 'height') {
    if (unit === 'metric') return [clamp(Math.round(value), 120, 220) - 120, 0];
    const totalIn = Math.round(value / CM_PER_IN);
    const feet = clamp(Math.floor(totalIn / 12), 4, 7);
    const inch = clamp(totalIn - feet * 12, 0, 11);
    return [feet - 4, inch];
  }
  if (unit === 'metric') {
    const int = clamp(Math.floor(value), 30, 200);
    const dec = clamp(Math.round((value - Math.floor(value)) * 10), 0, 9);
    return [int - 30, dec];
  }
  const lb = value / KG_PER_LB;
  const int = clamp(Math.floor(lb), 66, 440);
  const dec = clamp(Math.round((lb - Math.floor(lb)) * 10), 0, 9);
  return [int - 66, dec];
}

// indices de rueda -> canonico (cm o kg).
function compose(kind: Kind, unit: Unit, i1: number, i2: number): number {
  if (kind === 'height') {
    if (unit === 'metric') return HEIGHT_CM[i1];
    const cm = (FEET[i1] * 12 + INCH[i2]) * CM_PER_IN;
    return Math.round(cm);
  }
  if (unit === 'metric') return Math.round((KG_INT[i1] + DEC[i2] / 10) * 10) / 10;
  const lb = LB_INT[i1] + DEC[i2] / 10;
  return Math.round(lb * KG_PER_LB * 10) / 10;
}

export function MeasurePicker({ kind, initial, onChange }: MeasurePickerProps) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  const base = initial > 0 ? initial : DEFAULT[kind];
  const [unit, setUnit] = useState<Unit>('metric');
  const [i1, setI1] = useState(() => toIndices(kind, 'metric', base)[0]);
  const [i2, setI2] = useState(() => toIndices(kind, 'metric', base)[1]);

  function emit(n1: number, n2: number) {
    onChange(compose(kind, unit, n1, n2));
  }

  function changeI1(n: number) {
    setI1(n);
    emit(n, i2);
  }
  function changeI2(n: number) {
    setI2(n);
    emit(i1, n);
  }

  function switchUnit(u: string) {
    const next = u as Unit;
    if (next === unit) return;
    const canonical = compose(kind, unit, i1, i2);
    const [n1, n2] = toIndices(kind, next, canonical);
    setUnit(next);
    setI1(n1);
    setI2(n2);
    onChange(canonical);
  }

  const unitOptions =
    kind === 'height'
      ? [
          { value: 'metric', label: 'cm' },
          { value: 'imperial', label: 'ft' },
        ]
      : [
          { value: 'metric', label: 'kg' },
          { value: 'imperial', label: 'lbs' },
        ];

  // Unidad mostrada al costado (metrico y peso). En altura imperial las
  // unidades van entre las ruedas (ft / in), por eso no hay unidad lateral.
  const sideUnit =
    kind === 'height' ? (unit === 'metric' ? 'cm' : null) : unit === 'metric' ? 'kg' : 'lbs';

  return (
    <View style={styles.wrap}>
      <SegmentedControl accent options={unitOptions} value={unit} onChange={switchUnit} style={styles.toggle} />

      <View style={styles.stage}>
        {/* Barra de seleccion centrada, detras de las ruedas */}
        <View pointerEvents="none" style={styles.highlight} />

        {/* El valor queda centrado en pantalla para que no lo tape la mano */}
        <View style={styles.numeric}>
          {kind === 'height' && unit === 'metric' ? (
            <WheelPicker values={HEIGHT_CM} index={i1} onIndexChange={changeI1} itemHeight={ITEM_H} visibleCount={VISIBLE} width={96} align="center" />
          ) : null}

          {kind === 'height' && unit === 'imperial' ? (
            <>
              <WheelPicker values={FEET} index={i1} onIndexChange={changeI1} itemHeight={ITEM_H} visibleCount={VISIBLE} width={64} align="right" />
              <FrenciaText role="data" color={colors.textSecondary} style={styles.unit}>
                ft
              </FrenciaText>
              <WheelPicker values={INCH} index={i2} onIndexChange={changeI2} itemHeight={ITEM_H} visibleCount={VISIBLE} width={64} align="right" />
              <FrenciaText role="data" color={colors.textSecondary} style={styles.unit}>
                in
              </FrenciaText>
            </>
          ) : null}

          {kind === 'weight' ? (
            <>
              <WheelPicker
                values={unit === 'metric' ? KG_INT : LB_INT}
                index={i1}
                onIndexChange={changeI1}
                itemHeight={ITEM_H}
                visibleCount={VISIBLE}
                width={112}
                align="right"
              />
              <FrenciaText role="data" color={colors.textPrimary} style={styles.dot}>
                .
              </FrenciaText>
              <WheelPicker values={DEC} index={i2} onIndexChange={changeI2} itemHeight={ITEM_H} visibleCount={VISIBLE} width={52} align="left" />
            </>
          ) : null}
        </View>

        {/* Unidad fija al costado: no desplaza el valor centrado */}
        {sideUnit ? (
          <View pointerEvents="none" style={styles.unitSide}>
            <FrenciaText role="data" color={colors.textSecondary} style={styles.unit}>
              {sideUnit}
            </FrenciaText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: space[7] },
    toggle: { alignSelf: 'center', minWidth: 160 },
    stage: {
      height: STAGE_H,
      alignSelf: 'stretch',
      justifyContent: 'center',
    },
    highlight: {
      position: 'absolute',
      left: space[6],
      right: space[6],
      top: (STAGE_H - ITEM_H) / 2,
      height: ITEM_H,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceCardElevated,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    numeric: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space[2],
    },
    unitSide: {
      position: 'absolute',
      right: space[7],
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    unit: { fontSize: 18 },
    dot: {
      fontSize: 28,
      lineHeight: 28,
      marginHorizontal: -space[1],
    },
  });
