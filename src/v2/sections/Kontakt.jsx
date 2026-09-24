import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { Arrow, InstagramGlyph } from '../ui.jsx';
import { track } from '../tracking.js';
import { sendeFormular, emailGueltig } from '../formular.js';
import { kontakt } from '../../content/site.js';

/**
 * Kontaktformular des Onepagers: Name, E-Mail, Nachricht.
 *
 * Erfolg nur nach bestätigter Serverantwort, Fehler mit erhaltenen
 * Eingaben und erneutem Senden, kein Doppelversand. Formular- und
 * Feldnamen entsprechen dem statischen Formular "kontakt" in index.html.
 *
 * Texte wie im bisherigen Onepager, ohne die frühere Zusage "innerhalb
 * von 24 Stunden".
 */
const LEER = { name: '', email: '', nachricht: '' };

export function Kontakt() {
  const [daten, setDaten] = useState(LEER);
  const [versucht, setVersucht] = useState(false);
  const [status, setStatus] = useState('bereit');
  const sendet = useRef(false);
  const gestartet = useRef(false);
  const erfolg = useRef(null);

  useEffect(() => { if (status === 'erfolg') erfolg.current?.focus(); }, [status]);

  const fehler = {
    name: daten.name.trim() ? null : 'Bitte geben Sie Ihren Namen an.',
    email: emailGueltig(daten.email) ? null : 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    nachricht: daten.nachricht.trim() ? null : 'Bitte schreiben Sie kurz zu Ihrem Objekt und Anliegen.',
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
      anliegen: 'Anfrage über die Startseite',
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
            <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
            <Split as="h2" id="kontakt-titel" className="v2-h-display v2-h-lg">
              Erzählen Sie uns von Ihrem Objekt.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Kurz Ihre Eckdaten, wir melden uns persönlich mit einem Terminvorschlag.
            </p>
            <div className="v2-contact-meta" data-reveal>
              <a href={`mailto:${kontakt.email}`}><span className="k">E-Mail</span>{kontakt.email}</a>
              <a href={kontakt.telefonHref}><span className="k">Telefon</span>{kontakt.telefon}</a>
              <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
                <span className="k">Instagram</span>
                <span className="qb-insta"><InstagramGlyph size={15} />{kontakt.instagramHandle}</span>
              </a>
              <span className="row"><span className="k">Region</span>{kontakt.region}</span>
            </div>
          </div>

          <div>
            {status === 'erfolg' ? (
              <div className="v2-form">
                <div className="v2-sent" role="status">
                  <span className="ok" aria-hidden="true">✓</span>
                  <h3 ref={erfolg} tabIndex={-1}>Danke, wir melden uns.</h3>
                  <p>Ihre Anfrage ist angekommen. Wir melden uns persönlich bei Ihnen.</p>
                  <button type="button" className="v2-btn ghost sm" onClick={() => setStatus('bereit')}>
                    Weitere Anfrage
                  </button>
                </div>
              </div>
            ) : (
              <form className="v2-form" name="kontakt" onSubmit={senden} noValidate aria-busy={status === 'sendet'}>
                <input type="hidden" name="form-name" value="kontakt" />
                <p className="qb-hp" aria-hidden="true">
                  <label>Nicht ausfüllen <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" /></label>
                </p>
                <div className="v2-field">
                  <label htmlFor="k-name">Ihr Name</label>
                  <input type="text" autoComplete="name" required placeholder="Vor- und Nachname" {...feldProps('name')} />
                  {versucht && fehler.name && <small className="fehler" id="k-name-fehler">{fehler.name}</small>}
                </div>
                <div className="v2-field">
                  <label htmlFor="k-email">E-Mail</label>
                  <input type="email" autoComplete="email" inputMode="email" required placeholder="ihre@email.de" {...feldProps('email')} />
                  {versucht && fehler.email && <small className="fehler" id="k-email-fehler">{fehler.email}</small>}
                </div>
                <div className="v2-field">
                  <label htmlFor="k-nachricht">Nachricht</label>
                  <textarea rows={4} required placeholder="Kurz zu Ihrem Objekt und Anliegen" {...feldProps('nachricht')} />
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
                  {status === 'sendet' ? 'Wird gesendet …' : status === 'fehler' ? 'Erneut senden' : 'Unverbindlich anfragen'}
                  {status !== 'sendet' && <Arrow />}
                </button>
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
