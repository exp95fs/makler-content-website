import { useEffect, useRef, useState } from 'react';
import { Split, Magnetic, scrollToId } from './fx.jsx';
import { Arrow } from './ui.jsx';

/* ---------- Fork: Zwei Wege ---------- */
export function Fork() {
  return (
    <section className="v2-sec bg-linen-2" id="start">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Bereit für Ihr Objekt?</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Zwei Wege — Sie wählen, was zu Ihnen passt.
          </Split>
          <p className="v2-lead" data-reveal>
            Noch unsicher oder erst kennenlernen? Schreiben Sie uns kurz. Sie wissen schon,
            was Sie brauchen? Dann direkt zum Wunschtermin.
          </p>
        </div>
        <div className="v2-fork-grid">
          <div className="v2-fork-card" data-reveal>
            <span className="v2-fork-badge">Neu hier? · Unverbindlich</span>
            <h3>Kurz kennenlernen</h3>
            <p>
              Sie wollen erst Fragen klären oder uns kennenlernen? Schreiben Sie uns kurz über das
              Kontaktformular — unverbindlich und ohne Terminzwang. Wir melden uns persönlich.
            </p>
            <Magnetic>
              <button type="button" className="v2-btn ghost" onClick={() => scrollToId('anfrage')}>
                Nachricht schreiben
              </button>
            </Magnetic>
            <span className="v2-fork-meta"><span className="dot" />Ideal für neue Interessenten</span>
          </div>
          <div className="v2-fork-card dark" data-reveal data-delay="0.12">
            <span className="v2-fork-badge">Sie wissen, was Sie brauchen?</span>
            <h3>Objekt-Termin direkt anfragen</h3>
            <p>
              Sie kennen uns bereits oder wissen genau, was Ihr Objekt braucht? Stellen Sie in wenigen
              Schritten Ihr Paket zusammen und fragen Sie direkt einen Wunschtermin an — die Anfrage
              ist unverbindlich, wir bestätigen persönlich.
            </p>
            <Magnetic>
              <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
                Paket &amp; Termin wählen <Arrow />
              </button>
            </Magnetic>
            <span className="v2-fork-meta"><span className="dot" />Ideal für Bestandskunden &amp; Entschlossene</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = open ? `${el.scrollHeight}px` : '0px';
  }, [open]);
  return (
    <div className={`v2-faq-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="v2-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="ico" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
        </span>
      </button>
      <div className="v2-faq-a" ref={bodyRef} aria-hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function Faq() {
  const items = [
    { q: 'Lohnt sich das wirtschaftlich?', a: 'Die Zahlen sprechen dafür: Objekte mit Profi-Fotos verkaufen rund 32 % schneller, Inserate mit Video erhalten ein Vielfaches an Anfragen, und Ferienobjekte mit guten Fotos werden deutlich öfter gebucht. Schnellere Vermittlung und qualifiziertere Anfragen sparen Ihnen Zeit und Folgekosten. Der Content amortisiert sich meist über ein einziges Objekt.' },
    { q: 'Erstellen Sie auch Content für Objekte zur Vermietung?', a: 'Ja. Neben Verkaufsobjekten produzieren wir gezielt Content für Miet- und Ferienobjekte (z. B. Airbnb/Booking). Dort wirkt guter Content auf Buchungsrate und erzielbaren Preis besonders stark.' },
    { q: 'Wie läuft die Terminanfrage ab?', a: 'Sie stellen Ihr Paket im Buchungsbereich zusammen und wählen einen Wunschtermin. Bei zwei Objekten wählen Sie Paket und Optionen für jedes Objekt einzeln. Die Anfrage ist unverbindlich, wir melden uns innerhalb von 1–2 Werktagen persönlich mit einer verbindlichen Bestätigung.' },
    { q: 'Was kostet die Produktion?', a: 'Eine Einzelproduktion liegt je nach Umfang bei 390–1.290 € netto: Foto-Pakete ab 390 €, Videoproduktionen ab 890 €, dazu optionale Zusatzleistungen wie Drohne oder Home Staging. Bei zwei Objekten am selben Termin sparen Sie 10 % auf den Gesamtpreis. Ihr genauer Preis wird in der Terminanfrage berechnet.' },
    { q: 'Wie viel Zeit kostet mich das?', a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest machen wir.' },
    { q: 'Wem gehören die Aufnahmen?', a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Wir dürfen das Ergebnis als Arbeitsprobe zeigen.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="v2-sec bg-linen-2" id="faq">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Häufige Fragen</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Damit keine Fragen offen bleiben.
          </Split>
        </div>
        <div className="v2-faq" data-reveal>
          {items.map((it, i) => (
            <FaqItem key={it.q} q={it.q} a={it.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Kontakt ---------- */
function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export function Contact() {
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
    <section className="v2-sec bg-ink" id="anfrage">
      <div className="v2-wrap">
        <div className="v2-contact">
          <div className="v2-contact-info">
            <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Erzählen Sie uns von Ihrem Objekt.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Kurz Ihre Eckdaten, wir melden uns innerhalb von 24 Stunden mit einem Terminvorschlag.
            </p>
            <div className="v2-contact-meta" data-reveal>
              <a href="mailto:info@quadratblick.de"><span className="k">E-Mail</span>info@quadratblick.de</a>
              <a href="tel:+4915904692843"><span className="k">Telefon</span>0159 0469 2843</a>
              <a href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer"><span className="k">Instagram</span>@quadratblick_de</a>
              <span className="row"><span className="k">Region</span>Bühl · Mittelbaden · Ortenau</span>
            </div>
          </div>
          <div className="v2-form" data-reveal data-delay="0.15">
            {sent ? (
              <div className="v2-sent">
                <span className="ok">✓</span>
                <h3>Danke, wir melden uns.</h3>
                <p>
                  Ihre Anfrage ist angekommen. Sie hören innerhalb von 24 Stunden von uns,
                  mit einem Terminvorschlag für Ihr Objekt.
                </p>
                <button type="button" className="v2-btn ghost sm" onClick={() => setSent(false)}>Weitere Anfrage</button>
              </div>
            ) : (
              <form name="kontakt" onSubmit={handleSubmit} data-netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="kontakt" />
                <input type="text" name="bot-field" tabIndex="-1" autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
                <div className="v2-field">
                  <label htmlFor="v2-name">Ihr Name</label>
                  <input id="v2-name" type="text" name="name" placeholder="Vor- und Nachname" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="v2-email">E-Mail</label>
                  <input id="v2-email" type="email" name="email" placeholder="ihre@email.de" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="v2-msg">Nachricht</label>
                  <textarea id="v2-msg" name="nachricht" rows={4} placeholder="Kurz zu Ihrem Objekt und Anliegen" required />
                </div>
                <button type="submit" className="v2-btn" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                  {submitting ? 'Wird gesendet …' : 'Unverbindlich anfragen'} <Arrow />
                </button>
                {submitError && (
                  <p className="v2-form-error">
                    Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie direkt an{' '}
                    <a href="mailto:info@quadratblick.de">info@quadratblick.de</a>.
                  </p>
                )}
                <p className="v2-form-note">
                  Ihre Angaben werden ausschließlich zur Kontaktaufnahme genutzt. Mehr dazu in der{' '}
                  <a href="/datenschutz.html">Datenschutzerklärung</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

