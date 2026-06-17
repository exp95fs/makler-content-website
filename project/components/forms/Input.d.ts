import * as React from 'react';

export interface InputProps {
  label?: React.ReactNode;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Helper text below the field */
  hint?: React.ReactNode;
  /** Error text (overrides hint, turns the field terracotta-deep) */
  error?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Labelled text field on warm surface; terracotta focus ring. */
export function Input(props: InputProps): JSX.Element;
