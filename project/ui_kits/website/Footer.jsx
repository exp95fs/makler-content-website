/* Footer — sage ground, logo, link columns, fine print. */
function Footer({ onNav }) {
  const { Logo, Divider } = window.MaklerContentDesignSystem_a211b6;
  const { Icon } = window;

  const cols = [
    { head: 'Leistungen', links: ['Fotografie', 'Film', 'Drohne', '360° Touren'] },
    { head: 'Studio', links: ['Über uns', 'Referenzen', 'Ablauf', 'Kontakt'] },
    { head: 'Rechtliches', links: ['Impressum', 'Datenschutz', 'AGB'] },
  ];

  return (
    <footer style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: 'clamp(48px, 6vw, 72px) var(--container-pad) 36px',
        display: 'grid', gap: 'clamp(32px, 5vw, 64px)',
        gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
      }} className="mc-footer-grid">
        <div>
          <Logo size="md" onDark />
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)', fontSize: '15px',
            lineHeight: 'var(--lh-normal)', color: 'var(--color-secondary)', margin: '18px 0 0', maxWidth: '34ch',
          }}>
            Immobilien-Foto &amp; -Film für Objekte, die sich nach Zuhause anfühlen.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
            {['Instagram', 'LinkedIn', 'YouTube'].map(s => (
              <a key={s} href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 14px', borderRadius: 'var(--radius-pill)',
                background: 'rgba(243,238,229,0.10)', color: 'var(--color-on-primary)',
                fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)',
                fontSize: '13px', textDecoration: 'none',
              }}>{s}<Icon name="arrow-up-right" size={14} color="var(--color-secondary)" /></a>
            ))}
          </div>
        </div>

        {cols.map(c => (
          <div key={c.head}>
            <h4 style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '12px',
              letterSpacing: 'var(--ls-label)', textTransform: 'uppercase',
              color: 'var(--color-secondary)', margin: '0 0 14px',
            }}>{c.head}</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {c.links.map(l => (
                <li key={l}>
                  <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{
                    fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '14px',
                    color: 'var(--color-on-primary)', textDecoration: 'none', opacity: 0.86,
                  }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <Divider style={{ background: 'rgba(243,238,229,0.16)' }} />
        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          padding: '20px 0 8px',
          fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-secondary)',
        }}>
          <span>© 2026 Makler-Content</span>
          <span>Raum Baden-Baden · DACH</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
