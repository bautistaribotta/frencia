import * as React from 'react';

export interface DistanceFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: string;
  /** En la unidad indicada. null = sin valor. */
  value: number | null;
  onChange?: (value: number) => void;
  /** 'm' para ejercicios de distancia corta (entero); 'km' | 'mi' según preferencia (2 decimales). */
  unit?: 'm' | 'km' | 'mi';
  /** Ajuste ±. Default 10 (m) o 0.1 (km/mi). */
  step?: number;
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

/** Entrada de distancia con unidad fija por ejercicio, escritura directa y ajuste ±. */
export function DistanceField(props: DistanceFieldProps): React.ReactElement;
