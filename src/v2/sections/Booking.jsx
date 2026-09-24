import { useEffect, useMemo, useRef, useState } from 'react';
import { Arrow } from '../ui.jsx';
import { track } from '../tracking.js';
import { sendeFormular, emailGueltig } from '../formular.js';
import { fotoklassen, ergaenzungen, weitereMedien, kontakt, preis, preisNetto, preishinweis } from '../../content/site.js';

/**
 * Anfrage-Wizard für genau ein Objekt.
 *
 * Wichtig für den Versand:
 * - Die Erfolgsmeldung erscheint NUR, wenn Netlify den POST erfolgreich
 *   beantwortet (response.ok). Das Erreichen des letzten Schritts löst sie
 *   nicht aus.
 * - Während des Versands ist der Button gesperrt, ein zweiter Versand ist
 *   ausgeschlossen. Bei Fehlern bleiben alle Eingaben erhalten und der
 *   Versand kann wiederholt werden. Zurückgesetzt wird erst nach Erfolg.
 * - Formularname und Feldnamen stimmen mit dem statischen Formular
 *   "terminanfrage" in index.html überein.
 *
 * Die Anfrage ist unverbindlich. Termin, Umfang und Preis bestätigt
 * Quadratblick persönlich; es gibt keine Sofortbuchung.
 */
const SCHRITTE = ['Objekt', 'Zusatzleistung', 'Wunschtermin', 'Kontakt', 'Prüfen'];
const MIN_VORLAUF_TAGE = 3;
const MAX_FENSTER = 8;
const WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONAT = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

const pad2 = (n) => String(n).padStart(2, '0');
const tagKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const datumLabel = (d) => `${WOCHENTAG[d.getDay()]}, ${d.getDate()}. ${MONAT[d.getMonth()]}`;
const zeitLabel = (min) => `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;

function isoWoche(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const wt = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - wt + 3);
  return 1 + Math.round((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 4))) / 86400000 / 7);
}
const dritterSamstag = (d) => d.getDay() === 6 && d.getDate() >= 15 && d.getDate() <= 21;

/** Mögliche Produktionstage, wie auf der bisherigen Seite. Nur Vorschläge. */
function produktionstage(maxTage) {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const liste = [];
  for (let i = MIN_VORLAUF_TAGE; i <= maxTage; i += 1) {
    const d = new Date(heute);
    d.setDate(d.getDate() + i);
    const wt = d.getDay();
    const wk = isoWoche(d);
    if (wt === 1 && wk % 2 === 0) liste.push({ date: d, key: tagKey(d), fenster: [9, 17] });
    else if (wt === 5 && wk % 2 === 1) liste.push({ date: d, key: tagKey(d), fenster: [9, 17] });
    else if (dritterSamstag(d)) liste.push({ date: d, key: tagKey(d), fenster: [9, 14] });
  }
  return liste;
}
function zeitfenster(tag, dauer) {
  const slots = [];
  for (let t = tag.fenster[0] * 60; t + dauer * 60 <= tag.fenster[1] * 60; t += 30) {
    slots.push({ start: t, label: `${zeitLabel(t)}–${zeitLabel(t + dauer * 60)} Uhr` });
  }
  return slots;
}

const LEER = {
  vorname: '', nachname: '', email: '', telefon: '', firma: '',
  adresse: '', eigentuemer: '', nachricht: '',
};
const PFLICHT = {
  vorname: 'Bitte geben Sie Ihren Vornamen an.',
  nachname: 'Bitte geben Sie Ihren Nachnamen an.',
  email: 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  adresse: 'Bitte geben Sie die Adresse des Objekts an.',
};

export function Booking() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [klasse, setKlasse] = useState('');
  const [addons, setAddons] = useState({});
  const [slot, setSlot] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [offenerTag, setOffenerTag] = useState(null);
  const [daten, setDaten] = useState(LEER);
  const [unternehmer, setUnternehmer] = useState(false);
  const [versucht, setVersucht] = useState({});
  const [status, setStatus] = useState('bereit'); // bereit | sendet | erfolg | fehler
  const [kandidaten, setKandidaten] = useState([]);
  const sendet = useRef(false);
  const gestartet = useRef(false);
  const titel = useRef(null);
  const erfolg = useRef(null);
  const erstesSchrittRendern = useRef(true);

  const gewaehlt = fotoklassen.find((k) => k.key === klasse) || null;
  const gewaehlteZusatz = ergaenzungen.filter((e) => addons[e.key]);

  const dauer = useMemo(() => {
    if (!gewaehlt) return 0;
    return gewaehlt.stunden + gewaehlteZusatz.reduce((h, e) => h + e.stunden, 0);
  }, [gewaehlt, gewaehlteZusatz]);

  const summe = gewaehlt ? gewaehlt.foto + gewaehlteZusatz.reduce((s, e) => s + e.preis, 0) : 0;

  // Terminvorschläge erst im Browser berechnen: sie hängen vom heutigen
  // Datum ab und würden sonst vom vorgerenderten HTML abweichen.
  useEffect(() => {
    if (dauer === 0 || dauer > MAX_FENSTER) { setKandidaten([]); return; }
    setKandidaten(produktionstage(120).filter((d) => d.fenster[1] - d.fenster[0] >= dauer).slice(0, 6));
  }, [dauer]);
  const persoenlich = dauer > MAX_FENSTER || (dauer > 0 && kandidaten.length === 0);

  useEffect(() => {
    if (step === 3 && persoenlich && !slot) setFallback(true);
  }, [step, persoenlich, slot]);

  // Nach jedem Schrittwechsel den Fokus auf die Schrittüberschrift setzen,
  // damit Screenreader den neuen Inhalt ansagen.
  useEffect(() => {
    if (erstesSchrittRendern.current) { erstesSchrittRendern.current = false; return; }
    titel.current?.focus();
  }, [step]);

  useEffect(() => {
    if (status === 'erfolg') erfolg.current?.focus();
  }, [status]);

  const starten = () => {
    if (gestartet.current) return;
    gestartet.current = true;
    track('formular_start', { formular: 'terminanfrage' });
  };

  const terminReset = () => { setSlot(null); setFallback(false); setOffenerTag(null); };

  const fehlerFeld = (feld) => {
    if (!PFLICHT[feld]) return null;
    if (feld === 'email') return emailGueltig(daten.email) ? null : PFLICHT.email;
    return daten[feld].trim() ? null : PFLICHT[feld];
  };
  const kontaktFehler = Object.keys(PFLICHT).filter((f) => fehlerFeld(f));

  function gueltig(s) {
    if (s === 1) return !!klasse;
    if (s === 3) return !!slot || fallback;
    if (s === 4) return kontaktFehler.length === 0;
    return true;
  }

  function geheZu(n) {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    track('formular_schritt', { formular: 'terminanfrage', schritt: n });
  }

  function weiter() {
    if (!gueltig(step)) {
      setVersucht((v) => ({ ...v, [step]: true }));
      if (step === 4) {
        const erstes = kontaktFehler[0];
        document.getElementById(`wz-${erstes}`)?.focus();
      }
      return;
    }
    geheZu(step + 1);
  }

  function zusammenfassung() {
    return [
      `Objektklasse: ${gewaehlt ? gewaehlt.name : 'offen'}`,
      `Zusatzleistung: ${gewaehlteZusatz.length ? gewaehlteZusatz.map((e) => e.name).join(', ') : 'keine'}`,
      `Wunschtermin: ${slot ? slot.label : 'Individuelle Terminabstimmung'}`,
      `Preisorientierung: ${preis(summe)} netto zzgl. USt.`,
    ].join('\n');
  }

  async function senden(e) {
    e.preventDefault();
    if (step !== 5) return;
    if (!unternehmer) { setVersucht((v) => ({ ...v, 5: true })); return; }
    if (sendet.current) return;
    sendet.current = true;
    setStatus('sendet');

    const ergebnis = await sendeFormular({
      'form-name': 'terminanfrage',
      'bot-field': e.target.elements['bot-field']?.value || '',
      objektklasse: gewaehlt ? gewaehlt.name : '',
      zusatzleistung: gewaehlteZusatz.map((z) => z.name).join(', ') || 'keine',
      wunschtermin: slot ? slot.label : 'Individuelle Terminabstimmung',
      ...daten,
      unternehmer: unternehmer ? 'ja' : 'nein',
      zusammenfassung: zusammenfassung(),
    });

    sendet.current = false;
    if (ergebnis.ok) {
      track('formular_erfolg', { formular: 'terminanfrage' });
      setStatus('erfolg');
      // Erst jetzt zurücksetzen
      setKlasse(''); setAddons({}); terminReset(); setDaten(LEER);
      setUnternehmer(false); setVersucht({}); setStep(1); setMaxStep(1);
      gestartet.current = false;
    } else {
      track('formular_fehler', { formular: 'terminanfrage', grund: ergebnis.grund });
      setStatus('fehler');
    }
  }

  const setFeld = (feld) => (e) => { starten(); setDaten((d) => ({ ...d, [feld]: e.target.value })); };

  if (status === 'erfolg') {
    return (
      <section className="v2-sec bg-ink qb-wizard" id="wizard" aria-label="Projektanfrage">
        <div className="v2-wrap">
          <div className="qb-cfg-sent" role="status">
            <span className="ok" aria-hidden="true">✓</span>
            <h2 ref={erfolg} tabIndex={-1}>Vielen Dank – Ihre Anfrage ist eingegangen.</h2>
            <p>Wir prüfen die Angaben und melden uns persönlich bei Ihnen.</p>
            <button type="button" className="v2-btn ghost on-dark sm" onClick={() => setStatus('bereit')}>
              Weiteres Objekt anfragen
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="v2-sec bg-ink qb-wizard" id="wizard" aria-label="Projektanfrage">
      <div className="v2-wrap">
        <div className="qb-cfg-book-shell">
          <div className="qb-cfg-book-main">
            <ol className="qb-cfg-stepper" aria-label="Schritte der Anfrage">
              {SCHRITTE.map((label, i) => {
                const s = i + 1;
                const gesperrt = s > maxStep || status === 'sendet';
                return (
                  <li key={label}>
                    <button type="button" disabled={gesperrt}
                            className={`qb-cfg-stepchip ${s === step ? 'is-active' : ''} ${s < step ? 'is-done' : ''}`}
                            aria-current={s === step ? 'step' : undefined}
                            onClick={() => { if (!gesperrt && s !== step) geheZu(s); }}>
                      <span className="in">
                        <span className="s">Schritt {s}</span>
                        <span className="l">{label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <form className="qb-cfg-book-panel" name="terminanfrage" onSubmit={senden} noValidate
                  aria-busy={status === 'sendet'}>
              <input type="hidden" name="form-name" value="terminanfrage" />
              <p className="qb-hp" aria-hidden="true">
                <label>Nicht ausfüllen <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" /></label>
              </p>

              {step === 1 && (
                <fieldset className="qb-schritt">
                  <legend className="qb-cfg-book-h" ref={titel} tabIndex={-1}>Um welches Objekt geht es?</legend>
                  <p className="qb-cfg-book-desc">
                    Die Objektklasse bestimmt Preis und Bildumfang. Aufnahme und Bearbeitung sind in
                    jeder Klasse gleich.
                  </p>
                  <div className="qb-cfg-book-group">
                    {fotoklassen.map((k) => (
                      <label key={k.key} className={`qb-cfg-choice line ${klasse === k.key ? 'is-on' : ''}`}>
                        <input type="radio" name="objektklasse-wahl" value={k.key} className="qb-sr"
                               checked={klasse === k.key}
                               onChange={() => { starten(); setKlasse(k.key); terminReset(); }} />
                        <span className="t">{k.name}</span>
                        <span className="pr">{preisNetto(k.foto)}</span>
                        <span className="p">{k.beschreibung} {k.bilder}.</span>
                      </label>
                    ))}
                  </div>
                  {versucht[1] && !klasse && (
                    <p className="qb-cfg-book-hint" role="alert">Bitte wählen Sie eine Objektklasse.</p>
                  )}
                </fieldset>
              )}

              {step === 2 && (
                <fieldset className="qb-schritt">
                  <legend className="qb-cfg-book-h" ref={titel} tabIndex={-1}>Möchten Sie etwas ergänzen?</legend>
                  <p className="qb-cfg-book-desc">Optional und im selben Termin.</p>
                  {ergaenzungen.map((e) => (
                    <Haken key={e.key} id={`wz-${e.key}`} an={!!addons[e.key]} name={e.name}
                           preisText={`+ ${preisNetto(e.preis)}`} note={e.note}
                           umschalten={() => { setAddons((a) => ({ ...a, [e.key]: !a[e.key] })); terminReset(); }} />
                  ))}
                  <p className="qb-cfg-book-note">{weitereMedien}</p>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset className="qb-schritt">
                  <legend className="qb-cfg-book-h" ref={titel} tabIndex={-1}>Welcher Termin wäre Ihnen recht?</legend>
                  <p className="qb-cfg-book-desc">
                    Ihr Terminwunsch ist unverbindlich. Den Termin bestätigen wir persönlich.
                  </p>
                  {persoenlich ? (
                    <div className="qb-cfg-warnbox">
                      <b>Persönliche Terminabstimmung</b>
                      <p>Für diesen Umfang stimmen wir den Termin persönlich mit Ihnen ab. Sie können die Anfrage fortsetzen.</p>
                    </div>
                  ) : (
                    <div className="qb-cfg-dayrows">
                      {kandidaten.map((d) => {
                        const offen = offenerTag === d.key;
                        return (
                          <div className="qb-cfg-dayrow" key={d.key}>
                            <button type="button" className={`qb-cfg-daybtn ${slot && slot.key === d.key ? 'is-on' : ''}`}
                                    aria-expanded={offen} aria-controls={`slots-${d.key}`}
                                    onClick={() => setOffenerTag(offen ? null : d.key)}>
                              <span className="in">
                                <span className="d">{datumLabel(d.date)}</span>
                                <span className="qb-cfg-daybadge">{d.fenster[0]}–{d.fenster[1]} Uhr</span>
                              </span>
                            </button>
                            {offen && (
                              <div className="qb-cfg-slots" id={`slots-${d.key}`} role="group" aria-label={`Zeitfenster am ${datumLabel(d.date)}`}>
                                {zeitfenster(d, dauer).map((z) => {
                                  const an = !!slot && slot.key === d.key && slot.timeLabel === z.label;
                                  return (
                                    <button key={z.start} type="button" aria-pressed={an}
                                            className={`qb-cfg-slot ${an ? 'is-on' : ''}`}
                                            onClick={() => { setSlot({ key: d.key, timeLabel: z.label, label: `${datumLabel(d.date)}, ${z.label}` }); setFallback(false); }}>
                                      {z.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button type="button" aria-pressed={fallback}
                          className={`qb-cfg-choice wide ${fallback ? 'is-on' : ''}`}
                          onClick={() => { setFallback(true); setSlot(null); }}>
                    <span className="t">Individuelle Terminabstimmung</span>
                    <span className="p">Kein passender Tag dabei? Wir stimmen den Termin persönlich mit Ihnen ab.</span>
                  </button>
                  {versucht[3] && !slot && !fallback && (
                    <p className="qb-cfg-book-hint" role="alert">Bitte wählen Sie einen Terminwunsch oder die individuelle Abstimmung.</p>
                  )}
                  {slot && <p className="qb-cfg-book-note" aria-live="polite"><b>Ihr Terminwunsch:</b> {slot.label}</p>}
                </fieldset>
              )}

              {step === 4 && (
                <fieldset className="qb-schritt">
                  <legend className="qb-cfg-book-h" ref={titel} tabIndex={-1}>Ihre Kontaktdaten</legend>
                  <p className="qb-cfg-book-desc">Pflichtfelder sind mit * markiert.</p>
                  <div className="qb-cfg-book-grid">
                    <Feld id="vorname" label="Vorname *" wert={daten.vorname} onChange={setFeld('vorname')}
                          auto="given-name" pflicht fehler={versucht[4] && fehlerFeld('vorname')} />
                    <Feld id="nachname" label="Nachname *" wert={daten.nachname} onChange={setFeld('nachname')}
                          auto="family-name" pflicht fehler={versucht[4] && fehlerFeld('nachname')} />
                    <Feld id="email" label="E-Mail *" typ="email" wert={daten.email} onChange={setFeld('email')}
                          auto="email" inputMode="email" pflicht fehler={versucht[4] && fehlerFeld('email')} />
                    <Feld id="telefon" label="Telefon (optional)" typ="tel" wert={daten.telefon}
                          onChange={setFeld('telefon')} auto="tel" inputMode="tel" />
                    <Feld id="firma" label="Maklerbüro / Unternehmen (optional)" breit wert={daten.firma}
                          onChange={setFeld('firma')} auto="organization" />
                    <Feld id="adresse" label="Adresse des Objekts *" breit wert={daten.adresse}
                          onChange={setFeld('adresse')} auto="off" platzhalter="Straße, PLZ, Ort"
                          pflicht fehler={versucht[4] && fehlerFeld('adresse')} />
                    <Feld id="eigentuemer" label="Kontakt zum Eigentümer (optional)" breit wert={daten.eigentuemer}
                          onChange={setFeld('eigentuemer')} auto="off"
                          hinweis="Nur angeben, wenn wir den Termin direkt mit dem Eigentümer abstimmen sollen." />
                    <Feld id="nachricht" label="Nachricht (optional)" breit mehrzeilig wert={daten.nachricht}
                          onChange={setFeld('nachricht')} />
                  </div>
                </fieldset>
              )}

              {step === 5 && (
                <fieldset className="qb-schritt">
                  <legend className="qb-cfg-book-h" ref={titel} tabIndex={-1}>Angaben prüfen und senden</legend>
                  <p className="qb-cfg-book-desc">
                    Die Anfrage ist unverbindlich. Verbindlich wird sie erst mit unserer persönlichen
                    Bestätigung zu Termin, Leistungsumfang und Preis.
                  </p>
                  <dl className="qb-cfg-recap">
                    <Zeile label="Objektklasse" wert={gewaehlt ? gewaehlt.name : 'offen'} />
                    <Zeile label="Zusatzleistung" wert={gewaehlteZusatz.length ? gewaehlteZusatz.map((z) => z.name).join(', ') : 'keine'} />
                    <Zeile label="Terminwunsch" wert={slot ? slot.label : 'Individuelle Terminabstimmung'} />
                    <Zeile label="Kontakt" wert={`${daten.vorname} ${daten.nachname} · ${daten.email}`} />
                    <Zeile label="Objektadresse" wert={daten.adresse} />
                    {daten.eigentuemer && <Zeile label="Eigentümerkontakt" wert={daten.eigentuemer} />}
                    <Zeile label="Preis" wert={preisNetto(summe)} />
                  </dl>
                  <div className={`qb-cfg-einwilligung ${versucht[5] && !unternehmer ? 'is-fehler' : ''}`}>
                    <input id="wz-unternehmer" type="checkbox" checked={unternehmer}
                           onChange={(e) => setUnternehmer(e.target.checked)}
                           aria-invalid={versucht[5] && !unternehmer ? 'true' : undefined}
                           aria-describedby={versucht[5] && !unternehmer ? 'wz-unternehmer-fehler' : undefined} />
                    <label htmlFor="wz-unternehmer">
                      Ich frage als Unternehmer im Sinne des § 14 BGB an. *
                    </label>
                  </div>
                  {versucht[5] && !unternehmer && (
                    <p className="qb-cfg-book-hint" id="wz-unternehmer-fehler" role="alert">
                      Bitte bestätigen Sie, dass Sie als Unternehmer anfragen.
                    </p>
                  )}
                  <p className="qb-cfg-book-note">
                    Informationen zur Verarbeitung Ihrer Angaben finden Sie in der{' '}
                    <a href="/datenschutz.html">Datenschutzerklärung</a>.
                  </p>
                </fieldset>
              )}

              <div className="qb-cfg-status" aria-live="polite" role="status">
                {status === 'sendet' && <p>Ihre Anfrage wird gesendet …</p>}
                {status === 'fehler' && (
                  <p className="fehler">
                    Die Anfrage konnte nicht gesendet werden. Ihre Angaben sind erhalten – bitte
                    versuchen Sie es erneut oder melden Sie sich direkt unter{' '}
                    <a href={kontakt.telefonHref}>{kontakt.telefon}</a> bzw.{' '}
                    <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>.
                  </p>
                )}
              </div>

              <div className="qb-cfg-book-nav">
                {step > 1 ? (
                  <button type="button" className="v2-btn ghost on-dark sm" disabled={status === 'sendet'}
                          onClick={() => geheZu(step - 1)}>
                    Zurück
                  </button>
                ) : <span />}
                {step < 5 ? (
                  <button type="button" className="v2-btn" onClick={weiter}>
                    Weiter <Arrow size={16} />
                  </button>
                ) : (
                  <button type="submit" className="v2-btn" disabled={status === 'sendet'}>
                    {status === 'sendet' ? 'Wird gesendet …' : status === 'fehler' ? 'Erneut senden' : 'Anfrage senden'}
                    {status !== 'sendet' && <Arrow size={16} />}
                  </button>
                )}
              </div>
            </form>
          </div>

          <aside className="qb-cfg-book-summary" aria-label="Ihre Auswahl">
            <h2>Ihre Auswahl</h2>
            {!gewaehlt ? (
              <p className="leer">Ihre Auswahl erscheint hier, sobald Sie eine Objektklasse wählen.</p>
            ) : (
              <>
                <div className="row"><span>Immobilienfotografie · {gewaehlt.name}</span><b>{preis(gewaehlt.foto)}</b></div>
                {gewaehlteZusatz.map((z) => (
                  <div className="row" key={z.key}><span>{z.name}</span><b>{preis(z.preis)}</b></div>
                ))}
              </>
            )}
            <div className="gesamt">
              <span>Preis netto</span>
              <b>{gewaehlt ? preis(summe) : '–'}</b>
            </div>
            <p className="fuss">
              {preishinweis} Termin, Umfang und Preis bestätigen wir persönlich.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- Bausteine ---------- */

/**
 * Infobutton wie auf der bisherigen Seite: ein Fragezeichen neben dem Namen,
 * das die Erklärung einblendet. Öffnet bei Hover, Fokus und Klick, schließt
 * bei Klick daneben, mit Escape oder wenn der Zeiger die Fläche verlässt.
 */
function InfoButton({ note, label }) {
  const [offen, setOffen] = useState(false);
  const huelle = useRef(null);
  const id = `info-${label.replace(/\W+/g, '-').toLowerCase()}`;

  useEffect(() => {
    if (!offen) return undefined;
    const daneben = (e) => { if (huelle.current && !huelle.current.contains(e.target)) setOffen(false); };
    const taste = (e) => { if (e.key === 'Escape') setOffen(false); };
    document.addEventListener('pointerdown', daneben, true);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('pointerdown', daneben, true);
      document.removeEventListener('keydown', taste);
    };
  }, [offen]);

  return (
    <span className="qb-cfg-info" ref={huelle}
          onMouseEnter={() => setOffen(true)} onMouseLeave={() => setOffen(false)}>
      <button type="button" className="qb-cfg-info-btn"
              aria-expanded={offen} aria-controls={id}
              aria-label={`Erklärung zu ${label}`}
              onFocus={() => setOffen(true)} onBlur={() => setOffen(false)}
              onClick={(e) => { e.stopPropagation(); setOffen(true); }}>?</button>
      <span id={id} className="qb-cfg-info-bubble" role="tooltip" hidden={!offen}>{note}</span>
    </span>
  );
}

function Haken({ id, an, name, preisText, note, umschalten }) {
  return (
    <div className={`qb-cfg-checkbox ${an ? 'is-on' : ''}`}>
      <label className="hit" htmlFor={id}>
        <input id={id} type="checkbox" className="qb-sr" checked={an} onChange={umschalten} />
        <span className="bx" aria-hidden="true">{an ? '✓' : ''}</span>
        <span className="t">{name}</span>
        <span className="pr">{preisText}</span>
      </label>
      <InfoButton note={note} label={name} />
    </div>
  );
}

function Feld({ id, label, wert, onChange, typ = 'text', breit = false, platzhalter = '',
  auto, inputMode, pflicht = false, fehler = null, hinweis = null, mehrzeilig = false }) {
  const fid = `wz-${id}`;
  const beschrieben = [hinweis ? `${fid}-hinweis` : null, fehler ? `${fid}-fehler` : null].filter(Boolean).join(' ') || undefined;
  const props = {
    id: fid, name: id, value: wert, onChange, placeholder: platzhalter || undefined,
    autoComplete: auto, required: pflicht || undefined,
    'aria-invalid': fehler ? 'true' : undefined, 'aria-describedby': beschrieben,
  };
  return (
    <div className={`qb-cfg-book-field ${breit ? 'breit' : ''} ${fehler ? 'is-fehler' : ''}`}>
      <label htmlFor={fid}>{label}</label>
      {mehrzeilig ? <textarea rows={3} {...props} /> : <input type={typ} inputMode={inputMode} {...props} />}
      {hinweis && <small id={`${fid}-hinweis`}>{hinweis}</small>}
      {fehler && <small className="fehler" id={`${fid}-fehler`}>{fehler}</small>}
    </div>
  );
}

function Zeile({ label, wert }) {
  return <div className="row"><dt>{label}</dt><dd>{wert}</dd></div>;
}
