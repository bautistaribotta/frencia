import * as React from 'react';

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** On/off state (controlled). */
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
}

/** iOS toggle switch — emerald when on, black thumb. */
export function Switch(props: SwitchProps): React.ReactElement;
