import React from 'react';

/**
 * Card — surface container with hairline border and warm soft shadow.
 * `interactive` adds a hover lift. `tone` switches the fill.
 */
export function Card({
  children,
  tone = 'surface',
  interactive = false,
  padding = 'lg',
  style = {},
  onClick,
  ...rest
}) {
  const tones = {
    surface: { background: 'var(--surface-card)', color: 'var(--text-body)' },
    taupe: { background: 'var(--surface-raised)', color: 'var(--text-body)' },
    sage: { background: 'var(--color-primary)', color: 'var(--color-on-primary)' },
  };
  const pads = { none: '0', sm: '16px', md: '24px', lg: '32px' };

  const [hover, setHover] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-hair)',
        boxShadow: hover && interactive ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        padding: pads[padding],
        transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        transform: hover && interactive ? 'translateY(-3px)' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
