import * as React from 'react';

export interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Checked state (controlled). */
  checked?: boolean;
  /** Toggle handler. Omit it to render a static indicator that the parent marks. */
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}

/**
 * Square checkbox for FRENCIA. Checked uses the soft green of the history
 * "done" mark (surface-green-soft fill, surface-green-line border, accent-text
 * check); unchecked is a neutral border only.
 */
export function Checkbox(props: CheckboxProps): React.ReactElement;
