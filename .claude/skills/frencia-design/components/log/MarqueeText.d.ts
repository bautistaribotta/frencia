import * as React from 'react';

export interface MarqueeTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Texto a mostrar en una sola linea. */
  text: string;
}

/**
 * Texto de una linea que nunca hace salto de linea: si no entra, se desplaza
 * de derecha a izquierda como una cinta (marquee), 28 px/s, con pausa de 2 s
 * al comienzo de cada vuelta. Hereda tipografia y color del contenedor.
 */
export function MarqueeText(props: MarqueeTextProps): React.ReactElement;
