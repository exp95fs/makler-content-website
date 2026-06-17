import * as React from 'react';

/**
 * Rounded photo frame — the brand's hero device for imagery, with optional scrim + caption.
 * @startingPoint section="Content" subtitle="Rounded photo frame with scrim caption" viewport="700x420"
 */
export interface MediaFrameProps {
  /** Image URL. Omit for a warm taupe placeholder. */
  src?: string | null;
  alt?: string;
  /** CSS aspect-ratio. @default "4 / 3" */
  ratio?: string;
  /** @default "xl" */
  radius?: 'md' | 'lg' | 'xl';
  /** Overlaid Fraunces caption */
  caption?: React.ReactNode;
  /** Overlaid uppercase eyebrow */
  eyebrow?: React.ReactNode;
  /** Force the dark gradient scrim even with no caption. @default false */
  scrim?: boolean;
  /** Placeholder label when no src. @default "Immobilien-Foto" */
  placeholderLabel?: string;
  style?: React.CSSProperties;
}

export function MediaFrame(props: MediaFrameProps): JSX.Element;
