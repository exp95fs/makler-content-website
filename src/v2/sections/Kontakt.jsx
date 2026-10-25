import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { Arrow, InstagramGlyph } from '../ui.jsx';
import { track } from '../tracking.js';
import { sendeFormular, emailGueltig } from '../formular.js';
import { kontakt, fotoklassen } from '../../content/site.js';

/**
 * Anfrageformular der Startseite: der eine Anfrageweg für Neukunden.
 *
 * Erfolg nur nach bestätigter Serverantwort, Fehler mit erhaltenen
 * Eingaben und erneutem Senden, kein Doppelversand. Formular- und
 * Feldnamen entsprechen dem statischen Formular "kontakt" in index.html.
 *
 * Vorauswahl: Links mit `data-klasse` (Preiskacheln) bzw. `data-anliegen`
 * (Zusammenarbeit) setzen beim Klick Objektklasse bzw. Anliegen. Der Link
 * selbst führt per Anker zu #kontakt, ohne JavaScript also ohne Vorauswahl.
 *
 * Wer mit dem alten Anker #booking kommt, landet hier (Shell.jsx und der
 * Anker unten, der auch ohne JavaScript greift).
 */
export const ANLIEGEN = [
  { key: 'einzeln', label: 'Einzelnes Objekt' },
  { key: 'regelmaessig', label: 'Regelmäßig mehrere Objekte' },
  { key: 'sonstiges', label: 'Sonstiges' },
];

export const OBJEKTKLASSEN = [
  ...fotoklassen.map((k) => ({ key: k.key, label: k.name })),
  { key: 'besonders', label: 'Größeres oder besonderes Objekt' },
  { key: 'unklar', label: 'Weiß ich noch nicht' },
];

const ERREICHBAR = ['Vormittags', 'Nachmittags', 'Egal'];

const LEER = {
  name: '', firma: '', email: '', telefon: '',
  anliegen: '', objektklasse: '', rueckruf: false, erreichbarkeit: 'Egal', nachricht: '',
};

const labelZu = (liste, key) => liste.find((x) => x.key === key)?.label || '';

export function Kontakt() {
  const [daten, setDaten] = useState(LEER);
  const [versucht, setVersucht] = useState(false);
  const [status, setStatus] = useState('bereit');
  const sendet = useRef(false);
  const erfolg = useRef(null);

  useEffect(() => { if (status === 'erfolg') erfolg.current?.focus(); }, [status]);

  // Vorauswahl aus Preiskacheln und Zusammenarbeit
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('[data-klasse], [data-anliegen]');
      if (!el) return;
      const { klasse, anliegen } = el.dataset;
      const neu = {};
      if (klasse && OBJEKTKLASSEN.some((k) => k.key === klasse)) neu.objektklasse = klasse;
      if (anliegen && ANLIEGEN.some((a) => a.key === anliegen)) neu.anliegen = anliegen;
      if (!Object.keys(neu).length) return;
      setDaten((d) => ({ ...d, ...neu }));
      setStatus((s) => (s === 'erfolg' ? 'bereit' : s));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const fehler = {
    name: daten.name.trim() ? null : 'Bitte geben Sie Ihren Namen an.',
    email: emailGueltig(daten.email) ? null : 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    anliegen: daten.anliegen ? null : 'Bitte wählen Sie Ihr Anliegen.',
  };
  const offeneFehler = Object.keys(fehler).filter((k) => fehler[k]);

  const setFeld = (feld) => (e) => {
    const wert = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDaten((d) => ({ ...d, [feld]: wert }));
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
      quelle: 'startseite',
      name: daten.name,
      firma: daten.firma,
      email: daten.email,
      telefon: daten.telefon,
      anliegen: labelZu(ANLIEGEN, daten.anliegen),
      objektklasse: labelZu(OBJEKTKLASSEN, daten.objektklasse),
      rueckruf: daten.rueckruf ? 'ja' : 'nein',
      erreichbarkeit: daten.rueckruf ? daten.erreichbarkeit : '',
      nachricht: daten.nachricht,
    });
    sendet.current = false;
    if (ergebnis.ok) {
      track('anfrage_gesendet', {
        anliegen: daten.anliegen,
        objektklasse: daten.objektklasse || 'keine',
        rueckruf: daten.rueckruf ? 'ja' : 'nein',
      });
      setDaten(LEER); setVersucht(false);
      setStatus('erfolg');
    } else {
      setStatus('fehler');
    }
  }

  const feldProps = (feld) => ({
    id: `k-${feld}`, name: feld, value: daten[feld], onChange: setFeld(feld),
    'aria-invalid': versucht && fehler[feld] ? 'true' : undefined,
    'aria-describedby': versucht && fehler[feld] ? `k-${feld}-fehler` : undefined,
  });
  const fehlerText = (feld) => versucht && fehler[feld]
    && <small className="fehler" id={`k-${feld}-fehler`}>{fehler[feld]}</small>;

  return (
    <section className="v2-sec bg-ink qb-kontakt" id="kontakt" aria-labelledby="kontakt-titel">
      {/* Früherer Anker des Konfigurators, damit alte Links hier landen */}
      <span id="booking" className="qb-alt-anker" aria-hidden="true" />
      <div className="v2-wrap">
        <div className="v2-contact">
          <div className="v2-contact-info">
            <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
            <Split as="h2" id="kontakt-titel" className="v2-h-display v2-h-lg">
              Erzählen Sie uns kurz von Ihrem Objekt.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Wir melden uns in der Regel innerhalb eines Werktags – per E-Mail oder, wenn
              Sie möchten, telefonisch.
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
                <input type="hidden" name="quelle" value="startseite" />
                <p className="qb-hp" aria-hidden="true">
                  <label>Nicht ausfüllen <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" /></label>
                </p>
                <p className="v2-form-pflicht">Pflichtfelder sind mit * markiert.</p>
                <div className="v2-field-reihe">
                  <div className="v2-field">
                    <label htmlFor="k-name">Name *</label>
                    <input type="text" autoComplete="name" required {...feldProps('name')} />
                    {fehlerText('name')}
                  </div>
                  <div className="v2-field">
                    <label htmlFor="k-firma">Firma / Büro</label>
                    <input type="text" autoComplete="organization" {...feldProps('firma')} />
                  </div>
                </div>
                <div className="v2-field-reihe">
                  <div className="v2-field">
                    <label htmlFor="k-email">E-Mail *</label>
                    <input type="email" autoComplete="email" inputMode="email" required {...feldProps('email')} />
                    {fehlerText('email')}
                  </div>
                  <div className="v2-field">
                    <label htmlFor="k-telefon">Telefon</label>
                    <input type="tel" autoComplete="tel" inputMode="tel" {...feldProps('telefon')} />
                  </div>
                </div>
                <div className="v2-field">
                  <label htmlFor="k-anliegen">Anliegen *</label>
                  <select required {...feldProps('anliegen')}>
                    <option value="" disabled>Bitte wählen</option>
                    {ANLIEGEN.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                  {fehlerText('anliegen')}
                </div>
                <div className="v2-field">
                  <label htmlFor="k-objektklasse">Objektklasse</label>
                  <select {...feldProps('objektklasse')}>
                    <option value="">Keine Angabe</option>
                    {OBJEKTKLASSEN.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                </div>
                <div className="v2-field v2-check">
                  <input type="checkbox" id="k-rueckruf" name="rueckruf" value="ja"
                         checked={daten.rueckruf} onChange={setFeld('rueckruf')} />
                  <label htmlFor="k-rueckruf">Bitte rufen Sie mich zurück</label>
                </div>
                {daten.rueckruf && (
                  <fieldset className="v2-field v2-wahl">
                    <legend>Am besten erreichbar</legend>
                    <div className="optionen">
                      {ERREICHBAR.map((z) => (
                        <label key={z}>
                          <input type="radio" name="erreichbarkeit" value={z}
                                 checked={daten.erreichbarkeit === z} onChange={setFeld('erreichbarkeit')} />
                          {z}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                <div className="v2-field">
                  <label htmlFor="k-nachricht">Nachricht</label>
                  <textarea rows={4} placeholder="Zum Beispiel: Lage, Größe, gewünschter Zeitraum" {...feldProps('nachricht')} />
                </div>
                <div aria-live="polite" role="status" className="v2-form-status">
                  {status === 'sendet' && <p>Ihre Anfrage wird gesendet …</p>}
                  {status === 'fehler' && (
                    <p className="v2-form-error">
                      Die Anfrage konnte nicht gesendet werden. Ihre Eingaben sind erhalten – bitte
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
                  Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage genutzt. Mehr dazu in der{' '}
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
