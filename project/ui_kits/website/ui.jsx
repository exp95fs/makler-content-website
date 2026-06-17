/* Shared UI helpers for the Makler-Content website kit.
   Exposes: Icon, SectionHead. Pulls primitives from the DS bundle. */

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

function SectionHead({ eyebrow, title, lead, align = 'left', maxWidth = '52ch' }) {
  const { Eyebrow } = window.MaklerContentDesignSystem_a211b6;
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? maxWidth : 'none', margin: align === 'center' ? '0 auto' : '0' }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)', lineHeight: 1.12,
        letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
        margin: '14px 0 0', maxWidth, textWrap: 'balance',
      }}>{title}</h2>
      {lead && <p style={{
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
        fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
        color: 'var(--text-muted)', margin: '16px 0 0', maxWidth,
        marginLeft: align === 'center' ? 'auto' : 0, marginRight: align === 'center' ? 'auto' : 0,
      }}>{lead}</p>}
    </div>
  );
}

Object.assign(window, { Icon, SectionHead });
