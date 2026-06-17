import React from 'react';

/** Eyebrow — small uppercase kicker above headlines. The only uppercase in the system. */
export function Eyebrow({ children, color = 'accent', style = {}, ...rest }) {
  const colors = {
    accent: 'var(--color-accent)',
    muted: 'var(--text-muted)',
    onDark: 'var(--color-on-primary)',
  };
  return (
    <span
      style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-medium)',
        fontSize: 'var(--fs-caption)',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: colors[color] || colors.accent,
        display: 'inline-block',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
