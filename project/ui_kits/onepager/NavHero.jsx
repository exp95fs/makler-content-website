/* Nav + Hero + StatBar for the Makler-Content one-pager. */

/* ---------------- Nav ---------------- */
/* PLATZHALTER: Markenname & Logo — der Logo-Baustein des Design-Systems rendert
   „Makler·Content" als Platzhalter. Später durch das finale Logo ersetzen. */
function Nav({ onNav }) {
  const { Logo, Button } = window.MaklerContentDesignSystem_a211b6;
  const { Icon } = window;
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(243,238,229,0.82)', backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid var(--border-hair)',
    }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: '13px var(--container-pad)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <a href="#top" onClick={(e) => { e.preventDefault(); onNav('top'); }} style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <Logo size="sm" />
        </a>
        <Button variant="primary" size="sm" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav('anfrage')}>
          Gratis-Pilot anfragen
        </Button>
      </div>
    </header>
  );
}

/* ---------------- Hero ---------------- */
function Hero({ onNav }) {
  const { Button, MediaFrame, Eyebrow } = window.MaklerContentDesignSystem_a211b6;
  const { Icon, Container } = window;
  return (
    <section id="top" style={{ background: 'var(--bg-page)' }}>
      <Container style={{ padding: 'clamp(44px, 6vw, 80px) var(--container-pad) clamp(40px, 5vw, 64px)' }}>
        <div style={{
          display: 'grid', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)',
        }} className="mc-hero-grid">
          <div>
            <Eyebrow>Foto &amp; Video für Makler · Raum Bühl · Baden-Baden · Rastatt</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
              fontSize: 'clamp(2.3rem, 4.8vw, 3.5rem)', lineHeight: 1.06,
              letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
              margin: '18px 0 0', textWrap: 'balance',
            }}>
              Content, der Ihre Objekte heraushebt — und Ihr{' '}
              <span style={{ color: 'var(--color-accent)' }}>Maklerbüro</span>.
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
              fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
              color: 'var(--text-muted)', margin: '22px 0 0', maxWidth: '52ch',
            }}>
              Professionelle Fotos und konzipierte Videos für Maklerbüros. Hochwertiger Content,
              der Ihre Objekte schneller vermittelt, qualifiziertere Anfragen bringt und Ihr Büro
              als Marke sichtbar macht — Konzept, Dreh und Schnitt aus einer Hand.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '30px 0 0' }}>
              <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} onClick={() => onNav('anfrage')}>
                Gratis-Pilot anfragen
              </Button>
              <Button variant="ghost" size="lg" onClick={() => onNav('portfolio')}>
                Arbeitsproben ansehen
              </Button>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)',
              margin: '20px 0 0', lineHeight: 1.6,
            }}>
              Für <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--fw-body-bold)' }}>Verkauf &amp; Vermietung</strong>
              {' '}· ein Termin, fertige Foto- und Video-Assets · Lieferung in{' '}
              <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--fw-body-bold)' }}>48 Stunden</strong>
            </p>
          </div>

          <MediaFrame
            ratio="4 / 5"
            eyebrow="Platzhalter · Showreel"
            caption="Hier läuft bald Ihr Objektvideo."
            placeholderLabel="Hero · Objektvideo"
          />
        </div>
      </Container>
    </section>
  );
}

/* ---------------- StatBar ---------------- */
function StatBar() {
  const { Container } = window;
  const stats = [
    { big: '+403 %', lbl: 'mehr Anfragen mit Video' },
    { big: '~32 %', lbl: 'schnellere Vermittlung mit Profi-Fotos' },
    { big: '73 %', lbl: 'der Verkäufer bevorzugen Makler, die Video nutzen' },
    { big: 'nur 9 %', lbl: 'der Makler machen objektspezifische Videos' },
  ];
  return (
    <section style={{
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hair)', borderBottom: '1px solid var(--border-hair)',
      padding: 'clamp(36px, 5vw, 52px) 0',
    }}>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center',
        }} className="mc-stats">
          {stats.map((s) => (
            <div key={s.lbl}>
              <div style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)', lineHeight: 1,
                letterSpacing: 'var(--ls-heading)', color: 'var(--color-accent)',
              }}>{s.big}</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13.5px', lineHeight: 1.45,
                color: 'var(--text-muted)', margin: '10px auto 0', maxWidth: '22ch',
              }}>{s.lbl}</div>
            </div>
          ))}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)',
          opacity: 0.85, textAlign: 'center', margin: '26px auto 0', maxWidth: '78ch', lineHeight: 1.55,
        }}>
          Quellen: NAR, Redfin/VHT, Branchenstudien (überwiegend international) — die Größenordnung
          ist auf den deutschen Markt übertragbar, in dem Video noch kaum genutzt wird.
        </p>
      </Container>
    </section>
  );
}

Object.assign(window, { Nav, Hero, StatBar });
