import React from 'react';

/**
 * StatBlock — a single Fraunces figure with a Mulish label. Used in proof bands.
 */
export function StatBlock({ value, label, tone = 'default', style = {}, ...rest }) {
  const color = tone === 'onDark' ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const labelColor = tone === 'onDark' ? 'rgba(243,238,229,0.72)' : 'var(--text-muted)';
  const accent = tone === 'onDark' ? 'var(--color-secondary)' : 'var(--color-accent)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }} {...rest}>
      <span style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--fw-heading)',
        fontSize: '40px',
        lineHeight: 1,
        letterSpacing: 'var(--ls-heading)',
        color,
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-medium)',
        fontSize: '12px',
        letterSpacing: 'var(--ls-label)',
        textTransform: 'uppercase',
        color: labelColor,
      }}>
        <span style={{ color: accent }}>·&nbsp;</span>{label}
      </span>
    </div>
  );
}
