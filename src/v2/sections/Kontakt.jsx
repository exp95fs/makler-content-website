import { useState } from 'react';
import { Split } from '../fx.jsx';
import { Arrow, InstagramGlyph } from '../ui.jsx';
import { kontakt } from '../../content/site.js';

/** Kontaktformular von der Live-Seite. Texte wörtlich übernommen. */
function encodeFormData(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');
}

export function Kontakt() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setBusy(true); setError(false);
    const data = Object.fromEntries(new FormData(e.target).entries());
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(data),
    })
      .then((r) => { if (!r.ok) throw new Error('failed'); setSent(true); })
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  };

  return (
    <section className="v2-sec bg-ink" id="kontakt">
      <div className="v2-wrap">
        <div className="v2-contact">
          <div className="v2-contact-info">
            <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Erzählen Sie uns von Ihrem Objekt.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Kurz Ihre Eckdaten, wir melden uns innerhalb von 24 Stunden mit einem
              Terminvorschlag.
            </p>
            <div className="v2-contact-meta" data-reveal>
              <a href={`mailto:${kontakt.email}`}><span className="k">E-Mail</span>{kontakt.email}</a>
              <a href={kontakt.telefonHref}><span className="k">Telefon</span>{kontakt.telefon}</a>
              <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
                <span className="k">Instagram</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <InstagramGlyph size={15} />{kontakt.instagramHandle}
                </span>
              </a>
              <span className="row"><span className="k">Region</span>{kontakt.region}</span>
            </div>
          </div>

          <div data-reveal>
            {sent ? (
              <div className="v2-form">
                <div className="v2-sent">
                  <span className="ok" aria-hidden="true">✓</span>
                  <h3>Danke, wir melden uns.</h3>
                  <p>
                    Ihre Anfrage ist angekommen. Sie hören innerhalb von 24 Stunden von uns, mit
                    einem Terminvorschlag für Ihr Objekt.
                  </p>
                  <button type="button" className="v2-btn ghost sm" onClick={() => setSent(false)}>Weitere Anfrage</button>
                </div>
              </div>
            ) : (
              <form className="v2-form" name="kontakt" onSubmit={submit} data-netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="kontakt" />
                <input type="text" name="bot-field" tabIndex="-1" autoComplete="off" aria-hidden="true"
                       style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
                <div className="v2-field">
                  <label htmlFor="k-name">Ihr Name</label>
                  <input id="k-name" type="text" name="name" placeholder="Vor- und Nachname" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="k-mail">E-Mail</label>
                  <input id="k-mail" type="email" name="email" placeholder="ihre@email.de" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="k-text">Nachricht</label>
                  <textarea id="k-text" name="nachricht" rows={4} placeholder="Kurz zu Ihrem Objekt und Anliegen" required />
                </div>
                <button type="submit" className="v2-btn" disabled={busy}>
                  {busy ? 'Wird gesendet' : 'Unverbindlich anfragen'} <Arrow />
                </button>
                {error && (
                  <p className="v2-form-error">
                    Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben
                    Sie direkt an <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>.
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
