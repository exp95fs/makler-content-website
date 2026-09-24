import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { Arrow, InstagramGlyph } from '../ui.jsx';
import { track } from '../tracking.js';
import { sendeFormular, emailGueltig } from '../formular.js';
import { kontakt } from '../../content/site.js';

/**
 * Allgemeines Kontaktformular, auch für "Regelmäßige Zusammenarbeit
 * besprechen" (erreichbar über ?anliegen=zusammenarbeit#kontakt).
 *
 * Erfolg nur nach bestätigter Serverantwort, Fehler mit erhaltenen
 * Eingaben und erneutem Senden, kein Doppelversand. Formular- und
 * Feldnamen entsprechen dem statischen Formular "kontakt" in index.html.
 *
 * `variante="start"`: Texte, Felder und Gestaltung des bisherigen
 * Onepagers (Name, E-Mail, Nachricht; "Unverbindlich anfragen"), ohne
 * die frühere Zusage "innerhalb von 24 Stunden". Versandlogik identisch.
 */
const ANLIEGEN = {
  allgemein: 'Allgemeine Frage',
  zusammenarbeit: 'Regelmäßige Zusammenarbeit',
};
const LEER = { name: '', email: '', telefon: '', nachricht: '' };

export function Kontakt({ variante = 'seite' }) {
  const start = variante === 'start';
  const [anliegen, setAnliegen] = useState('allgemein');
  const [daten, setDaten] = useState(LEER);
  const [versucht, setVersucht] = useState(false);
  const [status, setStatus] = useState('bereit');
  const sendet = useRef(false);
  const gestartet = useRef(false);
  const erfolg = useRef(null);

  // Vorauswahl aus dem Link "Regelmäßige Zusammenarbeit besprechen"
  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get('anliegen');
    if (a && ANLIEGEN[a]) setAnliegen(a);
  }, []);

  useEffect(() => { if (status === 'erfolg') erfolg.current?.focus(); }, [status]);

  const fehler = {
    name: daten.name.trim() ? null : 'Bitte geben Sie Ihren Namen an.',
    email: emailGueltig(daten.email) ? null : 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    nachricht: daten.nachricht.trim() ? null : (start ? 'Bitte schreiben Sie kurz zu Ihrem Objekt und Anliegen.' : 'Bitte schreiben Sie kurz Ihr Anliegen.'),
  };
  const offeneFehler = Object.keys(fehler).filter((k) => fehler[k]);

  const setFeld = (feld) => (e) => {
    if (!gestartet.current) { gestartet.current = true; track('formular_start', { formular: 'kontakt' }); }
    setDaten((d) => ({ ...d, [feld]: e.target.value }));
  };

  async function senden(e) {
    e.preventDefault();
    if (offeneFehler.length) {
      setVersucht(true);
      document.getElementById(`k-${offeneFehler[0]}`)?.focus();
      return;
    }
    if (sendet.current) return;
    sendet.current = true;
    setStatus('sendet');
    const ergebnis = await sendeFormular({
      'form-name': 'kontakt',
      'bot-field': e.target.elements['bot-field']?.value || '',
      anliegen: start ? 'Anfrage über die Startseite' : ANLIEGEN[anliegen],
      ...daten,
    });
    sendet.current = false;
    if (ergebnis.ok) {
      track('formular_erfolg', { formular: 'kontakt' });
      setDaten(LEER); setVersucht(false); gestartet.current = false;
      setStatus('erfolg');
    } else {
      track('formular_fehler', { formular: 'kontakt', grund: ergebnis.grund });
      setStatus('fehler');
    }
  }

  const feldProps = (feld) => ({
    id: `k-${feld}`, name: feld, value: daten[feld], onChange: setFeld(feld),
    'aria-invalid': versucht && fehler[feld] ? 'true' : undefined,
    'aria-describedby': versucht && fehler[feld] ? `k-${feld}-fehler` : undefined,
  });

  return (
    <section className="v2-sec bg-ink qb-kontakt" id="kontakt" aria-labelledby="kontakt-titel">
      <div className="v2-wrap">
        <div className="v2-contact">
          <div className="v2-contact-info">
            {start ? (
              <>
                <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
                <Split as="h2" id="kontakt-titel" className="v2-h-display v2-h-lg">
                  Erzählen Sie uns von Ihrem Objekt.
                </Split>
                <p className="v2-lead on-dark" data-reveal>
                  Kurz Ihre Eckdaten, wir melden uns persönlich mit einem Terminvorschlag.
                </p>
              </>
            ) : (
              <>
                <p className="v2-eyebrow on-dark" data-reveal>Kontakt</p>
                <Split as="h2" id="kontakt-titel" className="v2-h-display v2-h-lg">
                  Regelmäßige Zusammen­arbeit oder allgemeine Frage
                </Split>
                <p className="v2-lead on-dark" data-reveal>
                  Sie möchten die Zusammenarbeit für mehrere Objekte besprechen oder haben eine Frage
                  vorab? Schreiben Sie kurz, wir melden uns persönlich.
                </p>
              </>
            )}
            <div className="v2-contact-meta" data-reveal>
              <a href={`mailto:${kontakt.email}`}><span className="k">E-Mail</span>{kontakt.email}</a>
              <a href={kontakt.telefonHref}><span className="k">Telefon</span>{kontakt.telefon}</a>
              {start && (
                <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
                  <span className="k">Instagram</span>
                  <span className="qb-insta"><InstagramGlyph size={15} />{kontakt.instagramHandle}</span>
                </a>
              )}
              <span className="row"><span className="k">Region</span>{kontakt.region}</span>
            </div>
          </div>

          <div>
            {status === 'erfolg' ? (
              <div className="v2-form">
                <div className="v2-sent" role="status">
                  <span className="ok" aria-hidden="true">✓</span>
                  <h3 ref={erfolg} tabIndex={-1}>
                    {start ? 'Danke, wir melden uns.' : 'Vielen Dank – Ihre Nachricht ist eingegangen.'}
                  </h3>
                  <p>
                    {start ? 'Ihre Anfrage ist angekommen. Wir melden uns persönlich bei Ihnen.' : 'Wir melden uns persönlich bei Ihnen.'}
                  </p>
                  <button type="button" className="v2-btn ghost sm" onClick={() => setStatus('bereit')}>
                    {start ? 'Weitere Anfrage' : 'Weitere Nachricht'}
                  </button>
                </div>
              </div>
            ) : (
              <form className="v2-form" name="kontakt" onSubmit={senden} noValidate aria-busy={status === 'sendet'}>
                <input type="hidden" name="form-name" value="kontakt" />
                <p className="qb-hp" aria-hidden="true">
                  <label>Nicht ausfüllen <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" /></label>
                </p>
                {!start && (
                  <div className="v2-field">
                    <label htmlFor="k-anliegen">Anliegen</label>
                    <select id="k-anliegen" name="anliegen" value={anliegen} onChange={(e) => setAnliegen(e.target.value)}>
                      {Object.entries(ANLIEGEN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}
                <div className="v2-field">
                  <label htmlFor="k-name">{start ? 'Ihr Name' : 'Name *'}</label>
                  <input type="text" autoComplete="name" required placeholder={start ? 'Vor- und Nachname' : undefined} {...feldProps('name')} />
                  {versucht && fehler.name && <small className="fehler" id="k-name-fehler">{fehler.name}</small>}
                </div>
                <div className="v2-field">
                  <label htmlFor="k-email">{start ? 'E-Mail' : 'E-Mail *'}</label>
                  <input type="email" autoComplete="email" inputMode="email" required placeholder={start ? 'ihre@email.de' : undefined} {...feldProps('email')} />
                  {versucht && fehler.email && <small className="fehler" id="k-email-fehler">{fehler.email}</small>}
                </div>
                {!start && (
                  <div className="v2-field">
                    <label htmlFor="k-telefon">Telefon (optional)</label>
                    <input type="tel" autoComplete="tel" inputMode="tel" {...feldProps('telefon')} />
                  </div>
                )}
                <div className="v2-field">
                  <label htmlFor="k-nachricht">{start ? 'Nachricht' : 'Nachricht *'}</label>
                  <textarea rows={4} required placeholder={start ? 'Kurz zu Ihrem Objekt und Anliegen' : undefined} {...feldProps('nachricht')} />
                  {versucht && fehler.nachricht && <small className="fehler" id="k-nachricht-fehler">{fehler.nachricht}</small>}
                </div>
                <div aria-live="polite" role="status" className="v2-form-status">
                  {status === 'sendet' && <p>Ihre Nachricht wird gesendet …</p>}
                  {status === 'fehler' && (
                    <p className="v2-form-error">
                      Die Nachricht konnte nicht gesendet werden. Ihre Eingaben sind erhalten – bitte
                      versuchen Sie es erneut oder schreiben Sie direkt an{' '}
                      <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>.
                    </p>
                  )}
                </div>
                <button type="submit" className="v2-btn" disabled={status === 'sendet'}>
                  {status === 'sendet' ? 'Wird gesendet …' : status === 'fehler' ? 'Erneut senden' : start ? 'Unverbindlich anfragen' : 'Nachricht senden'}
                  {status !== 'sendet' && <Arrow />}
                </button>
                <p className="v2-form-note">
                  {start ? 'Ihre Angaben werden ausschließlich zur Kontaktaufnahme genutzt. Mehr dazu in der' : 'Informationen zur Verarbeitung Ihrer Angaben finden Sie in der'}{' '}
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
