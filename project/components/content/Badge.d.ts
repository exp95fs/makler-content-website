import * as React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  /** @default "neutral" */
  tone?: 'neutral' | 'sage' | 'accent' | 'success' | 'solid';
  style?: React.CSSProperties;
}

/** Small rounded status / category pill in earthy tones. */
export function Badge(props: BadgeProps): JSX.Element;
