import React from 'react';

/** Tag — outlined chip for filters / categories, optionally selectable. */
export function Tag({ children, selected = false, onClick, style = {}, ...rest }) {
  const interactive = typeof onClick === 'function';
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-medium)',
        fontSize: '13px',
        lineHeight: 1,
        padding: '8px 15px',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        borderColor: selected ? 'var(--color-primary)' : 'var(--border-hair)',
        background: selected ? 'var(--color-primary)' : 'transparent',
        color: selected ? 'var(--color-on-primary)' : 'var(--text-muted)',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all var(--dur-fast) var(--ease-soft)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
