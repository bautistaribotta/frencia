/* Frencia · DistanceField — RN port of components/log/DistanceField.jsx
   Campo de distancia en la unidad que corresponde: metros para distancias
   cortas, km o mi segun la preferencia del usuario para las largas. Acepta
   coma o punto, y se ajusta rapido con los botones de los costados. La
   mecanica (botones, escritura, vacio) es la de NumberField. */

import React from 'react';
import { type ViewStyle } from 'react-native';
import { NumberField } from './NumberField';

type Size = 'md' | 'lg';

export interface DistanceFieldProps {
  label?: string;
  /** En la unidad del campo. null = sin cargar. */
  value: number | null;
  /** Borrar el campo entrega null. */
  onChange: (value: number | null) => void;
  unit: 'm' | 'km' | 'mi';
  /** Por defecto 10 m o 0.1 km/mi. */
  step?: number;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function DistanceField({
  label = 'Distancia',
  value,
  onChange,
  unit,
  step,
  size = 'md',
  fullWidth = false,
  style,
}: DistanceFieldProps) {
  const enMetros = unit === 'm';
  return (
    <NumberField
      label={label}
      value={value}
      onChange={onChange}
      min={0}
      max={enMetros ? 99999 : 999.99}
      step={step ?? (enMetros ? 10 : 0.1)}
      decimals={enMetros ? 0 : 2}
      unit={unit}
      size={size}
      fullWidth={fullWidth}
      style={style}
    />
  );
}
