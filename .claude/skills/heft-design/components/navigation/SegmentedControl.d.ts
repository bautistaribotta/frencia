import * as React from 'react';

export interface SegmentOption {
  value: string;
  label: string;
  /** Optional leading Lucide icon name. */
  icon?: string;
}

export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Options as strings or {value,label,icon}. */
  options: Array<string | SegmentOption>;
  /** Selected value. */
  value: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  /** Active segment uses the emerald fill instead of a raised surface. */
  accent?: boolean;
}

/** iOS-style segmented control for switching between sibling views/ranges. */
export function SegmentedControl(props: SegmentedControlProps): React.ReactElement;
