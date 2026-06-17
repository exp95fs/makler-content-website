import * as React from 'react';

export interface TextareaProps {
  label?: React.ReactNode;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  hint?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}

/** Multi-line field matching Input — for contact / enquiry forms. */
export function Textarea(props: TextareaProps): JSX.Element;
