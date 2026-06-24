/* Frencia · MeasurePicker (iOS) — altura y peso con rueda nativa.
   Usa el Picker de SwiftUI en estilo "wheel" via @expo/ui, asi la fisica del
   scroll y las haptics son las del sistema. Cada rueda es de una sola columna y
   muestra la unidad en la etiqueta. El toggle de unidad (cm/ft, kg/lb) sigue
   siendo el SegmentedControl propio. El valor se guarda siempre en metrico
   (cm o kg). Solo iOS; el fallback vive en MeasurePicker.tsx. */

import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Host, Picker, Text as SwiftUIText } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

import {
  SegmentedControl,
  space,
  useTheme,
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
  initialUnit?: Unit;
  onUnitChange?: (unit: Unit) => void;
}

const CM_PER_IN = 2.54;
const KG_PER_LB = 0.45359237;

const DEFAULT: Record<Kind, number> = { height: 170, weight: 70 };

interface Option {
  // Valor canonico que se persiste (cm o kg).
  value: number;
  label: string;
}

// Genera las opciones de la rueda segun la medida y la unidad elegida.
function buildOptions(kind: Kind, unit: Unit): Option[] {
  const out: Option[] = [];
  if (kind === 'height') {
    if (unit === 'metric') {
      for (let cm = 120; cm <= 220; cm++) out.push({ value: cm, label: `${cm} cm` });
    } else {
      for (let totalIn = 48; totalIn <= 95; totalIn++) {
        const ft = Math.floor(totalIn / 12);
        const inch = totalIn % 12;
        out.push({ value: Math.round(totalIn * CM_PER_IN), label: `${ft}' ${inch}"` });
      }
    }
    return out;
  }
  if (unit === 'metric') {
    for (let v = 300; v <= 2000; v += 5) {
      const kg = v / 10;
      out.push({ value: kg, label: `${kg.toFixed(1)} kg` });
    }
  } else {
    for (let lb = 66; lb <= 440; lb++) {
      out.push({ value: Math.round(lb * KG_PER_LB * 10) / 10, label: `${lb} lb` });
    }
  }
  return out;
}

// Indice de la opcion mas cercana al valor canonico dado.
function nearestIndex(options: Option[], canonical: number): number {
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < options.length; i++) {
    const diff = Math.abs(options[i].value - canonical);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

export function MeasurePicker({
  kind,
  initial,
  onChange,
  initialUnit = 'metric',
  onUnitChange,
}: MeasurePickerProps) {
  const { mode } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const base = initial > 0 ? initial : DEFAULT[kind];
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const options = useMemo(() => buildOptions(kind, unit), [kind, unit]);
  const [index, setIndex] = useState(() =>
    nearestIndex(buildOptions(kind, initialUnit), base),
  );

  function changeIndex(i: number) {
    setIndex(i);
    onChange(options[i].value);
  }

  function switchUnit(value: string) {
    const next = value as Unit;
    if (next === unit) return;
    const canonical = options[index].value;
    const nextOptions = buildOptions(kind, next);
    const nextIndex = nearestIndex(nextOptions, canonical);
    setUnit(next);
    setIndex(nextIndex);
    onChange(nextOptions[nextIndex].value);
    onUnitChange?.(next);
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

  return (
    <View style={styles.wrap}>
      <SegmentedControl accent options={unitOptions} value={unit} onChange={switchUnit} style={styles.toggle} />

      <Host matchContents colorScheme={mode} style={styles.host}>
        <Picker
          selection={index}
          onSelectionChange={(i) => changeIndex(i as number)}
          modifiers={[pickerStyle('wheel')]}
        >
          {options.map((o, i) => (
            <SwiftUIText key={i} modifiers={[tag(i)]}>
              {o.label}
            </SwiftUIText>
          ))}
        </Picker>
      </Host>
    </View>
  );
}

const makeStyles = (_colors: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', gap: space[7] },
    toggle: { alignSelf: 'center', minWidth: 160 },
    host: { alignSelf: 'stretch', height: 216 },
  });
