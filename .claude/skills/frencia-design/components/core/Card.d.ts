import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `default` flat card, `elevated` raised w/ shadow, `inset` well, `green`/`orange` tinted state. */
  variant?: 'default' | 'elevated' | 'inset' | 'green' | 'orange';
  /** Add a subtle hairline border. */
  hairline?: boolean;
  /** Press/hover affordance for tappable cards. */
  interactive?: boolean;
  children?: React.ReactNode;
}

/** Surface container. Steps by lightness; reserve `elevated` shadow for floating content. */
export function Card(props: CardProps): React.ReactElement;
