import { useMemo, useState } from 'react';
import { Split } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { objektklassen, sonderobjekt, filmpakete, erweiterungen, buendelVorteil, kontakt, preis } from '../../content/site.js';

/**
 * Terminanfrage. Der achtstufige Konfigurator der Live-Seite ist zu einem
 * Formular zusammengezogen: Er begann mit der Rabattfrage, und diese
 * Rabattlogik gilt nicht mehr. Der Einstieg erfolgt über das Objekt.
 *
 * Rechenlogik:
 *   Objektklasse × Anzahl (jedes weitere Objekt minus Mehrfachvorteil,
 *   der nur auf den fotografischen Grundpreis wirkt)
 *   + Objektfilm, falls gewählt
 *   + Festbeträge der Erweiterungen
 *   + Home Staging nach Menge (ab drei Bildern günstiger)
 *   + Express als Prozentaufschlag mit Mindestbetrag, zuletzt
 */
const festeErweiterungen = erweiterungen.filter((e) => typeof e.preis === 'number');
const homestaging = erweiterungen.find((e) => e.key === 'homestaging');
const express = erweiterungen.find((e) => e.key === 'express');

function encodeFormData(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');
}

export function Anfrage() {
  const [klasse, setKlasse] = useState('');
  const [anzahl, setAnzahl] = useState(1);
  const [film, setFilm] = useState('');
  const [addons, setAddons] = useState({});
  const [staging, setStaging] = useState(0);
  const [eilig, setEilig] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const gewaehlteKlasse = objektklassen.find((k) => k.key === klasse);
  const gewaehlterFilm = filmpakete.find((f) => f.key === film);

  const kalkulation = useMemo(() => {
    if (!gewaehlteKlasse) return null;
    let summe = gewaehlteKlasse.preis;
    for (let i = 1; i < anzahl; i += 1) summe += gewaehlteKlasse.preis - buendelVorteil.betrag;
    if (gewaehlterFilm) summe += gewaehlterFilm.preis;
    festeErweiterungen.forEach((e) => { if (addons[e.key]) summe += e.preis; });
    if (staging > 0) {
      summe += staging * (staging >= 3 ? homestaging.jeEinheitAb3 : homestaging.jeEinheit);
    }
    const aufschlag = eilig
      ? Math.max(Math.round(summe * express.zuschlag), express.zuschlagMin)
      : 0;
    return { summe: summe + aufschlag, aufschlag };
  }, [gewaehlteKlasse, anzahl, gewaehlterFilm, addons, staging, eilig]);

  const gewaehlteNamen = [
    ...festeErweiterungen.filter((e) => addons[e.key]).map((e) => e.name),
    ...(staging > 0 ? [`${homestaging.name} (${staging} Bilder)`] : []),
    ...(eilig ? [express.name] : []),
  ];

  const submit = (e) => {
    e.preventDefault();
    setBusy(true); setError(false);
    const fd = Object.fromEntries(new FormData(e.target).entries());
    const zusammenfassung = [
      `Objektart: ${gewaehlteKlasse ? gewaehlteKlasse.name : 'größeres oder komplexes Objekt'}`,
      `Anzahl Objekte: ${anzahl}`,
      `Film: ${gewaehlterFilm ? gewaehlterFilm.name : 'kein Film'}`,
      `Erweiterungen: ${gewaehlteNamen.join(', ') || 'keine'}`,
      `Preisorientierung: ${kalkulation ? preis(kalkulation.summe) + ' netto' : 'individuelle Prüfung'}`,
    ].join('\n');
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData({ ...fd, zusammenfassung }),
    })
      .then((r) => { if (!r.ok) throw new Error('failed'); setSent(true); })
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  };

  return (
    <section className="v2-sec bg-ink" id="booking">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Terminanfrage</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Stellen Sie Ihr Paket zusammen und fragen Sie Ihren Wunschtermin an.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Die Anfrage ist für Sie unverbindlich. Verbindlich wird sie erst mit unserer
            Bestätigung, die Sie nach kurzer persönlicher Rückmeldung erhalten.
          </p>
        </div>

        <div className="qb-anfrage" data-reveal>
          {sent ? (
            <div className="qb-anfrage-ok">
              <span className="ok" aria-hidden="true">✓</span>
              <h3>Anfrage ist angekommen</h3>
              <p>
                Wir melden uns innerhalb von 1 bis 2 Werktagen persönlich mit der Bestätigung,
                Festpreis und Liefertermin. Wenn vorher etwas unklar ist, erreichen Sie uns unter{' '}
                {kontakt.telefon}.
              </p>
              <button type="button" className="v2-btn ghost sm" onClick={() => setSent(false)}>Weitere Anfrage</button>
            </div>
          ) : (
            <form name="objektanfrage" onSubmit={submit} data-netlify-honeypot="bot-field">
              <input type="hidden" name="form-name" value="objektanfrage" />
              <input type="text" name="bot-field" tabIndex="-1" autoComplete="off" aria-hidden="true"
                     style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

              <div className="qb-form-grid">
                <fieldset className="qb-fs">
                  <legend>Ihr Objekt</legend>

                  <label className="qb-field">
                    <span>Objektart</span>
                    <select name="objektart" value={klasse} onChange={(e) => setKlasse(e.target.value)} required>
                      <option value="" disabled>Bitte wählen</option>
                      {objektklassen.map((k) => (
                        <option key={k.key} value={k.key}>{k.name} · {preis(k.preis)}</option>
                      ))}
                      <option value="sonder">{sonderobjekt.name} · {sonderobjekt.preisLabel}</option>
                    </select>
                  </label>

                  <label className="qb-field">
                    <span>Objekte am selben Produktionstag</span>
                    <select name="anzahl" value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))}>
                      {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>

                  <label className="qb-field">
                    <span>Film</span>
                    <select name="film" value={film} onChange={(e) => setFilm(e.target.value)}>
                      <option value="">Kein Film</option>
                      {filmpakete.map((f) => (
                        <option key={f.key} value={f.key}>{f.name} · {preis(f.preis)}</option>
                      ))}
                    </select>
                  </label>
                </fieldset>

                <fieldset className="qb-fs">
                  <legend>Termin und Kontakt</legend>

                  <label className="qb-field">
                    <span>Wunschtermin</span>
                    <input type="date" name="wunschtermin" />
                  </label>

                  <label className="qb-field">
                    <span>Alternativ: Zeitraum</span>
                    <input type="text" name="zeitraum" placeholder="z. B. ab Mitte September oder KW 38" />
                  </label>

                  <div className="qb-two">
                    <label className="qb-field">
                      <span>Vorname</span>
                      <input type="text" name="vorname" required />
                    </label>
                    <label className="qb-field">
                      <span>Nachname</span>
                      <input type="text" name="nachname" required />
                    </label>
                  </div>

                  <div className="qb-two">
                    <label className="qb-field">
                      <span>E-Mail</span>
                      <input type="email" name="email" required />
                    </label>
                    <label className="qb-field">
                      <span>Telefon</span>
                      <input type="tel" name="telefon" />
                    </label>
                  </div>

                  <div className="qb-two">
                    <label className="qb-field">
                      <span>Firma</span>
                      <input type="text" name="firma" />
                    </label>
                    <label className="qb-field">
                      <span>Objektadresse</span>
                      <input type="text" name="adresse" placeholder="Straße, PLZ, Ort" required />
                    </label>
                  </div>

                  <label className="qb-field">
                    <span>Anmerkungen</span>
                    <textarea name="nachricht" rows={2} placeholder="Besonderheiten, Zugang, bewohnt oder leer stehend" />
                  </label>
                </fieldset>
              </div>

              <fieldset className="qb-fs qb-extras">
                <legend>Optionen</legend>
                <div className="qb-checks">
                  {festeErweiterungen.map((e) => (
                    <label key={e.key} className={`qb-check ${addons[e.key] ? 'is-on' : ''}`}>
                      <input
                        type="checkbox"
                        name={`erweiterung-${e.key}`}
                        checked={!!addons[e.key]}
                        onChange={() => setAddons((a) => ({ ...a, [e.key]: !a[e.key] }))}
                      />
                      <span className="bx" aria-hidden="true">{addons[e.key] ? '✓' : ''}</span>
                      <span className="tx">{e.name}{e.zusatz ? <em>{e.zusatz}</em> : null}</span>
                      <span className="pr">{e.preisLabel}</span>
                    </label>
                  ))}

                  <label className={`qb-check ${eilig ? 'is-on' : ''}`}>
                    <input type="checkbox" name="erweiterung-express" checked={eilig}
                           onChange={() => setEilig((v) => !v)} />
                    <span className="bx" aria-hidden="true">{eilig ? '✓' : ''}</span>
                    <span className="tx">{express.name}</span>
                    <span className="pr">{express.preisLabelKurz}</span>
                  </label>
                </div>

                <label className="qb-field qb-staging">
                  <span>{homestaging.name}, Anzahl Bilder</span>
                  <select name="homestaging" value={staging} onChange={(e) => setStaging(Number(e.target.value))}>
                    <option value={0}>Keine</option>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Bild' : 'Bilder'} · {preis(n * (n >= 3 ? homestaging.jeEinheitAb3 : homestaging.jeEinheit))}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>

              <div className="qb-form-foot">
                <div className="qb-summe">
                  <span className="k">Preisorientierung</span>
                  <b>
                    {klasse === 'sonder'
                      ? 'Angebot nach Objektprüfung'
                      : (kalkulation ? `${preis(kalkulation.summe)} netto` : 'Objektart wählen')}
                  </b>
                  <small>
                    {anzahl > 1 && gewaehlteKlasse ? `Enthält ${preis(buendelVorteil.betrag)} Vorteil je weiterem Objekt auf den Fotopreis. ` : ''}
                    {kalkulation && kalkulation.aufschlag > 0 ? `Enthält ${preis(kalkulation.aufschlag)} Express-Aufschlag. ` : ''}
                    Zzgl. gesetzlicher MwSt. Verbindlich wird der Preis mit unserer Bestätigung.
                  </small>
                </div>
                <button type="submit" className="v2-btn" disabled={busy}>
                  {busy ? 'Wird gesendet' : 'Unverbindlich anfragen'} <Arrow />
                </button>
              </div>

              {error && (
                <p className="qb-form-error">
                  Das hat nicht geklappt. Bitte versuchen Sie es erneut oder schreiben Sie an{' '}
                  <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>.
                </p>
              )}
              <p className="qb-form-note">
                Ihre Angaben werden ausschließlich für die Bearbeitung dieser Anfrage genutzt.
                Mehr dazu in der <a href="/datenschutz.html">Datenschutzerklärung</a>.
              </p>
            </form>
          )}

          <aside className="qb-anfrage-aside">
            <h3>Lieber erst sprechen?</h3>
            <p>Wenn Sie das Objekt vorab einschätzen lassen möchten, rufen Sie an oder schreiben Sie kurz.</p>
            <div className="qb-kontaktliste">
              <a href={`mailto:${kontakt.email}`}><span className="k">E-Mail</span>{kontakt.email}</a>
              <a href={kontakt.telefonHref}><span className="k">Telefon</span>{kontakt.telefon}</a>
              <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer"><span className="k">Instagram</span>{kontakt.instagramHandle}</a>
              <span className="row"><span className="k">Region</span>{kontakt.region}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
