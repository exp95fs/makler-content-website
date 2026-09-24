import { useEffect, useMemo, useRef, useState } from 'react';
import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { fotoklassen, ergaenzungen, kontakt, preis, preisStern, preishinweis } from '../../content/site.js';

/**
 * Buchungsworkflow für genau ein Objekt.
 *
 * Bewusst reduziert: keine Mehrfachobjekt-Auswahl, keine Rabattlogik, keine
 * Videopakete. Buchbar sind die drei Fotoklassen und zwei Ergänzungen.
 * Größere und besondere Objekte laufen nicht über den Workflow, sondern
 * über die Preissektion und das Kontaktformular.
 * Alles Weitere wird im Abstimmungstermin geklärt, nicht hier
 * durchkonfiguriert.
 *
 * Die Ergänzungen tragen wie auf der Live-Seite einen Infobutton: ein
 * kleines Fragezeichen, das die Erklärung bei Hover, Fokus oder Klick
 * einblendet.
 */
const SCHRITTE = ['Objekt', 'Ergänzung', 'Termin', 'Kontakt', 'Prüfen', 'Fertig'];
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

const klasseVon = (key) => fotoklassen.find((k) => k.key === key) || null;

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const leererKontakt = { vorname: '', nachname: '', email: '', telefon: '', firma: '', adresse: '', nachricht: '' };
const encodeForm = (d) => Object.keys(d).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(d[k])).join('&');

export function Booking() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [klasse, setKlasse] = useState('');
  const [addons, setAddons] = useState({});
  const [slot, setSlot] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [offenerTag, setOffenerTag] = useState(null);
  const [kontaktDaten, setKontaktDaten] = useState(leererKontakt);
  const [agb, setAgb] = useState(false);

  const gewaehlt = klasseVon(klasse);

  const dauer = useMemo(() => {
    if (!gewaehlt) return 0;
    return (gewaehlt.stunden || 0)
      + ergaenzungen.reduce((h, e) => h + (addons[e.key] ? e.stunden : 0), 0);
  }, [gewaehlt, addons]);

  const rechnung = useMemo(() => {
    if (!gewaehlt) return { zeilen: [], summe: 0 };
    const zeilen = [{ name: `Fotografie · ${gewaehlt.name}`, betrag: gewaehlt.foto }];
    ergaenzungen.forEach((e) => {
      if (addons[e.key]) zeilen.push({ name: e.name, betrag: e.preis });
    });
    return { zeilen, summe: zeilen.reduce((s, z) => s + (z.betrag || 0), 0) };
  }, [gewaehlt, addons]);

  const gewaehlteErgaenzungen = ergaenzungen.filter((e) => addons[e.key]);

  const terminReset = () => { setSlot(null); setFallback(false); setOffenerTag(null); };

  const kontaktOk = kontaktDaten.vorname.trim() && kontaktDaten.nachname.trim()
    && emailOk(kontaktDaten.email) && kontaktDaten.adresse.trim();
  const terminOk = !!slot || fallback;

  function schrittGueltig(s) {
    if (s === 1) return !!klasse;
    if (s === 3) return terminOk;
    if (s === 4) return !!kontaktOk;
    if (s === 5) return agb;
    return true;
  }
  const weiterMoeglich = schrittGueltig(step);

  const kandidaten = useMemo(() => {
    if (dauer === 0 || dauer > MAX_FENSTER) return [];
    return produktionstage(120).filter((d) => d.fenster[1] - d.fenster[0] >= dauer).slice(0, 6);
  }, [dauer]);
  const ueberlauf = dauer > MAX_FENSTER;
  const keineTage = !ueberlauf && dauer > 0 && kandidaten.length === 0;

  useEffect(() => {
    if (step === 3 && (ueberlauf || keineTage) && !slot) setFallback(true);
  }, [step, ueberlauf, keineTage, slot]);

  function geheZu(n) { setStep(n); setMaxStep((m) => Math.max(m, n)); }
  function weiter() {
    if (step === 5) { senden(); geheZu(6); return; }
    if (step < 6 && weiterMoeglich) geheZu(step + 1);
  }
  function zurueck() { if (step > 1) geheZu(step - 1); }

  const weiterLabel = {
    1: 'Ergänzung wählen', 2: 'Termin auswählen',
    3: 'Kontaktdaten eingeben', 4: 'Angaben prüfen', 5: 'Anfrage senden',
  };

  function zusammenfassung() {
    return [
      `Objektklasse: ${gewaehlt ? gewaehlt.name : 'offen'}`,
      `Ergänzungen: ${gewaehlteErgaenzungen.length ? gewaehlteErgaenzungen.map((e) => e.name).join(', ') : 'keine'}`,
      `Wunschtermin: ${slot ? slot.label : 'Individuelle Terminanfrage (persönliche Abstimmung)'}`,
      `Preisorientierung: ${preis(rechnung.summe)} netto zzgl. USt.`,
    ].join('\n');
  }

  function senden() {
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm({
        'form-name': 'terminanfrage', 'bot-field': '',
        ...kontaktDaten,
        objektklasse: gewaehlt ? gewaehlt.name : '',
        wunschtermin: slot ? slot.label : 'Individuelle Terminanfrage',
        zusammenfassung: zusammenfassung(),
      }),
    }).catch(() => {});
  }

  return (
    <section className="v2-sec bg-ink" id="booking">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Objekt anfragen</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            In wenigen Schritten zum festen Termin.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Sie wählen die Objektklasse und einen Wunschtermin, den Rest übernehmen
            wir: Abstimmung mit dem Eigentümer, Vorbereitung, Aufnahme und
            Bearbeitung. Die Anfrage ist unverbindlich, verbindlich wird sie mit
            unserer Bestätigung.
          </p>
        </div>

        <div className="qb-cfg-book-shell" data-reveal>
          <div className="qb-cfg-book-main">
            <div className="qb-cfg-stepper">
              {SCHRITTE.map((label, i) => {
                const s = i + 1;
                const gesperrt = s > maxStep;
                return (
                  <button key={label} type="button" disabled={gesperrt}
                          className={`qb-cfg-stepchip ${s === step ? 'is-active' : ''} ${s < step ? 'is-done' : ''}`}
                          onClick={() => { if (!gesperrt && s !== step) geheZu(s); }}>
                    <span className="in">
                      <span className="s">Schritt {s}</span>
                      <span className="l">{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="qb-cfg-book-panel">
              {step === 1 && (
                <Panel titel="Um welches Objekt geht es?"
                       text="Die Klasse bestimmt den Festpreis. Die Qualität der Aufnahmen und der Bearbeitung ist in jeder Klasse dieselbe.">
                  <div className="qb-cfg-book-group">
                    {fotoklassen.map((k) => (
                      <Wahl key={k.key} an={klasse === k.key} name={k.name}
                            preisText={preisStern(k.foto)} text={k.beschreibung}
                            onClick={() => { setKlasse(k.key); terminReset(); }} />
                    ))}
                  </div>
                  {!klasse && <p className="qb-cfg-book-hint">Bitte wählen Sie eine Objektklasse, um fortzufahren.</p>}
                </Panel>
              )}

              {step === 2 && (
                <Panel titel="Möchten Sie etwas ergänzen?"
                       text="Optional und im selben Termin produziert. Weitere Ergänzungen wie ein Objektfilm stimmen wir im Gespräch auf das Objekt ab.">
                  {ergaenzungen.map((e) => (
                    <Haken key={e.key} an={!!addons[e.key]} name={e.name}
                           preisText={e.preisLabel}
                           note={e.note}
                           onClick={() => {
                             setAddons((a) => ({ ...a, [e.key]: !a[e.key] }));
                             terminReset();
                           }} />
                  ))}
                  <p className="qb-cfg-book-note">
                    Nichts davon ist Pflicht. Was für Ihr Objekt wirklich sinnvoll ist,
                    besprechen wir vor der Produktion.
                  </p>
                </Panel>
              )}

              {step === 3 && (
                <Panel titel="Wann passt es Ihnen?"
                       text="Wir planen ausreichend Zeit für eine reibungslose Produktion ein.">
                  <p className="qb-cfg-book-note"><b>Voraussichtliche Produktionszeit:</b> ca. {dauer} Std.</p>
                  {(ueberlauf || keineTage) ? (
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
                                    aria-expanded={offen} onClick={() => setOffenerTag(offen ? null : d.key)}>
                              <span className="in">
                                <span className="d">{datumLabel(d.date)}</span>
                                <span className="qb-cfg-daybadge">{d.fenster[0]}–{d.fenster[1]} Uhr</span>
                              </span>
                            </button>
                            {offen && (
                              <div className="qb-cfg-slots">
                                {zeitfenster(d, dauer).map((z) => (
                                  <button key={z.start} type="button"
                                          className={`qb-cfg-slot ${slot && slot.key === d.key && slot.timeLabel === z.label ? 'is-on' : ''}`}
                                          onClick={() => { setSlot({ key: d.key, timeLabel: z.label, label: `${datumLabel(d.date)}, ${z.label}` }); setFallback(false); }}>
                                    {z.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <button type="button" className={`qb-cfg-choice wide ${fallback ? 'is-on' : ''}`}
                          onClick={() => { setFallback(true); setSlot(null); }}>
                    <span className="t">Individuelle Terminanfrage</span>
                    <span className="p">Kein passender Tag dabei? Wir stimmen den Termin persönlich mit Ihnen ab.</span>
                  </button>
                  {!terminOk && <p className="qb-cfg-book-hint">Bitte wählen Sie einen Termin oder die individuelle Terminanfrage.</p>}
                </Panel>
              )}

              {step === 4 && (
                <Panel titel="Ihre Kontaktdaten" text="Damit wir Ihre Anfrage zuordnen und bestätigen können.">
                  <div className="qb-cfg-book-grid">
                    <Feld label="Vorname *" wert={kontaktDaten.vorname} set={(v) => setKontaktDaten((c) => ({ ...c, vorname: v }))} />
                    <Feld label="Nachname *" wert={kontaktDaten.nachname} set={(v) => setKontaktDaten((c) => ({ ...c, nachname: v }))} />
                    <Feld label="E-Mail *" typ="email" wert={kontaktDaten.email} set={(v) => setKontaktDaten((c) => ({ ...c, email: v }))} />
                    <Feld label="Telefon" typ="tel" wert={kontaktDaten.telefon} set={(v) => setKontaktDaten((c) => ({ ...c, telefon: v }))} />
                    <Feld label="Firma / Maklerbüro" breit wert={kontaktDaten.firma} set={(v) => setKontaktDaten((c) => ({ ...c, firma: v }))} />
                    <Feld label="Objektadresse *" breit platzhalter="Straße, PLZ, Ort"
                          wert={kontaktDaten.adresse} set={(v) => setKontaktDaten((c) => ({ ...c, adresse: v }))} />
                    <Feld label="Kontakt zum Eigentümer" breit
                          platzhalter="Name und Telefonnummer, damit wir den Termin direkt abstimmen können"
                          wert={kontaktDaten.nachricht} set={(v) => setKontaktDaten((c) => ({ ...c, nachricht: v }))} />
                  </div>
                  {!kontaktOk && <p className="qb-cfg-book-hint">Bitte füllen Sie mindestens die mit * markierten Felder korrekt aus.</p>}
                </Panel>
              )}

              {step === 5 && (
                <Panel titel="Angaben prüfen und senden"
                       text="Die Anfrage ist unverbindlich, verbindlich wird sie mit unserer Bestätigung.">
                  <div className="qb-cfg-recap">
                    <Zeile label="Objektklasse" wert={gewaehlt ? gewaehlt.name : 'offen'} />
                    <Zeile label="Ergänzungen" wert={gewaehlteErgaenzungen.length ? gewaehlteErgaenzungen.map((e) => e.name).join(', ') : '–'} />
                    <Zeile label="Wunschtermin" wert={slot ? slot.label : 'Individuelle Terminanfrage'} />
                    <Zeile label="Kontakt" wert={`${kontaktDaten.vorname} ${kontaktDaten.nachname} · ${kontaktDaten.email}`} />
                    <Zeile label="Objektadresse" wert={kontaktDaten.adresse} />
                    <Zeile label="Festpreis" wert={preisStern(rechnung.summe)} />
                  </div>
                  <button type="button" className={`qb-cfg-choice wide ${agb ? 'is-on' : ''}`} onClick={() => setAgb((v) => !v)}>
                    <span className="p">
                      Ich handle als Unternehmer im Sinne des § 14 BGB und bestätige die
                      Allgemeinen Geschäftsbedingungen von Quadratblick, insbesondere die
                      Abrechnung nach Umsetzung sowie die Storno- und Widerrufsregelung.
                    </span>
                  </button>
                  {!agb && <p className="qb-cfg-book-hint">Bitte bestätigen Sie die Angaben, um die Anfrage zu senden.</p>}
                </Panel>
              )}

              {step === 6 && (
                <div className="qb-cfg-sent">
                  <span className="ok" aria-hidden="true">✓</span>
                  <h3>Anfrage gesendet</h3>
                  <p>
                    Vielen Dank. Wir melden uns in der Regel innerhalb von 1 bis 2 Werktagen
                    persönlich mit der Bestätigung, dem Festpreis und dem Liefertermin. Die
                    Abstimmung mit dem Eigentümer übernehmen wir.
                  </p>
                </div>
              )}

              {step !== 6 && (
                <div className="qb-cfg-book-nav">
                  <button type="button" className="v2-btn ghost on-dark sm" onClick={zurueck}
                          style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>
                    Zurück
                  </button>
                  <Magnetic strength={0.2}>
                    <button type="button" className="v2-btn" onClick={weiter} disabled={!weiterMoeglich}>
                      {weiterLabel[step] || 'Weiter'} <Arrow size={16} />
                    </button>
                  </Magnetic>
                </div>
              )}
            </div>
          </div>

          <aside className="qb-cfg-book-summary">
            <h3>Ihre Auswahl</h3>
            {rechnung.zeilen.length === 0 ? (
              <p className="leer">Noch nichts gewählt. Ihre Auswahl erscheint hier, sobald Sie eine Objektklasse wählen.</p>
            ) : (
              rechnung.zeilen.map((z) => (
                <div className="row" key={z.name}>
                  <span>{z.name}</span>
                  <b>{z.betrag === null ? z.hinweis : preis(z.betrag)}</b>
                </div>
              ))
            )}
            <div className="gesamt">
              <span>Festpreis</span>
              {/* Ohne gewählte Klasse stünde hier sonst "0 €". */}
              <b>{rechnung.zeilen.length ? preisStern(rechnung.summe) : '–'}</b>
            </div>
            {dauer > 0 && (
              <div className="hinweis">
                {slot ? <><b>Wunschtermin</b><br />{slot.label}</>
                  : fallback ? <><b>Individuelle Terminanfrage</b><br />Termin wird persönlich abgestimmt.</>
                    : <><b>Voraussichtliche Produktionszeit:</b> ca. {dauer} Std. · Termin noch offen</>}
              </div>
            )}
            <p className="fuss">
              {preishinweis} Der Preis steht mit unserer Bestätigung fest.
              Fragen vorab? {kontakt.telefon}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------- Bausteine ---------- */
function Panel({ titel, text, children }) {
  return (
    <div>
      <h3 className="qb-cfg-book-h">{titel}</h3>
      {text && <p className="qb-cfg-book-desc">{text}</p>}
      {children}
    </div>
  );
}

function Wahl({ an, name, preisText, text, onClick }) {
  return (
    <button type="button" className={`qb-cfg-choice line ${an ? 'is-on' : ''}`} onClick={onClick}>
      <span className="t">{name}</span>
      <span className="pr">{preisText}</span>
      <span className="p">{text}</span>
    </button>
  );
}

/**
 * Infobutton wie auf der Live-Seite: ein Fragezeichen neben dem Namen, das
 * die Erklärung einblendet. Öffnet bei Hover, Fokus und Klick, schließt bei
 * Klick daneben, mit Escape oder wenn der Zeiger die Fläche verlässt.
 *
 * Der Klick öffnet nur, er schaltet nicht um: ein Tap löst auf vielen
 * Geräten zuerst ein mouseenter aus, ein Umschalten würde die Blase damit
 * sofort wieder schließen.
 *
 * Der Button liegt bewusst nicht im Haken-Button verschachtelt - ein
 * <button> in einem <button> ist ungültiges Markup. Haken und Infobutton
 * stehen deshalb nebeneinander in einer Zeile.
 */
function InfoButton({ note, label }) {
  const [offen, setOffen] = useState(false);
  const huelle = useRef(null);

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

  if (!note) return null;
  return (
    <span className="qb-cfg-info" ref={huelle}
          onMouseEnter={() => setOffen(true)} onMouseLeave={() => setOffen(false)}>
      <button type="button" className="qb-cfg-info-btn"
              aria-expanded={offen}
              aria-label={`Erklärung zu ${label}`}
              onFocus={() => setOffen(true)}
              onBlur={() => setOffen(false)}
              onClick={(e) => { e.stopPropagation(); setOffen(true); }}>?</button>
      {offen && <span className="qb-cfg-info-bubble" role="tooltip">{note}</span>}
    </span>
  );
}

function Haken({ an, name, preisText, note, onClick }) {
  return (
    <div className={`qb-cfg-checkbox ${an ? 'is-on' : ''}`}>
      <button type="button" className="hit" onClick={onClick} aria-pressed={an}>
        <span className="bx" aria-hidden="true">{an ? '✓' : ''}</span>
        <span className="t">{name}</span>
        <span className="pr">{preisText}</span>
      </button>
      <InfoButton note={note} label={name} />
    </div>
  );
}

function Feld({ label, wert, set, typ = 'text', breit = false, platzhalter = '' }) {
  return (
    <label className={`qb-cfg-book-field ${breit ? 'breit' : ''}`}>
      <span>{label}</span>
      <input type={typ} value={wert} placeholder={platzhalter} onChange={(e) => set(e.target.value)} />
    </label>
  );
}

function Zeile({ label, wert }) {
  return <div className="row"><span>{label}</span><b>{wert}</b></div>;
}
