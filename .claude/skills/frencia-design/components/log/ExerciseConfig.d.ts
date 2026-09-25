import * as React from 'react';
import type { Exercise, ExercisePlan, UnitPrefs } from './ExerciseMetrics';

export interface ExerciseConfigProps extends React.HTMLAttributes<HTMLDivElement> {
  exercise: Exercise;
  /** Plan inicial (editar) o parcial (agregar). */
  plan?: Partial<ExercisePlan>;
  mode?: 'add' | 'edit';
  prefs?: UnitPrefs;
  onBack?: () => void;
  /** Recibe el plan final; rest = null cuando el descanso no aplica. */
  onSubmit?: (plan: ExercisePlan) => void;
}

/**
 * Segunda cara de ExercisePickerModal (agregar / editar un ejercicio en un día).
 * Campos según los datos del ejercicio; sin peso; sin descanso en cardio de 1 serie.
 */
export function ExerciseConfig(props: ExerciseConfigProps): React.ReactElement;
