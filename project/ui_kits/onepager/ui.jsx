/* Shared helpers for the Makler-Content one-pager.
   Exposes: Icon, Container, Section, SectionHead. */

function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) {
      window.lucide.createIcons();
      const svg = host.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.strokeWidth = strokeWidth;
      }
    }
  }, [name, size, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', color, ...style }} />;
}

function Container({ children, style = {} }) {
  return (
    <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)', ...style }}>
      {children}
    </div>
  );
}

function Section({ id, bg = 'page', divider = false, children, style = {} }) {
  const bgs = {
    page: 'var(--bg-page)',
    surface: 'var(--surface-card)',
    sage: 'var(--color-primary)',
  };
  return (
    <section id={id} style={{
      background: bgs[bg],
      padding: 'clamp(56px, 8vw, 96px) 0',
      borderTop: divider ? '1px solid var(--border-hair)' : 'none',
      borderBottom: divider ? '1px solid var(--border-hair)' : 'none',
      ...style,
    }}>
      {children}
    </section>
  );
}

function SectionHead({ eyebrow, title, lead, align = 'left', onDark = false, maxWidth = '54ch' }) {
  const { Eyebrow } = window.MaklerContentDesignSystem_a211b6;
  const titleColor = onDark ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const leadColor = onDark ? 'var(--color-secondary)' : 'var(--text-muted)';
  const centered = align === 'center';
  return (
    <div style={{ textAlign: align, maxWidth: centered ? maxWidth : 'none', margin: centered ? '0 auto' : '0' }}>
      {eyebrow && <Eyebrow color={onDark ? 'onDark' : 'accent'}>{eyebrow}</Eyebrow>}
      {title && <h2 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', lineHeight: 1.14,
        letterSpacing: 'var(--ls-heading)', color: titleColor,
        margin: '14px 0 0', maxWidth, textWrap: 'balance',
        marginLeft: centered ? 'auto' : 0, marginRight: centered ? 'auto' : 0,
      }}>{title}</h2>}
      {lead && <p style={{
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
        fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
        color: leadColor, margin: '16px 0 0', maxWidth,
        marginLeft: centered ? 'auto' : 0, marginRight: centered ? 'auto' : 0,
      }}>{lead}</p>}
    </div>
  );
}

Object.assign(window, { Icon, Container, Section, SectionHead });
