import React from 'react';

/** Divider — hairline rule. Optional centered ornament dot in terracotta. */
export function Divider({ ornament = false, style = {}, ...rest }) {
  if (ornament) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', ...style }} {...rest}>
        <span style={{ flex: 1, height: '1px', background: 'var(--border-hair)' }} />
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-accent)' }} />
        <span style={{ flex: 1, height: '1px', background: 'var(--border-hair)' }} />
      </div>
    );
  }
  return <hr style={{ border: 'none', height: '1px', background: 'var(--border-hair)', margin: 0, ...style }} {...rest} />;
}
