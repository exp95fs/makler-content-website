import React from 'react';

/** Badge — small status/category pill. Earthy tones. */
export function Badge({ children, tone = 'neutral', style = {}, ...rest }) {
  const tones = {
    neutral: { background: 'var(--surface-sunk)', color: 'var(--text-muted)' },
    sage: { background: 'var(--color-primary-tint)', color: 'var(--color-primary-deep)' },
    accent: { background: 'var(--color-accent-tint)', color: 'var(--color-accent-deep)' },
    success: { background: '#E2E7DA', color: 'var(--status-success)' },
    solid: { background: 'var(--color-primary)', color: 'var(--color-on-primary)' },
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-medium)',
        fontSize: '12px',
        lineHeight: 1,
        letterSpacing: '0.02em',
        padding: '6px 11px',
        borderRadius: 'var(--radius-pill)',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
