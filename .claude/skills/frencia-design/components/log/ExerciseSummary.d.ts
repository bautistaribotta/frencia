import * as React from 'react';
import type { Exercise, ExercisePlan, UnitPrefs } from './ExerciseMetrics';

export interface ExerciseSummaryProps extends React.HTMLAttributes<HTMLSpanElement> {
  exercise: Exercise;
  plan: ExercisePlan;
  prefs?: UnitPrefs;
  size?: 'md' | 'lg';
}

/** Resumen de una línea: volumen · intensidad (naranja) · descanso (con ícono de reloj). */
export function ExerciseSummary(props: ExerciseSummaryProps): React.ReactElement;
