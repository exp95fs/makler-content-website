import * as React from 'react';

export interface TagProps {
  children?: React.ReactNode;
  /** Selected (sage filled) state. @default false */
  selected?: boolean;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
  style?: React.CSSProperties;
}

/** Outlined chip for filters / categories; pass onClick to make it selectable (fills sage when selected). */
export function Tag(props: TagProps): JSX.Element;
