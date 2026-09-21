import * as React from 'react';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (or, when `segments` set, number of filled segments). */
  value?: number;
  /** Max for continuous mode. Default 100. */
  max?: number;
  /** Mono caption above the track. */
  label?: string;
  /** Show the % (or n/total) on the right. */
  showValue?: boolean;
  tone?: 'green' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  /** Render as N discrete segments (e.g. sets completed) instead of a bar. */
  segments?: number;
}

/** Progress / completion bar — continuous or segmented (sets done). */
export function ProgressBar(props: ProgressBarProps): React.ReactElement;
