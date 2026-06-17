import React from 'react';

/**
 * Logo — Makler-Content wordmark + "M" mark.
 * PLACEHOLDER identity built from brand tokens (no final logo exists yet).
 * `onDark` for sage/photo grounds; `markOnly` for favicons/avatars.
 */
export function Logo({
  size = 'md',
  onDark = false,
  markOnly = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { mark: 28, font: 16, radius: 'var(--radius-sm)' },
    md: { mark: 40, font: 22, radius: 'var(--radius-md)' },
    lg: { mark: 56, font: 30, radius: 'var(--radius-lg)' },
  };
  const s = sizes[size] || sizes.md;

  const markBg = onDark ? 'var(--color-accent)' : 'var(--color-primary)';
  const markFg = onDark ? 'var(--color-on-accent)' : 'var(--color-on-primary)';
  const wordColor = onDark ? 'var(--color-on-primary)' : 'var(--text-strong)';

  const mark = (
    <span style={{
      width: s.mark, height: s.mark, flex: 'none',
      borderRadius: s.radius,
      background: markBg, color: markFg,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
      fontSize: s.font, lineHeight: 1,
    }}>M</span>
  );

  if (markOnly) {
    return <span style={{ display: 'inline-flex', ...style }} {...rest}>{mark}</span>;
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', ...style }} {...rest}>
      {mark}
      <span style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: s.font, letterSpacing: 'var(--ls-heading)', color: wordColor,
        whiteSpace: 'nowrap',
      }}>
        Makler<span style={{ color: onDark ? 'var(--color-secondary)' : 'var(--color-accent)' }}>·</span>Content
      </span>
    </span>
  );
}
