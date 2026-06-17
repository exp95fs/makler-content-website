/* Hero — eyebrow, display headline, lead, CTAs, hero media, stat band. */
function Hero({ onNav }) {
  const { Button, MediaFrame, StatBlock, Eyebrow, Divider } = window.MaklerContentDesignSystem_a211b6;
  const { Icon } = window;

  return (
    <section id="top" style={{ background: 'var(--bg-page)' }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto',
        padding: 'clamp(48px, 7vw, 88px) var(--container-pad) 0',
        display: 'grid', gap: 'clamp(32px, 5vw, 64px)', alignItems: 'center',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
      }} className="mc-hero-grid">
        <div>
          <Eyebrow>Wohnen mit Charakter</Eyebrow>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
            fontSize: 'clamp(2.6rem, 5.4vw, 3.9rem)', lineHeight: 1.05,
            letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
            margin: '18px 0 0', textWrap: 'balance',
          }}>
            Wo Menschen ankommen — eingefangen in echtem Licht.
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
            fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
            color: 'var(--text-muted)', margin: '22px 0 0', maxWidth: '46ch',
          }}>
            Foto &amp; Film für Objekte, die sich nach Zuhause anfühlen. Warm, ehrlich,
            einladend — und planbar geliefert für Makler, Bauträger und Eigentümer im DACH-Raum.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '30px 0 0' }}>
            <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} onClick={() => onNav('contact')}>
              Termin anfragen
            </Button>
            <Button variant="ghost" size="lg" iconLeft={<Icon name="play" size={16} />} onClick={() => onNav('portfolio')}>
              Portfolio ansehen
            </Button>
          </div>
        </div>

        <MediaFrame ratio="4 / 5" eyebrow="Referenz · Baden-Baden" caption="Landhaus am Waldrand" placeholderLabel="Hero · Immobilien-Foto" />
      </div>

      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <Divider style={{ margin: 'clamp(40px, 6vw, 72px) 0 0' }} />
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '40px 64px',
          padding: 'clamp(28px, 4vw, 40px) 0',
        }}>
          <StatBlock value="250+" label="Objekte im Jahr" />
          <StatBlock value="48 h" label="Lieferzeit" />
          <StatBlock value="12" label="Jahre Erfahrung" />
          <StatBlock value="100%" label="Termintreue" />
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
