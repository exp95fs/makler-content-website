/* Contact / CTA — enquiry form with success state. */
function Contact() {
  const { Card, Input, Textarea, Button, Eyebrow } = window.MaklerContentDesignSystem_a211b6;
  const { Icon, SectionHead } = window;
  const [sent, setSent] = React.useState(false);

  const contactRows = [
    { icon: 'mail', label: 'hallo@makler-content.de' },
    { icon: 'phone', label: '+49 7221 00 00 00' },
    { icon: 'map-pin', label: 'Raum Baden-Baden · DACH' },
  ];

  return (
    <section id="contact" style={{ background: 'var(--surface-card)', padding: 'clamp(56px, 8vw, 96px) 0', borderTop: '1px solid var(--border-hair)' }}>
      <div style={{
        maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--container-pad)',
        display: 'grid', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'start',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)',
      }} className="mc-contact-grid">
        <div>
          <SectionHead
            eyebrow="Kontakt"
            title="Erzählen Sie uns von Ihrem Objekt."
            lead="Ein kurzer Anruf oder ein paar Zeilen genügen — wir melden uns mit einem Vorschlag für Paket und Termin."
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '28px' }}>
            {contactRows.map((r) => (
              <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '38px', height: '38px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent-tint)', color: 'var(--color-accent-deep)',
                }}><Icon name={r.icon} size={18} /></span>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '15px', color: 'var(--text-body)' }}>{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Card padding="lg" tone="surface" style={{ border: '1px solid var(--border-hair)' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '14px', padding: '18px 6px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
              }}><Icon name="check" size={26} /></span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '23px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)', margin: 0 }}>
                Danke — wir melden uns.
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '15px', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: 0 }}>
                Ihre Anfrage ist angekommen. In der Regel hören Sie innerhalb eines Werktags von uns.
              </p>
              <Button variant="ghost" size="md" onClick={() => setSent(false)}>Weitere Anfrage</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Eyebrow>Anfrage</Eyebrow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="mc-form-row">
                <Input label="Name" placeholder="Ihr Name" required />
                <Input label="E-Mail" type="email" placeholder="name@beispiel.de" required />
              </div>
              <Textarea label="Ihr Objekt" rows={4} placeholder="Lage, Größe, gewünschter Termin …" hint="Je mehr Sie erzählen, desto konkreter unser Vorschlag." />
              <Button type="submit" variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} style={{ width: '100%' }}>
                Anfrage senden
              </Button>
            </form>
          )}
        </Card>
      </div>
    </section>
  );
}

Object.assign(window, { Contact });
