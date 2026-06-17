import React from 'react';

/** Input — labelled text field on warm surface. */
export function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  hint,
  error,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `in-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', ...style }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
          fontSize: '13px', color: 'var(--text-strong)',
        }}>{label}</label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '15px',
          color: 'var(--text-body)',
          background: 'var(--surface-card)',
          border: '1px solid',
          borderColor: error ? 'var(--status-danger)' : focus ? 'var(--color-accent)' : 'var(--border-hair)',
          boxShadow: focus ? '0 0 0 3px var(--color-accent-tint)' : 'none',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          outline: 'none',
          opacity: disabled ? 0.5 : 1,
          transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)',
        }}
        {...rest}
      />
      {(hint || error) && (
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '12px',
          color: error ? 'var(--status-danger)' : 'var(--text-muted)',
        }}>{error || hint}</span>
      )}
    </div>
  );
}
