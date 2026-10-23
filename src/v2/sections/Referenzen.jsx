import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Split } from '../fx.jsx';
import { Arrow, Bild, PreisNetto } from '../ui.jsx';
import { track } from '../tracking.js';
import {
  hauptbeispiel, weitereProjekte, listingZu, klasseZu,
  anker, slugAusAnker, altText, metaZeile,
} from '../../content/beispiele.js';

/**
 * Referenz-Sektion: vollständige Beispiel-Inserate statt Einzelaufnahmen.
 *
 * Block A zeigt das eine Hauptbeispiel groß: Titelbild, daneben ein
 * 2×2-Raster aus der Manifest-Auswahl `vorschau`, alle fünf Bilder in 3:2,
 * darunter in einer Zeile Klasse, Titel, Bildanzahl, Festpreis. Jedes der
 * fünf Bilder öffnet die Galerie an genau diesem Bild. Block B zeigt alle
 * übrigen freigegebenen Listings als Karten mit Titelbild, Klasse und
 * Festpreis. Alle öffnen dieselbe Galerie. Inhalte, Reihenfolge und Freigabe
 * kommen aus src/content/beispiele.js; hier steht nur die Darstellung.
 *
 * Anker #beispiel-<slug> öffnet die Galerie beim Laden (Links aus der
 * Akquise). Geöffnet per Klick wird der Anker in den Verlauf geschrieben,
 * damit "Zurück" auf dem Handy die Galerie schließt statt die Seite zu
 * verlassen.
 */

const OEFFNEN = 'qb:beispiel';

// Dargestellte Breiten (Container = 91 % des Viewports, höchstens 1416 px):
// nebeneinander Titelbild eine Hälfte, Rasterbilder ein Viertel; untereinander
// (bis ca. 920 px Viewport, siehe @container in v2.css) Titelbild volle
// Breite, Rasterbilder eine Hälfte. Karten: vier Spalten, ab 1024 px zwei.
const HAUPT = '(max-width: 920px) calc(100vw - 40px), (min-width: 1600px) 710px, 46vw';
const MINI = '(max-width: 920px) 46vw, (min-width: 1600px) 350px, 23vw';
const KARTE = '(max-width: 1024px) 46vw, (min-width: 1600px) 350px, 23vw';

/**
 * Galerie eines Listings von außerhalb der Sektion öffnen, etwa aus den
 * Preiskacheln. `ausloeser` bekommt beim Schließen den Fokus zurück.
 */
export function oeffneBeispiel(slug, ausloeser, quelle = 'preis') {
  window.dispatchEvent(new CustomEvent(OEFFNEN, { detail: { slug, ausloeser, quelle } }));
}

/** Titel, der nur am Mittelpunkt umbricht ("Dachgeschosswohnung · Baden-Baden"). */
function Titel({ text }) {
  const teile = text.split(' · ');
  // Leerzeichen außerhalb der Spans, sonst fehlt die Umbruchstelle
  return teile.flatMap((t, i) => [
    i > 0 ? ' ' : null,
    <span key={t} className="am-stueck">{t}{i < teile.length - 1 ? ' ·' : ''}</span>,
  ]);
}

function Meta({ listing }) {
  return (
    <ul className="qb-bsp-meta">
      {metaZeile(listing).map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

export function Referenzen() {
  const [offen, setOffen] = useState(null);
  const ausloeser = useRef(null);
  const gepusht = useRef(false);
  const zuletzt = useRef(null);

  const oeffnen = useCallback((slug, el, quelle, start = 0) => {
    if (!listingZu(slug)) return;
    ausloeser.current = el || null;
    const ziel = `#${anker(slug)}`;
    if (window.location.hash !== ziel) {
      window.history.pushState(window.history.state, '', ziel);
      gepusht.current = true;
    }
    setOffen({ slug, start });
    track('referenzen_aufruf', { ansicht: 'beispiel', beispiel: slug, quelle });
  }, []);

  const schliessen = useCallback(() => {
    if (gepusht.current) {
      // Eigener Verlaufseintrag: zurückgehen, popstate schließt die Galerie.
      gepusht.current = false;
      window.history.back();
      return;
    }
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    setOffen(null);
  }, []);

  // Anker beim Laden, Zurück/Vor im Verlauf, Aufrufe aus den Preiskacheln
  useEffect(() => {
    const ausAdresse = () => {
      const slug = slugAusAnker(window.location.hash);
      if (!slug) gepusht.current = false;
      setOffen((alt) => (slug ? (alt && alt.slug === slug ? alt : { slug, start: 0 }) : null));
      return slug;
    };
    const slug = ausAdresse();
    if (slug) track('referenzen_aufruf', { ansicht: 'beispiel', beispiel: slug, quelle: 'link' });
    const vonAussen = (e) => oeffnen(e.detail.slug, e.detail.ausloeser, e.detail.quelle);
    window.addEventListener('popstate', ausAdresse);
    window.addEventListener('hashchange', ausAdresse);
    window.addEventListener(OEFFNEN, vonAussen);
    return () => {
      window.removeEventListener('popstate', ausAdresse);
      window.removeEventListener('hashchange', ausAdresse);
      window.removeEventListener(OEFFNEN, vonAussen);
    };
  }, [oeffnen]);

  // Nach dem Schließen den Fokus zurück auf den Auslöser; bei einem Aufruf
  // per Link auf die Schaltfläche der zugehörigen Karte.
  useEffect(() => {
    if (offen) { zuletzt.current = offen.slug; return; }
    if (!zuletzt.current) return;
    const el = ausloeser.current && document.contains(ausloeser.current)
      ? ausloeser.current
      : document.querySelector(`#${anker(zuletzt.current)} [data-galerie]`);
    zuletzt.current = null;
    ausloeser.current = null;
    if (el) el.focus({ preventScroll: true });
  }, [offen]);

  const klick = (slug, start = 0) => (e) => oeffnen(slug, e.currentTarget, 'karte', start);
  const listing = offen ? listingZu(offen.slug) : null;

  return (
    <section className="v2-sec bg-ink" id="referenzen" aria-labelledby="referenzen-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Referenzen</p>
          <Split as="h2" id="referenzen-titel" className="v2-h-display v2-h-lg">
            Beispiel-Inserate.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Jedes Beispiel stammt aus einer realen Objektproduktion und zeigt die Bildauswahl,
            wie sie im Inserat verwendet wird, zum Festpreis der jeweiligen Objektklasse.
          </p>
        </div>

        {hauptbeispiel && <Hauptbeispiel listing={hauptbeispiel} klick={klick} />}

        {weitereProjekte.length > 0 && (
          <div className="qb-bsp-weitere" data-reveal>
            <h3>Weitere Projekte</h3>
            <ul>
              {weitereProjekte.map((l) => {
                const k = klasseZu(l);
                return (
                  <li key={l.slug} id={anker(l.slug)}>
                    <span className="bild">
                      <Bild meta={l.bilder[l.titelbild]} alt="" sizes={KARTE} />
                    </span>
                    {/* Die Schaltfläche im Titel deckt per ::after die ganze Karte ab */}
                    <h4>
                      <button type="button" className="titel" data-galerie onClick={klick(l.slug)}
                              aria-haspopup="dialog">
                        <Titel text={l.titel} />
                      </button>
                    </h4>
                    <p className="anzahl">{l.bilder.length} Bilder</p>
                    <p className="klasse">
                      <span className="label">{k.label}</span>
                      {k.preis != null && <span className="preis">Festpreis <b><PreisNetto n={k.preis} /></b></span>}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {listing && (
        <Galerie key={listing.slug} listing={listing} start={offen.start}
                 klasse={klasseZu(listing)} schliessen={schliessen} />
      )}
    </section>
  );
}

/* ---------------------------------------------------------- Hauptbeispiel */

function Hauptbeispiel({ listing: l, klick }) {
  const n = l.bilder.length;
  const k = klasseZu(l);
  const knopf = (idx, haupt) => {
    const b = l.bilder[idx];
    return (
      <button type="button" key={idx} onClick={klick(l.slug, idx)} aria-haspopup="dialog"
              className={haupt ? 'haupt' : undefined}
              aria-label={`${b.raum}: Bild ${idx + 1} von ${n} im Inserat ${l.titel} öffnen`}>
        {/* Titelbild nicht lazy, aber mit niedriger Priorität: die Sektion liegt
            weit unter dem ersten Bildschirm, mit normaler Priorität verdrängt
            der frühe Abruf CSS, Schriften und Hero-Bild (Lighthouse mobil:
            Median 87 statt 97). */}
        {haupt
          ? <Bild meta={b} alt={altText(l, b)} sizes={HAUPT} loading="eager" fetchpriority="low" />
          : <Bild meta={b} alt={altText(l, b)} sizes={MINI} />}
      </button>
    );
  };
  return (
    <article className="qb-bsp" id={anker(l.slug)} aria-labelledby={`${anker(l.slug)}-titel`} data-reveal>
      <div className="bilder">
        {knopf(l.titelbild, true)}
        <div className="raster">{l.vorschau.map((idx) => knopf(idx, false))}</div>
      </div>
      <div className="text">
        <div className="kopf">
          <span className="label">{k.label}</span>
          <h3 id={`${anker(l.slug)}-titel`}>{l.titel}</h3>
          {l.untertitel && <p className="unter">{l.untertitel}</p>}
        </div>
        <div className="fuss">
          <Meta listing={l} />
          {k.preis != null && <p className="preis">Festpreis <b><PreisNetto n={k.preis} /></b></p>}
          <button type="button" className="v2-btn sm" data-galerie onClick={klick(l.slug)}
                  aria-haspopup="dialog">
            Inserat ansehen <Arrow size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Galerie */

const WISCH = 40;

function Galerie({ listing, start = 0, klasse, schliessen }) {
  // Startet bei Bild 1 der Manifest-Reihenfolge, beim Klick auf ein Bild der
  // Zeile an genau diesem Bild.
  const [i, setI] = useState(start);
  const dialog = useRef(null);
  const leiste = useRef(null);
  const wisch = useRef(null);
  const n = listing.bilder.length;
  const titelId = `galerie-${listing.slug}-titel`;

  const gehe = useCallback((ziel) => setI((ziel + n) % n), [n]);
  const blaettern = useCallback((r) => setI((x) => (x + r + n) % n), [n]);

  // Scroll-Lock, Hintergrund inaktiv, Tastatur
  useEffect(() => {
    const html = document.documentElement;
    const vorher = html.style.overflow;
    html.style.overflow = 'hidden';
    const root = document.getElementById('root');
    if (root) root.inert = true;
    dialog.current?.querySelector('.zu')?.focus();

    const taste = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); blaettern(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); blaettern(-1); }
      else if (e.key === 'Tab') {
        // Rückfall für Browser ohne `inert`
        const ziele = [...(dialog.current?.querySelectorAll('button:not([tabindex="-1"])') || [])];
        if (!ziele.length) return;
        const erste = ziele[0];
        const letzte = ziele[ziele.length - 1];
        if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
        else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
      }
    };
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('keydown', taste);
      html.style.overflow = vorher;
      if (root) root.inert = false;
    };
  }, [schliessen, blaettern]);

  // Aktives Vorschaubild in der Leiste sichtbar halten, ohne die Seite zu scrollen
  useEffect(() => {
    const l = leiste.current;
    const el = l?.children[i];
    if (!l || !el) return;
    const links = el.offsetLeft - l.clientWidth / 2 + el.clientWidth / 2;
    l.scrollTo({ left: links, behavior: 'smooth' });
  }, [i]);

  const wischStart = (e) => {
    const t = e.touches[0];
    wisch.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
  };
  const wischEnde = (e) => {
    const s = wisch.current;
    wisch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > WISCH && Math.abs(dx) > Math.abs(dy) * 1.2) blaettern(dx < 0 ? 1 : -1);
  };

  const bild = listing.bilder[i];
  const nachbarn = n > 1 ? [...new Set([(i + 1) % n, (i - 1 + n) % n])].filter((x) => x !== i) : [];
  const groesse = '(max-width: 760px) 100vw, 86vw';

  return createPortal(
    <div className="qb-galerie" role="dialog" aria-modal="true" aria-labelledby={titelId}
         ref={dialog} data-lenis-prevent>
      <header className="kopf">
        <div className="titel">
          <h2 id={titelId}>{listing.titel}</h2>
          <p className="klasse">
            <span className="label">{klasse.label}</span>
            {klasse.preis != null && <span>Festpreis <b><PreisNetto n={klasse.preis} /></b></span>}
          </p>
          {listing.untertitel && <p className="unter">{listing.untertitel}</p>}
          <Meta listing={listing} />
          {listing.hinweis_nebenraeume && (
            <p className="hinweis">Keller- und Nebenräume aus Rücksicht auf die Bewohner nicht gezeigt.</p>
          )}
        </div>
        <button type="button" className="rund zu" onClick={schliessen} aria-label="Galerie schließen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </header>

      <div className="buehne" onTouchStart={wischStart} onTouchEnd={wischEnde}>
        <figure key={i}>
          <Bild meta={bild} alt={altText(listing, bild)} sizes={groesse} vorrang />
        </figure>
        {nachbarn.map((x) => (
          <span className="vorladen" key={x} aria-hidden="true">
            <Bild meta={listing.bilder[x]} alt="" sizes={groesse} loading="eager" />
          </span>
        ))}
        {n > 1 && (
          <>
            <button type="button" className="rund vor" onClick={() => blaettern(-1)} aria-label="Vorheriges Bild">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            </button>
            <button type="button" className="rund nach" onClick={() => blaettern(1)} aria-label="Nächstes Bild">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </>
        )}
      </div>

      <div className="fuss">
        <p className="zaehler" aria-live="polite">
          <span className="zahl">{i + 1} / {n}</span>
          <span className="raum">{bild.raum}</span>
        </p>
        <div className="leiste" ref={leiste} role="group" aria-label="Alle Bilder">
          {listing.bilder.map((b, x) => (
            <button type="button" key={b.basis} className={x === i ? 'ist-aktiv' : undefined}
                    onClick={() => gehe(x)} aria-current={x === i ? 'true' : undefined}
                    aria-label={`Bild ${x + 1}: ${b.raum}`} tabIndex={x === i ? 0 : -1}>
              <Bild meta={b} alt="" sizes="104px" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
