import * as React from 'react';

export interface RestFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Caption mono arriba. Default "Descanso entre series". */
  label?: string;
  /** Segundos. null = sin descanso (el campo lo dice en texto). */
  value: number | null;
  /** Segundos elegidos, o null si se confirmo 0:00. */
  onChange?: (seconds: number | null) => void;
}

/** Descanso entre series: campo que abre una hoja inferior con ruedas de minutos y segundos (cada 5 s, hasta 10:55). La hoja se posiciona contra el ancestro con position: relative. */
export function RestField(props: RestFieldProps): React.ReactElement;
