import * as React from 'react';

/**
 * Makler-Content wordmark + "M" mark. PLACEHOLDER identity from brand tokens — replace with the final logo.
 * @startingPoint section="Brand" subtitle="Wordmark + mark, light/dark" viewport="700x120"
 */
export interface LogoProps {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Light wordmark for sage / photo grounds. @default false */
  onDark?: boolean;
  /** Render only the "M" mark (favicon / avatar). @default false */
  markOnly?: boolean;
  style?: React.CSSProperties;
}

export function Logo(props: LogoProps): JSX.Element;
