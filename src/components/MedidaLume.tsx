/* Frencia · MedidaLume — la rueda de edad, altura, peso o descanso en Lume.
   Es MeasurePicker con las piezas de Lume (Rueda, EscenarioRueda y
   Segmentado en accent) y la misma logica: guarda siempre el valor canonico
   (años, cm, kg o segundos) y avisa el cambio de unidad por `onUnitChange`.
   La usa editar perfil; cuando el selector de ejercicios pase a Lume,
   reemplaza del todo a MeasurePicker. */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AGE,
  DEC,
  DEFAULT,
  FEET,
  HEIGHT_CM,
  INCH,
  KG_INT,
  LB_INT,
  REST_MIN,
  REST_SEC,
  compose,
  toIndices,
  type Kind,
  type Unit,
} from '@/components/MeasurePicker';
import { EscenarioRueda, LumeText, Rueda, Segmentado, lumeFuente, lumeSpace, useLume } from '@/design/lume';

export interface MedidaLumeProps {
  kind: Kind;
  // Valor canonico inicial (años, cm, kg o segundos).
  initial: number;
  onChange: (canonical: number) => void;
  initialUnit?: Unit;
  onUnitChange?: (unit: Unit) => void;
}

export function MedidaLume({ kind, initial, onChange, initialUnit = 'metric', onUnitChange }: MedidaLumeProps) {
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
        <Rueda valores={FEET} indice={i1} onIndice={cambiarI1} ancho={64} alinear="der" />
        {entre('ft')}
        <Rueda valores={INCH} indice={i2} onIndice={cambiarI2} ancho={64} alinear="der" />
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
        />
        <LumeText rol="body" style={styles.punto}>
          .
        </LumeText>
        <Rueda valores={DEC} indice={i2} onIndice={cambiarI2} ancho={52} alinear="izq" />
      </>
    );
  } else {
    ruedas = (
      <>
        <Rueda valores={REST_MIN} indice={i1} onIndice={cambiarI1} ancho={64} alinear="der" />
        {entre('min')}
        <Rueda valores={REST_SEC} indice={i2} onIndice={cambiarI2} ancho={64} alinear="der" />
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
