import * as React from 'react';

export interface MetricPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Leading Lucide icon name. */
  icon?: string;
  /** Mono uppercase caption. */
  label?: string;
  /** The value (string or node). */
  value: React.ReactNode;
  tone?: 'neutral' | 'green' | 'orange';
  /** `stack` = label over value; `inline` = side by side. */
  layout?: 'stack' | 'inline';
}

/** Compact inline metric chip — rest timer, RIR, pace, heart-rate readouts. */
export function MetricPill(props: MetricPillProps): React.ReactElement;
