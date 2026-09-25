import * as React from 'react';

export interface RestRingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Descanso total en segundos. Default 120. */
  total?: number;
  /** Segundos restantes al montar. Default = total. */
  remaining?: number;
  /** Si cuenta. Default true. */
  running?: boolean;
  /** Texto de lo que viene ("Serie 3 de 4 · Plancha"). */
  next?: React.ReactNode;
  onSkip?: () => void;
  onDone?: () => void;
  /** Diámetro del anillo en px. Default 108. */
  size?: number;
}

/** Temporizador de descanso: anillo verde que se vacía, cuenta regresiva, +15 s y Saltar. */
export function RestRing(props: RestRingProps): React.ReactElement;
