import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL. Falls back to initials when absent. */
  src?: string;
  /** Full name — used for initials and alt text. */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Emerald focus ring. */
  ring?: boolean;
}

/** Circular user avatar with initials fallback. */
export function Avatar(props: AvatarProps): React.ReactElement;
