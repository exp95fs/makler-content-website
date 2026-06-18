import React from 'react';

/**
 * Button — Quadratblick primary action.
 * Variants: primary (terracotta), secondary (sage), ghost (terracotta outline), link.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: '13px', padding: '9px 16px', gap: '7px' },
    md: { fontSize: '15px', padding: '13px 24px', gap: '9px' },
    lg: { fontSize: '16px', padding: '16px 32px', gap: '10px' },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-body-bold)',
    lineHeight: 1,
    letterSpacing: '0.005em',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-fast) var(--ease-soft), color var(--dur-fast) var(--ease-soft), border-color var(--dur-fast) var(--ease-soft), transform var(--dur-fast) var(--ease-soft)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: 'var(--action-primary)',
      color: 'var(--color-on-accent)',
    },
    secondary: {
      background: 'var(--action-secondary)',
      color: 'var(--color-on-primary)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-accent)',
      borderColor: 'var(--color-accent)',
    },
    link: {
      background: 'transparent',
      color: 'var(--color-accent)',
      padding: '4px 2px',
      borderRadius: '4px',
    },
  };

  const [hover, setHover] = React.useState(false);
  const hovers = {
    primary: { background: 'var(--action-primary-hover)' },
    secondary: { background: 'var(--action-secondary-hover)' },
    ghost: { background: 'var(--color-accent-tint)' },
    link: { color: 'var(--color-accent-deep)' },
  };

  const composed = {
    ...base,
    ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : {}),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={composed}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
