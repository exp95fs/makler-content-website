import * as React from 'react';

/**
 * Primary action control for Makler-Content. Terracotta `primary` for the main
 * CTA, sage `secondary` for alternate actions, `ghost` outline for low emphasis.
 *
 * @startingPoint section="Buttons" subtitle="Terracotta CTA + sage / ghost variants" viewport="700x140"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon element rendered before the label */
  iconLeft?: React.ReactNode;
  /** Icon element rendered after the label */
  iconRight?: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
