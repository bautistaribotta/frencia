import * as React from 'react';

export interface StepperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Mono caption above the control (e.g. "Peso", "Reps"). */
  label?: string;
  /** Current numeric value (controlled). */
  value: number;
  /** Called with the next clamped value. */
  onChange?: (value: number) => void;
  /** Increment per tap. Default 1 (use 2.5 for plate math). */
  step?: number;
  min?: number;
  max?: number;
  /** Trailing unit shown inline (e.g. "kg"). */
  unit?: string;
  /** Decimal places to keep. Default 0. */
  precision?: number;
  size?: 'md' | 'lg';
}

/** Numeric stepper for logging reps / load — tabular mono value with ± controls. */
export function Stepper(props: StepperProps): React.ReactElement;
