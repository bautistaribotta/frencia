import * as React from 'react';

export interface TabItem {
  value: string;
  label: string;
  /** Lucide icon name. */
  icon: string;
}

export interface TabFab {
  /** Lucide icon name. Default "plus". */
  icon?: string;
  label?: string;
  onClick?: () => void;
}

export interface TabBarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Tab destinations. */
  items: TabItem[];
  /** Active tab value. */
  value: string;
  onChange?: (value: string) => void;
  /** Optional center floating action (e.g. start workout). Splits items left/right. */
  fab?: TabFab;
}

/** Translucent bottom nav with an optional center action FAB. */
export function TabBar(props: TabBarProps): React.ReactElement;
