import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon name (e.g. "plus", "timer", "x"). */
  icon: string;
  variant?: 'primary' | 'surface' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  /** Fully circular instead of rounded-square. */
  round?: boolean;
  disabled?: boolean;
}

/** Icon-only button — toolbars, steppers, nav. Min 44px hit target at `md`/`lg`. */
export function IconButton(props: IconButtonProps): React.ReactElement;
