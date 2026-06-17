import * as React from 'react';

export interface EyebrowProps {
  children?: React.ReactNode;
  /** @default "accent" */
  color?: 'accent' | 'muted' | 'onDark';
  style?: React.CSSProperties;
}

/** Small uppercase kicker (Mulish 500, 0.18em) above a headline — the only uppercase text in the system. */
export function Eyebrow(props: EyebrowProps): JSX.Element;
