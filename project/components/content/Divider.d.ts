import * as React from 'react';

export interface DividerProps {
  /** Centered terracotta dot ornament. @default false */
  ornament?: boolean;
  style?: React.CSSProperties;
}

/** Hairline rule; `ornament` adds a centered terracotta dot for section breaks. */
export function Divider(props: DividerProps): JSX.Element;
