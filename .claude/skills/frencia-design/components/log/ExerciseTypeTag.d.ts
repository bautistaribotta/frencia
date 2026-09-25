import * as React from 'react';
import type { Exercise, ExerciseKind } from './ExerciseMetrics';

export interface ExerciseTypeTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: ExerciseKind;
  /** Si se pasa, el tipo se toma de acá y se listan sus datos. */
  exercise?: Exercise;
  /** Default true. */
  showMetrics?: boolean;
  /** inline (listas) | chip (cabeceras). */
  variant?: 'inline' | 'chip';
}

/** Tipo de ejercicio con ícono + texto (nunca solo color) y, opcional, los datos que registra. */
export function ExerciseTypeTag(props: ExerciseTypeTagProps): React.ReactElement;
