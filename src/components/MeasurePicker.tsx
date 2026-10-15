/* Frencia · MeasurePicker — eleccion de edad, altura o peso con ruedas tipo dial.
   Para altura y peso suma el toggle de unidad (cm/ft, kg/lb) y la conversion,
   guardando siempre el valor canonico en metrico (cm o kg). La edad no tiene
   unidad: es una sola rueda en años, sin toggle. La barra de seleccion va
   centrada. Se usa tanto en el setup inicial como al editar el perfil, para que
   el dato se actualice igual que cuando se definio. El toggle avisa por
   `onUnitChange`: quien lo monta lo guarda como preferencia de toda la app.
   El descanso entre series usa las mismas ruedas: minutos y segundos (cada 5),
   en segundos canonicos y sin toggle; 0:00 es un valor valido.
   Va en Lume: Rueda y EscenarioRueda (la banda de seleccion en vidrio
   fuerte) y el toggle de unidad en Segmentado accent. */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { cmAPiesPulgadas, piesPulgadasACm } from '@/lib/altura';
import { DESCANSO_MAXIMO } from '@/lib/dia';
import { kgALb, lbAKg } from '@/lib/peso';

import { EscenarioRueda, LumeText, Rueda, Segmentado, lumeFuente, lumeSpace, useLume } from '@/design/lume';

type Kind = 'age' | 'height' | 'weight' | 'rest';
type Unit = 'metric' | 'imperial';

export interface MeasurePickerProps {
  kind: Kind;
  // Valor canonico inicial (cm para altura, kg para peso, segundos para descanso).
  initial: number;
  onChange: (canonical: number) => void;
  // Unidad de ingreso inicial. Para edad se ignora (no tiene unidad).
  initialUnit?: Unit;
  // Avisa cuando el usuario cambia el sistema de medicion, para persistirlo.
  onUnitChange?: (unit: Unit) => void;
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

// Rangos de cada rueda.
const AGE = range(13, 99);
const HEIGHT_CM = range(120, 220);
const FEET = range(4, 7);
const INCH = range(0, 11);
const KG_INT = range(30, 200);
const LB_INT = range(66, 440);
const DEC = range(0, 9);
const REST_MIN = range(0, Math.floor(DESCANSO_MAXIMO / 60));
const REST_SEC = range(0, 11).map((i) => String(i * 5).padStart(2, '0'));

// Defaults razonables si no hay dato previo.
const DEFAULT = { age: 25, height: 170, weight: 70, rest: 120 };

// canonico -> indices de rueda segun unidad.
function toIndices(kind: Kind, unit: Unit, value: number): [number, number] {
  if (kind === 'age') return [clamp(Math.round(value), 13, 99) - 13, 0];
  if (kind === 'rest') {
    const total = clamp(Math.round(value / 5) * 5, 0, DESCANSO_MAXIMO);
    return [Math.floor(total / 60), (total % 60) / 5];
  }
  if (kind === 'height') {
    if (unit === 'metric') return [clamp(Math.round(value), 120, 220) - 120, 0];
    const { pies, pulgadas } = cmAPiesPulgadas(value);
    return [clamp(pies, 4, 7) - 4, clamp(pulgadas, 0, 11)];
  }
  if (unit === 'metric') {
    const int = clamp(Math.floor(value), 30, 200);
    const dec = clamp(Math.round((value - Math.floor(value)) * 10), 0, 9);
    return [int - 30, dec];
  }
  const lb = kgALb(value);
  const int = clamp(Math.floor(lb), 66, 440);
  const dec = clamp(Math.round((lb - Math.floor(lb)) * 10), 0, 9);
  return [int - 66, dec];
}

// indices de rueda -> canonico (años, cm o kg).
function compose(kind: Kind, unit: Unit, i1: number, i2: number): number {
  if (kind === 'age') return AGE[i1];
  if (kind === 'rest') return REST_MIN[i1] * 60 + i2 * 5;
  if (kind === 'height') {
    if (unit === 'metric') return HEIGHT_CM[i1];
    return piesPulgadasACm(FEET[i1], INCH[i2]);
  }
  if (unit === 'metric') return Math.round((KG_INT[i1] + DEC[i2] / 10) * 10) / 10;
  const lb = LB_INT[i1] + DEC[i2] / 10;
  return Math.round(lbAKg(lb) * 10) / 10;
}

export function MeasurePicker({
  kind,
  initial,
  onChange,
  initialUnit = 'metric',
  onUnitChange,
}: MeasurePickerProps) {
  const { t } = useLume();
  // En descanso el 0 es un dato (sin descanso), no la falta de uno.
  const base = kind === 'rest' || initial > 0 ? initial : DEFAULT[kind];
  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [i1, setI1] = useState(() => toIndices(kind, initialUnit, base)[0]);
  const [i2, setI2] = useState(() => toIndices(kind, initialUnit, base)[1]);

  function cambiarI1(n: number) {
    setI1(n);
    onChange(compose(kind, unit, n, i2));
  }
  function cambiarI2(n: number) {
    setI2(n);
    onChange(compose(kind, unit, i1, n));
  }

  function cambiarUnidad(u: string) {
    const next = u as Unit;
    if (next === unit) return;
    const canonico = compose(kind, unit, i1, i2);
    const [n1, n2] = toIndices(kind, next, canonico);
    setUnit(next);
    setI1(n1);
    setI2(n2);
    onChange(canonico);
    onUnitChange?.(next);
  }

  // Unidad entre ruedas (ft / in, min / s).
  const entre = (texto: string) => (
    <LumeText rol="body" color={t.textTertiary} style={styles.unidad}>
      {texto}
    </LumeText>
  );

  // Unidad al costado. En altura imperial y en descanso van entre las ruedas.
  const lado =
    kind === 'age'
      ? 'años'
      : kind === 'height'
        ? unit === 'metric' ? 'cm' : undefined
        : kind === 'weight'
          ? unit === 'metric' ? 'kg' : 'lb'
          : undefined;

  let ruedas: React.ReactNode = null;
  if (kind === 'age') {
    ruedas = <Rueda valores={AGE} indice={i1} onIndice={cambiarI1} />;
  } else if (kind === 'height' && unit === 'metric') {
    ruedas = <Rueda valores={HEIGHT_CM} indice={i1} onIndice={cambiarI1} />;
  } else if (kind === 'height') {
    ruedas = (
      <>
        <Rueda valores={FEET} indice={i1} onIndice={cambiarI1} ancho={64} alinear="der" alcance="primera" />
        {entre('ft')}
        <Rueda valores={INCH} indice={i2} onIndice={cambiarI2} ancho={64} alinear="der" alcance="segunda" />
        {entre('in')}
      </>
    );
  } else if (kind === 'weight') {
    ruedas = (
      <>
        <Rueda
          valores={unit === 'metric' ? KG_INT : LB_INT}
          indice={i1}
          onIndice={cambiarI1}
          ancho={112}
          alinear="der"
          alcance="primera"
        />
        <LumeText rol="body" style={styles.punto}>
          .
        </LumeText>
        <Rueda valores={DEC} indice={i2} onIndice={cambiarI2} ancho={52} alinear="izq" alcance="segunda" />
      </>
    );
  } else {
    ruedas = (
      <>
        <Rueda valores={REST_MIN} indice={i1} onIndice={cambiarI1} ancho={64} alinear="der" alcance="primera" />
        {entre('min')}
        <Rueda valores={REST_SEC} indice={i2} onIndice={cambiarI2} ancho={64} alinear="der" alcance="segunda" />
        {entre('s')}
      </>
    );
  }

  return (
    <View style={styles.medida}>
      {/* La edad y el descanso no tienen unidad, asi que no llevan toggle. */}
      {kind === 'height' || kind === 'weight' ? (
        <Segmentado
          accent
          opciones={
            kind === 'height'
              ? [{ value: 'metric', label: 'cm' }, { value: 'imperial', label: 'ft' }]
              : [{ value: 'metric', label: 'kg' }, { value: 'imperial', label: 'lb' }]
          }
          value={unit}
          onChange={cambiarUnidad}
          style={styles.toggle}
        />
      ) : null}
      <EscenarioRueda unidad={lado}>{ruedas}</EscenarioRueda>
    </View>
  );
}

const styles = StyleSheet.create({
  medida: { alignItems: 'center', gap: lumeSpace[7] },
  toggle: { minWidth: 160 },
  unidad: { fontFamily: lumeFuente.medium, lineHeight: 22 },
  punto: { fontFamily: lumeFuente.medium, fontSize: 30, lineHeight: 30, marginHorizontal: -lumeSpace[1] },
});
