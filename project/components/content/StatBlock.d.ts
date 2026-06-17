import * as React from 'react';

export interface StatBlockProps {
  /** The figure, e.g. "250+" */
  value?: React.ReactNode;
  /** Uppercase label under the figure */
  label?: React.ReactNode;
  /** @default "default" */
  tone?: 'default' | 'onDark';
  style?: React.CSSProperties;
}

/** A Fraunces figure with a Mulish uppercase label — for proof / stat bands. Use tone="onDark" on sage grounds. */
export function StatBlock(props: StatBlockProps): JSX.Element;
