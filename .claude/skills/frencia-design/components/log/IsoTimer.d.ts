import * as React from 'react';

export interface IsoTimerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Objetivo del plan, en segundos. Sin objetivo no hay barra y se muestra "—". */
  target?: number | null;
  /** Duración cargada (segundos). Se completa al frenar y queda editable. */
  value?: number | null;
  onChange?: (seconds: number) => void;
  /** Para maquetas: arrancar en un estado dado. */
  initialPhase?: 'idle' | 'running' | 'done';
  /** Segundos ya contados al montar (maquetas). */
  initialElapsed?: number;
}

/**
 * Cronómetro de esfuerzo (isométricos). Cuenta hacia arriba, barra naranja con
 * marca de objetivo; "Empezar" → "Frenar" → duración editable.
 */
export function IsoTimer(props: IsoTimerProps): React.ReactElement;
