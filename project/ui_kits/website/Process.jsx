/* Process / Ablauf — numbered steps + sage testimonial band. */
function Process() {
  const { Eyebrow, StatBlock } = window.MaklerContentDesignSystem_a211b6;
  const { SectionHead } = window;

  const steps = [
    { n: '01', title: 'Anfrage & Termin', text: 'Sie schildern Objekt und Ziel — wir schlagen Paket und Drehtag vor.' },
    { n: '02', title: 'Produktion vor Ort', text: 'Wir kommen, lesen das Licht und fangen die Atmosphäre ein. Ruhig und effizient.' },
    { n: '03', title: 'Auswahl & Schnitt', text: 'Bearbeitung in der Makler-Content-Bildsprache — warm, ehrlich, konsistent.' },
    { n: '04', title: 'Lieferung in 48 h', text: 'Fertige Foto- und Filmpakete, sauber benannt, optimiert für jede Plattform.' },
  ];

  return (
    <section id="process" style={{ background: 'var(--bg-page)', padding: 'clamp(56px, 8vw, 96px) 0' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <SectionHead eyebrow="Ablauf" title="Planbar von der Anfrage bis zur Lieferung." align="center" />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 48px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          {steps.map((s) => (
            <div key={s.n} style={{ position: 'relative', paddingTop: '14px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '34px', color: 'var(--color-accent)', lineHeight: 1,
                letterSpacing: 'var(--ls-heading)',
              }}>{s.n}</span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '19px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '14px 0 8px',
              }}>{s.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '14px',
                lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: 0,
              }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial band on sage */}
      <div id="about" style={{
        maxWidth: 'var(--container-max)', margin: 'clamp(48px, 6vw, 80px) auto 0',
        padding: '0 var(--container-pad)',
      }}>
        <div style={{
          background: 'var(--color-primary)', borderRadius: 'var(--radius-xl)',
          padding: 'clamp(36px, 5vw, 64px)',
          display: 'grid', gap: 'clamp(28px, 4vw, 56px)', alignItems: 'center',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        }} className="mc-quote-grid">
          <div>
            <Eyebrow color="onDark">Über uns</Eyebrow>
            <blockquote style={{
              fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading-reg)',
              fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)', lineHeight: 1.32,
              letterSpacing: 'var(--ls-heading)', color: 'var(--color-on-primary)',
              margin: '16px 0 0', textWrap: 'balance',
            }}>
              „Die Bilder von Makler-Content verkaufen, bevor das erste Wort fällt.
              Termintreu, konsistent — und immer mit Gefühl für das Objekt."
            </blockquote>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '14px',
              color: 'var(--color-secondary)', margin: '20px 0 0', letterSpacing: '0.02em',
            }}>
              Katharina Lenz · Geschäftsführerin, Lenz Immobilien
            </p>
          </div>
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <StatBlock value="4,9" label="Ø Bewertung" tone="onDark" />
            <StatBlock value="98%" label="Wiederbuchung" tone="onDark" />
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Process });
