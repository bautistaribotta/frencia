import * as React from 'react';

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Uppercase mono caption above the number. */
  label?: string;
  /** The headline number (string or node). */
  value: React.ReactNode;
  /** Trailing unit (e.g. "kg", "min"). */
  unit?: string;
  /** Optional change indicator value (e.g. "+5"). */
  delta?: React.ReactNode;
  /** Direction of the delta arrow/color. */
  deltaDir?: 'up' | 'down';
  /** Numeral scale. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color the number emerald (`green`) or orange (`orange`). */
  tone?: 'default' | 'green' | 'orange';
  children?: React.ReactNode;
}

/**
 * HEFT's signature big-number stat — Anton numerals over a mono caption,
 * with an optional progression delta.
 */
export function StatTile(props: StatTileProps): React.ReactElement;
