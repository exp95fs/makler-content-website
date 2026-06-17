import * as React from 'react';

/**
 * Surface container — hairline border, warm soft shadow, 18px radius.
 * @startingPoint section="Content" subtitle="Warm surface card with hover lift" viewport="700x220"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Fill tone. @default "surface" */
  tone?: 'surface' | 'taupe' | 'sage';
  /** Adds hover lift + pointer. @default false */
  interactive?: boolean;
  /** @default "lg" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function Card(props: CardProps): JSX.Element;
