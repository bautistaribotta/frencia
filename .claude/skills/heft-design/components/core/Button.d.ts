import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = emerald CTA, `intensity` = orange (PR/effort), `secondary` = outlined, `ghost` = text. */
  variant?: 'primary' | 'intensity' | 'secondary' | 'ghost';
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Lucide icon name rendered before the label (e.g. "plus", "play"). */
  icon?: string;
  /** Lucide icon name rendered after the label (e.g. "chevron-right"). */
  iconRight?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Primary action button for HEFT. Emerald fill with a soft glow by default;
 * black label. Use `intensity` for PR/high-effort moments, sparingly.
 */
export function Button(props: ButtonProps): React.ReactElement;
