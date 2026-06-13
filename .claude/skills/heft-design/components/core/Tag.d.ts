import * as React from 'react';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Selected (filter) state — tints emerald. */
  selected?: boolean;
  /** Adds hover/cursor affordance for filter chips. */
  selectable?: boolean;
  /** Show a leading color dot. */
  dot?: boolean;
  children?: React.ReactNode;
}

/** Pill tag for muscle groups, categories and filter chips. */
export function Tag(props: TagProps): React.ReactElement;
