import React from 'react';

/** Textarea — multi-line field matching Input styling. */
export function Textarea({
  label,
  id,
  placeholder = '',
  value,
  onChange,
  rows = 4,
  hint,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `ta-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
          fontSize: '13px', color: 'var(--text-strong)',
        }}>{label}</label>
      )}
      <textarea
        id={inputId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '15px',
          lineHeight: 'var(--lh-normal)', color: 'var(--text-body)',
          background: 'var(--surface-card)',
          border: '1px solid',
          borderColor: focus ? 'var(--color-accent)' : 'var(--border-hair)',
          boxShadow: focus ? '0 0 0 3px var(--color-accent-tint)' : 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          outline: 'none', resize: 'vertical',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
        }}
        {...rest}
      />
      {hint && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}
