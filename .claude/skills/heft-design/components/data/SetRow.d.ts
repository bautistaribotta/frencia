import * as React from 'react';

export interface SetRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Set number (1-based). */
  index: number;
  /** Load value (number or string). */
  load: React.ReactNode;
  /** Reps value. */
  reps: React.ReactNode;
  /** Load unit. Default "kg". */
  unit?: string;
  /** Reps-in-reserve for this set; renders an orange RIR chip when set. */
  rir?: number;
  /** Row state — drives styling and the check toggle. */
  state?: 'pending' | 'active' | 'done';
  /** Toggle completion. */
  onToggle?: () => void;
}

/**
 * One logged set in a workout: index · load × reps · RIR · completion check.
 * The atomic unit of HEFT logging.
 */
export function SetRow(props: SetRowProps): React.ReactElement;
