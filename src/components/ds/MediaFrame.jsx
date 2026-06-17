import React from 'react';

/**
 * MediaFrame — rounded image frame, the brand's hero device for photography.
 * Warm taupe placeholder when no `src`. Optional scrim + caption overlay.
 */
export function MediaFrame({
  src = null,
  alt = '',
  ratio = '4 / 3',
  radius = 'xl',
  caption = null,
  eyebrow = null,
  scrim = false,
  placeholderLabel = 'Immobilien-Foto',
  style = {},
  ...rest
}) {
  const radii = {
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  };
  const hasOverlay = scrim || caption || eyebrow;

  return (
    <figure
      style={{
        position: 'relative',
        margin: 0,
        aspectRatio: ratio,
        borderRadius: radii[radius] || radii.xl,
        overflow: 'hidden',
        background: 'var(--color-secondary)',
        boxShadow: 'var(--shadow-lg)',
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-primary)', opacity: 0.55,
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
          fontSize: '12px', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
        }}>
          {placeholderLabel}
        </div>
      )}

      {hasOverlay && (
        <figcaption style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '22px',
          background: scrim || caption || eyebrow
            ? 'linear-gradient(to top, var(--color-overlay), rgba(42,42,34,0) 58%)'
            : 'none',
        }}>
          {eyebrow && (
            <span style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
              fontSize: 'var(--fs-caption)', letterSpacing: 'var(--ls-label)',
              textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '6px',
            }}>{eyebrow}</span>
          )}
          {caption && (
            <span style={{
              fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
              fontSize: '20px', lineHeight: 1.15, letterSpacing: 'var(--ls-heading)',
              color: 'var(--color-on-primary)',
            }}>{caption}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
