/* Services / Leistungen — icon cards. */
function Services() {
  const { Card, Eyebrow } = window.MaklerContentDesignSystem_a211b6;
  const { Icon, SectionHead } = window;

  const items = [
    { icon: 'camera', title: 'Immobilienfotografie', text: 'Innen, außen und Detail — in warmem, natürlichem Licht, das Atmosphäre statt Quadratmeter zeigt.' },
    { icon: 'video', title: 'Immobilienfilm', text: 'Bewegtbild, das im Feed funktioniert: ruhige Kamera, echte Räume, das Gefühl vom Ankommen.' },
    { icon: 'send', title: 'Drohnenaufnahmen', text: 'Lage, Grundstück und Umgebung aus der Luft — der Kontext, der ein Objekt einordnet.' },
    { icon: 'scan', title: '360° &amp; Virtuelle Touren', text: 'Begehbare Rundgänge für die Online-Vermarktung — Interessenten sind schon drin, bevor sie kommen.' },
  ];

  return (
    <section id="services" style={{ background: 'var(--bg-page)', padding: 'clamp(56px, 8vw, 96px) 0' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHead
          eyebrow="Leistungen"
          title="Eine Bildsprache, die Ihr Objekt heraushebt."
          lead="Vom Einfamilienhaus bis zum Neubauprojekt — konsistent, planbar, premium."
        />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 48px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))',
        }}>
          {items.map((it) => (
            <Card key={it.title} interactive padding="lg">
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
              }}>
                <Icon name={it.icon} size={22} />
              </span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '20px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '18px 0 8px',
              }} dangerouslySetInnerHTML={{ __html: it.title }} />
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '14.5px',
                lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: 0,
              }} dangerouslySetInnerHTML={{ __html: it.text }} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Services });
