import * as React from 'react';

export interface DurationFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Caption mono arriba ("Tiempo por serie"). Muestra el formato esperado a la derecha. */
  label?: string;
  /** Segundos. null = sin valor (muestra el formato como placeholder). */
  value: number | null;
  onChange?: (seconds: number) => void;
  /** Ajuste rápido en segundos. 5 para isométricos, 60 para cardio. Default 5. */
  step?: number;
  /** Permite h:mm:ss (cardio largo). Si no, tope 59:59. */
  allowHours?: boolean;
  /** Muestra los botones ± step. Default true. */
  showSteps?: boolean;
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

/** Entrada de tiempo m:ss / h:mm:ss con escritura directa y ajuste ± step. Misma piel que Stepper. */
export function DurationField(props: DurationFieldProps): React.ReactElement;
