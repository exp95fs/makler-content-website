import { useState } from 'react';
import { Input } from '../components/ds/Input.jsx';
import { Textarea } from '../components/ds/Textarea.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Eyebrow } from '../components/ds/Eyebrow.jsx';
import { Logo } from '../components/ds/Logo.jsx';
import { Divider } from '../components/ds/Divider.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

export function Faq() {
  const items = [
    { q: 'Lohnt sich das wirtschaftlich?', a: 'Die Zahlen sprechen dafür: Objekte mit Profi-Fotos verkaufen rund 32 % schneller, Inserate mit Video erhalten ein Vielfaches an Anfragen, und Ferienobjekte mit guten Fotos werden deutlich öfter gebucht. Schnellere Vermittlung und qualifiziertere Anfragen sparen Ihnen Zeit und Folgekosten. Der Content amortisiert sich meist über ein einziges Objekt.' },
    { q: 'Erstellen Sie auch Content für Objekte zur Vermietung?', a: 'Ja. Neben Verkaufsobjekten produzieren wir gezielt Content für Miet- und Ferienobjekte (z. B. Airbnb/Booking). Dort wirkt guter Content auf Buchungsrate und erzielbaren Preis besonders stark.' },
    { q: 'Warum gratis, wo ist der Haken?', a: 'Keiner. Ich baue mein Portfolio auf und brauche dafür echte Objekte in Top-Qualität. Sie bekommen das fertige Ergebnis, ich bekomme eine Referenz. Fairer Tausch.' },
    { q: 'Was kostet es danach?', a: 'Nichts, solange Sie nichts weiter beauftragen. Möchten Sie weitere Objekte, liegt eine Einzelproduktion bei 320–1.590 € je nach Umfang; für regelmäßigen Objektfluss gibt es planbare Monatspakete. Völlig unverbindlich.' },
    { q: 'Wie viel Zeit kostet mich das?', a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest mache ich.' },
    { q: 'Wem gehören die Aufnahmen?', a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Ich darf das Ergebnis als Arbeitsprobe zeigen.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <Section bg="page">
      <Container>
        <SectionHead align="center" eyebrow="Häufige Fragen" title="Bevor Sie anfragen." />
        <div style={{ maxWidth: '820px', margin: 'clamp(28px, 4vw, 40px) auto 0', display: 'grid', gap: '12px' }}>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                background: 'var(--surface-card)',
                border: '1px solid', borderColor: isOpen ? 'var(--color-accent)' : 'var(--border-hair)',
                borderRadius: 'var(--radius-md)', overflow: 'hidden',
                transition: 'border-color var(--dur-fast) var(--ease-soft)',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '16px', padding: '18px 22px', background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '16px',
                    color: 'var(--text-strong)',
                  }}>
                  <span>{it.q}</span>
                  <span style={{
                    flex: 'none', color: 'var(--color-accent)',
                    transform: isOpen ? 'rotate(45deg)' : 'none',
                    transition: 'transform var(--dur-base) var(--ease-standard)',
                  }}>
                    <Icon name="plus" size={20} color="var(--color-accent)" />
                  </span>
                </button>
                {isOpen && (
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
                    color: 'var(--text-muted)', margin: 0, padding: '0 22px 20px',
                  }}>{it.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    const data = Object.fromEntries(new FormData(e.target).entries());
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(data),
    })
      .then((res) => { if (!res.ok) throw new Error('submit failed'); setSent(true); })
      .catch(() => setSubmitError(true))
      .finally(() => setSubmitting(false));
  };

  return (
    <Section bg="surface" id="anfrage" divider>
      <Container>
        <div style={{ textAlign: 'center', maxWidth: '60ch', margin: '0 auto' }}>
          <Eyebrow>Jetzt anfragen</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1.16,
            letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
            margin: '14px 0 0', textWrap: 'balance',
          }}>
            Sichern Sie sich einen der 3 Pilotplätze.
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)', fontSize: 'var(--fs-lead)',
            lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: '14px auto 0',
          }}>
            Kurz Ihre Eckdaten — ich melde mich innerhalb von 24 Stunden mit einem Terminvorschlag.
          </p>
        </div>

        <div style={{
          maxWidth: '580px', margin: 'clamp(28px, 4vw, 40px) auto 0',
          background: 'var(--bg-page)', border: '1px solid var(--border-hair)',
          borderRadius: 'var(--radius-lg)', padding: 'clamp(28px, 4vw, 38px)',
          boxShadow: 'var(--shadow-md)',
        }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px', padding: '16px 0' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
              }}><Icon name="check" size={28} color="var(--color-primary)" /></span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '23px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)', margin: 0 }}>
                Danke — ich melde mich.
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: 0, maxWidth: '44ch' }}>
                Ihre Anfrage ist angekommen. Sie hören innerhalb von 24 Stunden von mir — mit einem Terminvorschlag für Ihr Pilot-Objekt.
              </p>
              <Button variant="ghost" size="md" onClick={() => setSent(false)}>Weitere Anfrage</Button>
            </div>
          ) : (
            <form name="kontakt" onSubmit={handleSubmit} data-netlify-honeypot="bot-field" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="hidden" name="form-name" value="kontakt" />
              <input type="text" name="bot-field" tabIndex="-1" autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} aria-hidden="true" />
              <Input label="Ihr Name" name="name" placeholder="Vor- und Nachname" required />
              <Input label="E-Mail" name="email" type="email" placeholder="ihre@email.de" required />
              <Textarea label="Nachricht" name="nachricht" rows={4} placeholder="Kurz zu Ihrem Objekt und Anliegen" required />
              <Button type="submit" variant="primary" size="lg" disabled={submitting} iconRight={<Icon name="arrow-right" size={18} />} style={{ width: '100%' }}>
                {submitting ? 'Wird gesendet …' : 'Gratis-Pilot anfragen'}
              </Button>
              {submitError && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--status-danger)', textAlign: 'center', margin: 0 }}>
                  Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie direkt an{' '}
                  <a href="mailto:fabian.schneebiegl@gmail.com" style={{ color: 'var(--status-danger)' }}>fabian.schneebiegl@gmail.com</a>.
                </p>
              )}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
                Ihre Angaben werden ausschließlich zur Kontaktaufnahme genutzt. Mehr dazu in der{' '}
                <a href="/datenschutz.html" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Datenschutzerklärung</a>.
              </p>
            </form>
          )}
        </div>
      </Container>
    </Section>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
      <Container style={{ padding: 'clamp(44px, 6vw, 64px) var(--container-pad) 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '42ch' }}>
            {/* PLATZHALTER: Logo / Markenname */}
            <Logo size="md" onDark />
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)', fontSize: '14.5px',
              lineHeight: 'var(--lh-normal)', color: 'var(--color-secondary)', margin: '16px 0 0',
            }}>
              Fabian Schneebiegl · Foto- &amp; Videoproduktion für Immobilien · Verkauf &amp; Vermietung ·
              Raum Bühl · Mittelbaden · Ortenau
            </p>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-on-primary)', lineHeight: 2 }}>
            <div style={{ opacity: 0.86 }}>
              <a href="mailto:fabian.schneebiegl@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>fabian.schneebiegl@gmail.com</a>
            </div>
            <div style={{ opacity: 0.86 }}>
              <a href="tel:+4915904692843" style={{ color: 'inherit', textDecoration: 'none' }}>0159 0469 2843</a>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <a href="/impressum.html" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>Impressum</a>
              <a href="/datenschutz.html" style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}>Datenschutz</a>
            </div>
          </div>
        </div>
        <Divider style={{ background: 'rgba(243,238,229,0.16)', margin: '28px 0 0' }} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-secondary)', margin: '20px 0 0' }}>
          © 2026 · Markenname &amp; Logo sind Platzhalter und werden später ersetzt.
        </p>
      </Container>
    </footer>
  );
}
