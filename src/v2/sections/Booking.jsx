import { useEffect, useMemo, useState } from 'react';
import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { objektklassen, sonderobjekt, filmarten, optionen, buendelVorteil, preis } from '../../content/site.js';

/**
 * Achtstufiger Konfigurator, Aufbau und Interaktion wie auf der Live-Seite.
 * Abweichend ist ausschließlich die Preislogik:
 *
 *  - Schritt 1 heißt "Objekte" statt "Rabatt". Statt 10 % auf die
 *    Gesamtsumme sinkt der fotografische Grundpreis je weiterem Objekt
 *    um den Bündelvorteil.
 *  - Die Objektklasse wird einmal gewählt und bestimmt Foto-, Objektfilm-
 *    und Maklerfilm-Preis. Für außergewöhnliche Objekte fließt nichts in
 *    die Summe, stattdessen erscheint der Hinweis auf individuelle Prüfung.
 *  - Express läuft auf die beschleunigten Positionen des jeweiligen
 *    Objekts, also Foto, Film und die gewählten Optionen, mit einem
 *    Mindestbetrag. Live lag der Aufschlag ohne Mindestbetrag ebenfalls
 *    auf der Objektsumme.
 */
const SCHRITTE = ['Objekte', 'Bedarf', 'Paket', 'Optionen', 'Termin', 'Kontakt', 'Prüfen', 'Fertig'];
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
  const ersterDonnerstag = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round((d - ersterDonnerstag) / 86400000 / 7);
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
  const von = tag.fenster[0] * 60;
  const bis = tag.fenster[1] * 60;
  for (let t = von; t + dauer * 60 <= bis; t += 30) {
    slots.push({ start: t, label: `${zeitLabel(t)}–${zeitLabel(t + dauer * 60)} Uhr` });
  }
  return slots;
}

/* ---------- Preis- und Dauerlogik ---------- */
const optionNach = (k) => optionen.find((o) => o.key === k);
const express = optionNach('express');
const homestaging = optionNach('homestaging');
const waehlbareOptionen = optionen.filter((o) => o.key !== 'express' && o.key !== 'homestaging');

const leeresObjekt = () => ({ klasse: 'none', foto: false, film: 'none', opt: {}, staging: 0 });
const hatKlasse = (o) => o.klasse !== 'none';
const hatFilm = (o) => o.film !== 'none';
const istSonder = (o) => o.klasse === 'sonder';

function klasseVon(o) {
  if (o.klasse === 'sonder') return sonderobjekt;
  return objektklassen.find((k) => k.key === o.klasse) || null;
}
const filmartVon = (o) => filmarten.find((f) => f.key === o.film) || null;

/** Preis einer Leistung für die gewählte Klasse. Sonderobjekte: null. */
function klassenPreis(o, feld) {
  const k = klasseVon(o);
  if (!k || istSonder(o)) return null;
  return k[feld];
}

function objektStunden(o) {
  const k = klasseVon(o);
  if (!k) return 0;
  const f = filmartVon(o);
  let h = o.foto ? (k.stunden.foto || 0) : 0;
  if (f) h = Math.max(h, k.stunden[f.key] || 0);
  waehlbareOptionen.forEach((opt) => { if (o.opt[opt.key] && opt.stunden) h += opt.stunden; });
  return h;
}

function stagingPreis(menge) {
  if (!menge) return 0;
  const satz = menge >= homestaging.staffelAb ? homestaging.jeEinheitAb : homestaging.jeEinheit;
  return menge * satz;
}

/**
 * Positionen eines Objekts. `fotoIndex` ist die laufende Nummer unter den
 * Objekten mit Fotoauftrag: ab dem zweiten greift der Bündelvorteil.
 */
function positionen(o, fotoIndex) {
  const zeilen = [];
  const k = klasseVon(o);
  if (!k) return zeilen;

  if (o.foto) {
    const p = klassenPreis(o, 'foto');
    if (p === null) zeilen.push({ name: `Fotografie · ${k.name}`, betrag: null, hinweis: sonderobjekt.preisLabel });
    else {
      const nachlass = fotoIndex > 0 ? buendelVorteil.betrag : 0;
      zeilen.push({ name: `Fotografie · ${k.name}`, betrag: p - nachlass });
    }
  }
  const f = filmartVon(o);
  if (f) {
    const p = klassenPreis(o, f.feld);
    if (p === null) zeilen.push({ name: `${f.name} · ${k.name}`, betrag: null, hinweis: sonderobjekt.preisLabel });
    else zeilen.push({ name: `${f.name} · ${k.name}`, betrag: p });
  }
  waehlbareOptionen.forEach((opt) => { if (o.opt[opt.key]) zeilen.push({ name: opt.name, betrag: opt.preis }); });
  if (o.staging > 0) {
    zeilen.push({ name: `${homestaging.name} · ${o.staging} ${o.staging === 1 ? 'Bild' : 'Bilder'}`, betrag: stagingPreis(o.staging) });
  }
  return zeilen;
}

function objektSumme(o, fotoIndex) {
  const zeilen = positionen(o, fotoIndex);
  const basis = zeilen.reduce((s, z) => s + (z.betrag || 0), 0);
  const aufschlag = o.opt.express && basis > 0
    ? Math.max(Math.round(basis * express.zuschlag), express.zuschlagMin)
    : 0;
  return { zeilen, basis, aufschlag, summe: basis + aufschlag };
}

function gesamtRechnung(objekte) {
  let fotoIndex = 0;
  const teile = objekte.map((o) => {
    const zaehlt = o.foto && hatKlasse(o) && !istSonder(o);
    const idx = zaehlt ? fotoIndex : 0;
    if (zaehlt) fotoIndex += 1;
    return objektSumme(o, idx);
  });
  const vorteil = Math.max(0, fotoIndex - 1) * buendelVorteil.betrag;
  const summe = teile.reduce((s, t) => s + t.summe, 0);
  return { teile, vorteil, summe, sonder: objekte.some((o) => istSonder(o) && (o.foto || hatFilm(o))) };
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const leererKontakt = { vorname: '', nachname: '', email: '', telefon: '', firma: '', adresse: '', nachricht: '' };

function encodeForm(data) {
  return Object.keys(data).map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k])).join('&');
}

const bedarfText = {
  foto: { title: 'Nur Fotos', desc: 'Bildstrecke fürs Inserat.' },
  video: { title: 'Nur Video', desc: 'Objektfilm oder Maklerfilm.' },
  both: { title: 'Foto & Video', desc: 'Kombiniertes Produktionspaket.' },
};

/* ============================ Komponente ============================ */
export function Booking() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [anzahl, setAnzahl] = useState(1);
  const [bedarf, setBedarf] = useState(null);
  const [objekte, setObjekte] = useState([leeresObjekt(), leeresObjekt()]);
  const [slot, setSlot] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [offenerTag, setOffenerTag] = useState(null);
  const [kontaktDaten, setKontaktDaten] = useState(leererKontakt);
  const [agb, setAgb] = useState(false);
  const [gesendet, setGesendet] = useState(false);

  const aktive = objekte.slice(0, anzahl);
  const dauer = aktive.reduce((s, o) => s + objektStunden(o), 0);
  const rechnung = useMemo(() => gesamtRechnung(aktive), [objekte, anzahl]);

  const terminReset = () => { setSlot(null); setFallback(false); setOffenerTag(null); };

  function aendere(i, mutieren) {
    setObjekte((prev) => {
      const next = prev.map((o, k) => (k === i ? { ...o, opt: { ...o.opt } } : o));
      mutieren(next[i]);
      return next;
    });
    terminReset();
  }

  function waehleBedarf(wert) {
    setBedarf(wert);
    setObjekte((prev) => prev.map((o) => {
      const n = { ...o, opt: { ...o.opt } };
      if (wert === 'video') { n.foto = false; n.staging = 0; }
      if (wert === 'foto') {
        n.film = 'none';
        ['voiceover', 'zusatzschnitt'].forEach((k) => { n.opt[k] = false; });
      }
      if (wert !== 'video') n.foto = true;
      return n;
    }));
    terminReset();
  }

  /* --- Gültigkeit je Schritt --- */
  const objektKomplett = (o) => {
    if (!hatKlasse(o)) return false;
    if (bedarf === 'foto') return o.foto;
    if (bedarf === 'video') return hatFilm(o);
    if (bedarf === 'both') return o.foto && hatFilm(o);
    return false;
  };
  const paketOk = aktive.every(objektKomplett);
  const kontaktOk = kontaktDaten.vorname.trim() && kontaktDaten.nachname.trim()
    && emailOk(kontaktDaten.email) && kontaktDaten.adresse.trim();
  const terminOk = !!slot || fallback;

  function schrittGueltig(s) {
    if (s === 2) return !!bedarf;
    if (s === 3) return paketOk;
    if (s === 5) return terminOk;
    if (s === 6) return !!kontaktOk;
    if (s === 7) return agb;
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
    if (step === 5 && (ueberlauf || keineTage) && !slot) setFallback(true);
  }, [step, ueberlauf, keineTage, slot]);

  function geheZu(n) { setStep(n); setMaxStep((m) => Math.max(m, n)); }
  function weiter() {
    if (step === 7) { senden(); geheZu(8); return; }
    if (step < 8 && weiterMoeglich) geheZu(step + 1);
  }
  function zurueck() { if (step > 1) geheZu(step - 1); }

  const weiterLabel = {
    1: 'Bedarf auswählen', 2: 'Paket auswählen', 3: 'Optionen wählen', 4: 'Termin auswählen',
    5: 'Kontaktdaten eingeben', 6: 'Angaben prüfen', 7: 'Terminanfrage senden',
  };

  function zusammenfassung() {
    const terminText = slot ? slot.label : 'Individuelle Terminanfrage (persönliche Abstimmung)';
    const teile = [`Objektanzahl: ${anzahl}`];
    aktive.forEach((o, i) => {
      const k = klasseVon(o);
      const f = filmartVon(o);
      const opts = waehlbareOptionen.filter((x) => o.opt[x.key]).map((x) => x.name);
      if (o.staging > 0) opts.push(`${homestaging.name} (${o.staging})`);
      if (o.opt.express) opts.push(express.name);
      teile.push(`Objekt ${i + 1} – Klasse: ${k ? k.name : 'offen'} · Fotografie: ${o.foto ? 'ja' : 'nein'} · Film: ${f ? f.name : 'kein Film'} · Optionen: ${opts.join(', ') || 'keine'}`);
    });
    teile.push(`Wunschtermin: ${terminText}`);
    teile.push(rechnung.sonder
      ? `Geschätzte Gesamtsumme (netto): ${rechnung.summe > 0 ? preis(rechnung.summe) : '–'} zzgl. Festpreisangebot für das größere Objekt`
      : `Geschätzte Gesamtsumme (netto): ${preis(rechnung.summe)}`);
    return teile.join('\n');
  }

  function senden() {
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeForm({
        'form-name': 'terminanfrage', 'bot-field': '',
        ...kontaktDaten,
        objektanzahl: String(anzahl),
        wunschtermin: slot ? slot.label : 'Individuelle Terminanfrage',
        zusammenfassung: zusammenfassung(),
      }),
    }).then(() => setGesendet(true)).catch(() => setGesendet(true));
  }

  return (
    <section className="v2-sec bg-ink" id="booking">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Terminanfrage</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Stellen Sie Ihr Paket zusammen und fragen Sie Ihren Wunschtermin an.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Die Anfrage ist für Sie unverbindlich. Verbindlich wird sie mit unserer Bestätigung,
            die Sie nach kurzer persönlicher Rückmeldung erhalten.
          </p>
        </div>

        <div className="qb-cfg-book-shell" data-reveal>
          <div className="qb-cfg-book-main">
            <div className="qb-cfg-stepper">
              {SCHRITTE.map((label, i) => {
                const s = i + 1;
                const gesperrt = s > maxStep;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={gesperrt}
                    className={`qb-cfg-stepchip ${s === step ? 'is-active' : ''} ${s < step ? 'is-done' : ''}`}
                    onClick={() => { if (!gesperrt && s !== step) geheZu(s); }}
                  >
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
                <Panel
                  titel="Wie viele Objekte möchten Sie anfragen?"
                  text={`Planen wir mehrere Objekte am selben Produktionstermin ein, sparen wir uns Anfahrt und Koordinationsaufwand. Für jedes weitere Objekt sinkt deshalb der fotografische Grundpreis um ${preis(buendelVorteil.betrag)}.`}
                >
                  <div className="qb-cfg-choices two">
                    {[1, 2].map((n) => (
                      <button key={n} type="button" className={`qb-cfg-choice ${anzahl === n ? 'is-on' : ''}`}
                              onClick={() => { setAnzahl(n); terminReset(); }}>
                        <span className="t">{n === 1 ? '1 Objekt' : '2 Objekte'}</span>
                        <span className="p">
                          {n === 1
                            ? 'Ein Objekt, ein Termin.'
                            : 'Zwei Objekte am selben Termin. Paket und Optionen wählen Sie für jedes Objekt einzeln.'}
                        </span>
                        {n === 2 && (
                          <span className="tagline">
                            {preis(buendelVorteil.betrag)} weniger auf den Fotopreis des zweiten Objekts
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="qb-cfg-book-note">
                    Der Vorteil gilt für den fotografischen Grundpreis, nicht für Film, Drohne,
                    Express oder sonstige Optionen.
                  </p>
                </Panel>
              )}

              {step === 2 && (
                <Panel titel="Was benötigen Sie?" text="Wählen Sie die Richtung. Die passenden Pakete zeigen wir Ihnen im nächsten Schritt.">
                  <div className="qb-cfg-choices three">
                    {['foto', 'video', 'both'].map((k) => (
                      <button key={k} type="button" className={`qb-cfg-choice center ${bedarf === k ? 'is-on' : ''}`}
                              onClick={() => waehleBedarf(k)}>
                        <span className="t">{bedarfText[k].title}</span>
                        <span className="p">{bedarfText[k].desc}</span>
                      </button>
                    ))}
                  </div>
                  {!bedarf && <p className="qb-cfg-book-hint">Bitte wählen Sie eine Option, um fortzufahren.</p>}
                </Panel>
              )}

              {step === 3 && (
                <Panel
                  titel={anzahl === 2 ? 'Stellen Sie Ihre Pakete zusammen' : 'Stellen Sie Ihr Paket zusammen'}
                  text="Wählen Sie zuerst die Objektklasse. Sie bestimmt den Preis für Foto, Objektfilm und Maklerfilm. Die Qualität ist in jeder Klasse dieselbe."
                >
                  <Spalten anzahl={anzahl} render={(i) => {
                    const o = objekte[i];
                    const k = klasseVon(o);
                    return (
                      <>
                        <div className="qb-cfg-book-group">
                          <span className="glabel">Objektklasse</span>
                          {objektklassen.map((kl) => (
                            <Wahl key={kl.key} an={o.klasse === kl.key} name={kl.name}
                                  preisText={`Foto ${preis(kl.foto)} · Video ${preis(kl.video)} · Film mit Ihnen ${preis(kl.maklerfilm)}`}
                                  text={kl.beschreibung}
                                  onClick={() => aendere(i, (x) => { x.klasse = kl.key; })} />
                          ))}
                          <Wahl an={o.klasse === 'sonder'} name={sonderobjekt.name}
                                preisText={sonderobjekt.preisLabel} text={sonderobjekt.beschreibung}
                                onClick={() => aendere(i, (x) => { x.klasse = 'sonder'; x.staging = 0; })} />
                        </div>

                        {bedarf !== 'video' && (
                          <div className="qb-cfg-book-group">
                            <span className="glabel">Fotografie</span>
                            <Wahl an={o.foto} name="Fotoproduktion"
                                  preisText={k ? (klassenPreis(o, 'foto') === null ? sonderobjekt.preisLabel : `${preis(klassenPreis(o, 'foto'))} netto`) : 'Klasse wählen'}
                                  text="Bearbeitete Aufnahmen für Exposé, Portale und Ihre Website."
                                  onClick={() => aendere(i, (x) => { x.foto = !x.foto; })} />
                          </div>
                        )}

                        {bedarf !== 'foto' && (
                          <div className="qb-cfg-book-group">
                            <span className="glabel">Film</span>
                            {filmarten.map((f) => (
                              <Wahl key={f.key} an={o.film === f.key} name={f.name}
                                    preisText={k ? (klassenPreis(o, f.feld) === null ? sonderobjekt.preisLabel : `${preis(klassenPreis(o, f.feld))} netto`) : 'Klasse wählen'}
                                    text={f.beschreibung}
                                    onClick={() => aendere(i, (x) => { x.film = x.film === f.key ? 'none' : f.key; })} />
                            ))}
                          </div>
                        )}
                      </>
                    );
                  }} />
                  {!paketOk && <p className="qb-cfg-book-hint">Bitte wählen Sie für jedes Objekt eine Klasse und die gewünschte Leistung.</p>}
                </Panel>
              )}

              {step === 4 && (
                <Panel
                  titel={anzahl === 2 ? 'Ergänzen Sie Ihre Pakete' : 'Ergänzen Sie Ihr Paket'}
                  text="Optional, nach Bedarf ergänzen, je Objekt individuell."
                >
                  <Spalten anzahl={anzahl} render={(i) => {
                    const o = objekte[i];
                    const sichtbar = waehlbareOptionen.filter((opt) => {
                      if (opt.nurMitFilm && !hatFilm(o)) return false;
                      if (opt.nurMitFoto && !o.foto) return false;
                      return true;
                    });
                    return (
                      <div className="qb-cfg-book-group">
                        {sichtbar.map((opt) => (
                          <Haken key={opt.key} an={!!o.opt[opt.key]} name={opt.name}
                                 preisText={opt.preisLabel} note={opt.note}
                                 onClick={() => aendere(i, (x) => { x.opt[opt.key] = !x.opt[opt.key]; })} />
                        ))}
                        {o.foto && !istSonder(o) && (
                          <label className="qb-cfg-book-field">
                            <span>{homestaging.name}, Anzahl Bilder</span>
                            <select value={o.staging}
                                    onChange={(e) => aendere(i, (x) => { x.staging = Number(e.target.value); })}>
                              <option value={0}>Keine</option>
                              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n} {n === 1 ? 'Bild' : 'Bilder'} · {preis(stagingPreis(n))}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                        <Haken an={!!o.opt.express} name={express.name} preisText={express.preisLabel}
                               note={express.note} onClick={() => aendere(i, (x) => { x.opt.express = !x.opt.express; })} />
                      </div>
                    );
                  }} />
                </Panel>
              )}

              {step === 5 && (
                <Panel titel="Wählen Sie Ihren Wunschtermin" text="Auf Grundlage Ihrer Auswahl planen wir ausreichend Zeit für eine hochwertige und reibungslose Produktion.">
                  <p className="qb-cfg-book-note"><b>Voraussichtliche Produktionszeit:</b> ca. {dauer} Std.</p>
                  {(ueberlauf || keineTage) ? (
                    <div className="qb-cfg-warnbox">
                      <b>{ueberlauf ? 'Persönliche Terminabstimmung erforderlich' : 'Aktuell keine Produktionstage'}</b>
                      <p>
                        {ueberlauf
                          ? `Ihre gewählte Kombination benötigt rund ${dauer} Std. und überschreitet damit die Dauer eines regulären Produktionstags. Sie können Ihre Anfrage dennoch unverbindlich fortsetzen. Gemeinsam klären wir anschließend, ob die Produktion auf zwei Termine verteilt oder als individueller Sondertermin umgesetzt wird.`
                          : 'Im gewählten Umfang steht aktuell kein regulärer Produktionstag zur Verfügung. Sie können Ihre Anfrage fortsetzen, wir stimmen den Termin persönlich ab.'}
                      </p>
                    </div>
                  ) : (
                    <div className="qb-cfg-dayrows">
                      {kandidaten.map((d) => {
                        const offen = offenerTag === d.key;
                        return (
                          <div className="qb-cfg-dayrow" key={d.key}>
                            <button type="button" className={`qb-cfg-daybtn ${slot && slot.key === d.key ? 'is-on' : ''}`}
                                    aria-expanded={offen}
                                    onClick={() => setOffenerTag(offen ? null : d.key)}>
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

              {step === 6 && (
                <Panel titel="Ihre Kontaktdaten" text="Damit wir Ihre Terminanfrage zuordnen und bestätigen können.">
                  <div className="qb-cfg-book-grid">
                    <Feld label="Vorname *" wert={kontaktDaten.vorname} set={(v) => setKontaktDaten((c) => ({ ...c, vorname: v }))} />
                    <Feld label="Nachname *" wert={kontaktDaten.nachname} set={(v) => setKontaktDaten((c) => ({ ...c, nachname: v }))} />
                    <Feld label="E-Mail *" typ="email" wert={kontaktDaten.email} set={(v) => setKontaktDaten((c) => ({ ...c, email: v }))} />
                    <Feld label="Telefon" typ="tel" wert={kontaktDaten.telefon} set={(v) => setKontaktDaten((c) => ({ ...c, telefon: v }))} />
                    <Feld label="Firma / Maklerbüro" breit wert={kontaktDaten.firma} set={(v) => setKontaktDaten((c) => ({ ...c, firma: v }))} />
                    <Feld label="Objektadresse(n) *" breit platzhalter="Straße, PLZ, Ort. Bei 2 Objekten beide angeben"
                          wert={kontaktDaten.adresse} set={(v) => setKontaktDaten((c) => ({ ...c, adresse: v }))} />
                    <Feld label="Nachricht" breit mehrzeilig platzhalter="Besonderheiten zum Objekt, Zeitwünsche, Rückfragen"
                          wert={kontaktDaten.nachricht} set={(v) => setKontaktDaten((c) => ({ ...c, nachricht: v }))} />
                  </div>
                  {!kontaktOk && <p className="qb-cfg-book-hint">Bitte füllen Sie mindestens die mit * markierten Felder korrekt aus.</p>}
                </Panel>
              )}

              {step === 7 && (
                <Panel titel="Zusammenfassung &amp; Anfrage senden" text="Bitte prüfen Sie Ihre Angaben. Die Anfrage ist unverbindlich, verbindlich wird sie mit unserer Bestätigung.">
                  <div className="qb-cfg-recap">
                    {aktive.map((o, i) => {
                      const k = klasseVon(o);
                      const f = filmartVon(o);
                      const opts = waehlbareOptionen.filter((x) => o.opt[x.key]).map((x) => x.name);
                      if (o.staging > 0) opts.push(`${homestaging.name} (${o.staging})`);
                      if (o.opt.express) opts.push(express.name);
                      return (
                        <div key={i}>
                          {anzahl === 2 && <div className="ghead">Objekt {i + 1}</div>}
                          <Zeile label="Objektklasse" wert={k ? k.name : 'offen'} />
                          <Zeile label="Fotografie" wert={o.foto ? 'ja' : 'nein'} />
                          <Zeile label="Film" wert={f ? f.name : 'kein Film'} />
                          <Zeile label="Zusatzoptionen" wert={opts.length ? opts.join(', ') : '–'} />
                        </div>
                      );
                    })}
                    <div className="ghead">Termin &amp; Kontakt</div>
                    <Zeile label="Wunschtermin" wert={slot ? slot.label : 'Individuelle Terminanfrage'} />
                    <Zeile label="Kontakt" wert={`${kontaktDaten.vorname} ${kontaktDaten.nachname} · ${kontaktDaten.email}`} />
                    <Zeile label="Objektadresse(n)" wert={kontaktDaten.adresse} />
                    <Zeile label="Geschätzte Gesamtsumme" wert={`${preis(rechnung.summe)} netto${rechnung.sonder ? ' zzgl. Festpreisangebot' : ''}`} />
                  </div>
                  <button type="button" className={`qb-cfg-choice wide ${agb ? 'is-on' : ''}`} onClick={() => setAgb((v) => !v)}>
                    <span className="p">
                      Ich bestätige die Allgemeinen Geschäftsbedingungen von Quadratblick,
                      insbesondere die Abrechnung nach Umsetzung sowie die Storno- und
                      Widerrufsregelung.
                    </span>
                  </button>
                  {!agb && <p className="qb-cfg-book-hint">Bitte bestätigen Sie die Geschäftsbedingungen, um die Anfrage zu senden.</p>}
                </Panel>
              )}

              {step === 8 && (
                <div className="qb-cfg-sent">
                  <span className="ok" aria-hidden="true">✓</span>
                  <h3>Terminanfrage gesendet</h3>
                  <p>
                    Vielen Dank. Wir prüfen Ihre Anfrage und melden uns in der Regel innerhalb von
                    1 bis 2 Werktagen persönlich mit einer verbindlichen Bestätigung Ihres Termins.
                  </p>
                  {!gesendet && <p className="qb-cfg-book-hint">Wird gesendet …</p>}
                </div>
              )}

              {step !== 8 && (
                <div className="qb-cfg-book-nav">
                  <button type="button" className="v2-btn ghost sm" onClick={zurueck}
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
            {rechnung.teile.every((t) => t.zeilen.length === 0) ? (
              <p className="leer">Noch nichts gewählt. Ihre Auswahl erscheint hier, sobald Sie ein Paket zusammenstellen.</p>
            ) : (
              rechnung.teile.map((t, i) => (
                <div key={i}>
                  {anzahl === 2 && <div className="objlabel">Objekt {i + 1}</div>}
                  {t.zeilen.map((z) => (
                    <div className="row" key={z.name}>
                      <span>{z.name}</span>
                      <b>{z.betrag === null ? z.hinweis : preis(z.betrag)}</b>
                    </div>
                  ))}
                  {t.aufschlag > 0 && (
                    <div className="row"><span>Express-Aufschlag</span><b>{preis(t.aufschlag)}</b></div>
                  )}
                </div>
              ))
            )}
            {rechnung.vorteil > 0 && (
              <div className="row vorteil">
                <span>Enthaltener Mehrfachvorteil</span>
                <b>−{preis(rechnung.vorteil)}</b>
              </div>
            )}
            <div className="gesamt">
              <span>Gesamt (netto)</span>
              <b>{rechnung.summe === 0 && rechnung.sonder ? sonderobjekt.preisLabel : preis(rechnung.summe)}</b>
            </div>
            {rechnung.sonder && (
              <p className="qb-cfg-book-note">
                Für das größere oder komplexe Objekt erhalten Sie ein individuelles
                Festpreisangebot nach Objektprüfung. Es ist in der Summe nicht enthalten.
              </p>
            )}
            {dauer > 0 && (
              <div className="hinweis">
                {slot ? <><b>Wunschtermin</b><br />{slot.label}</>
                  : fallback ? <><b>Individuelle Terminanfrage</b><br />Termin wird persönlich abgestimmt.</>
                    : <><b>Voraussichtliche Produktionszeit:</b> ca. {dauer} Std. · Termin noch offen</>}
              </div>
            )}
            <p className="fuss">
              Alle Preise netto, zzgl. gesetzl. MwSt. Endgültige Rechnung nach Umsetzung inkl. ggf.
              besprochener Sonderleistungen.
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

function Spalten({ anzahl, render }) {
  if (anzahl === 1) return <div>{render(0)}</div>;
  return (
    <div className="qb-cfg-book-cols">
      {[0, 1].map((i) => (
        <div key={i}>
          <div className="qb-cfg-book-objhead">Objekt {i + 1}</div>
          {render(i)}
        </div>
      ))}
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

function Haken({ an, name, preisText, note, onClick }) {
  // Das Raster liegt auf einem inneren Element: ein <button> legt Grid-Kinder
  // nicht zuverlässig in seinen eigenen Kasten, sie liefen sonst darunter.
  return (
    <button type="button" className={`qb-cfg-checkbox ${an ? 'is-on' : ''}`} onClick={onClick} aria-pressed={an}>
      <span className="in">
        <span className="bx" aria-hidden="true">{an ? '✓' : ''}</span>
        <span className="t">{name}</span>
        <span className="pr">{preisText}</span>
        <span className="p">{note}</span>
      </span>
    </button>
  );
}

function Feld({ label, wert, set, typ = 'text', breit = false, mehrzeilig = false, platzhalter = '' }) {
  return (
    <label className={`qb-cfg-book-field ${breit ? 'breit' : ''}`}>
      <span>{label}</span>
      {mehrzeilig
        ? <textarea rows={4} value={wert} placeholder={platzhalter} onChange={(e) => set(e.target.value)} />
        : <input type={typ} value={wert} placeholder={platzhalter} onChange={(e) => set(e.target.value)} />}
    </label>
  );
}

function Zeile({ label, wert }) {
  return (
    <div className="row">
      <span>{label}</span>
      <b>{wert}</b>
    </div>
  );
}
