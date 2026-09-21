import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color/role. Solid tones for emphatic states (e.g. NUEVO PR). */
  tone?: 'neutral' | 'green' | 'green-solid' | 'orange' | 'orange-solid' | 'danger';
  /** Optional leading Lucide icon name. */
  icon?: string;
  children?: React.ReactNode;
}

/** Compact mono status marker — set type, RIR/RPE state, PR flag. */
export function Badge(props: BadgeProps): React.ReactElement;
