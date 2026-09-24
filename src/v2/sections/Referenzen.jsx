import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Split, revealNachgeladen } from '../fx.jsx';
import { Arrow, Bild, InstagramGlyph } from '../ui.jsx';
import { track } from '../tracking.js';
import { images, referenzAuswahl, kontakt } from '../../content/site.js';

/**
 * Arbeitsproben des Onepagers: eine gemischte Auswahl aus allen Objekten
 * (`referenzAuswahl`) als kompaktes Mosaik. Zunächst ein großes und vier
 * kleine Bilder, "Weitere einblenden" ergänzt jeweils eine Reihe. Die
 * Großansicht läuft über die ganze Auswahl.
 *
 * Großansicht: vollständig per Tastatur bedienbar, Pfeiltasten blättern,
 * Escape schließt, der Fokus kehrt auf die auslösende Kachel zurück.
 */
const ANFANG = 5;
const TAKT = 4;

export function Referenzen() {
  const [offen, setOffen] = useState(-1);
  const [anzahl, setAnzahl] = useState(ANFANG);
  const ausloeser = useRef(null);
  const dialog = useRef(null);
  const liste = useRef(null);

  // Reihenfolge der Kacheln ist zugleich die der Großansicht.
  const reihenfolge = useMemo(
    () => referenzAuswahl.map((i, pos) => ({ ...images.referenzen[i], pos })),
    [],
  );
  const sichtbar = reihenfolge.slice(0, anzahl);
  const rest = reihenfolge.length - anzahl;

  // Nachgeladene Aufnahmen bekommen ihren Reveal nachträglich.
  useEffect(() => {
    if (anzahl > ANFANG) revealNachgeladen(liste.current);
  }, [anzahl]);

  const schliessen = useCallback(() => {
    setOffen(-1);
    if (ausloeser.current) ausloeser.current.focus();
  }, []);

  const blaettern = useCallback((richtung) => {
    setOffen((i) => (i + richtung + reihenfolge.length) % reihenfolge.length);
  }, [reihenfolge.length]);

  useEffect(() => {
    if (offen < 0) return undefined;
    const taste = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); blaettern(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); blaettern(-1); }
      else if (e.key === 'Tab') {
        const ziele = dialog.current?.querySelectorAll('button');
        if (!ziele || !ziele.length) return;
        const erste = ziele[0];
        const letzte = ziele[ziele.length - 1];
        if (e.shiftKey && document.activeElement === erste) { e.preventDefault(); letzte.focus(); }
        else if (!e.shiftKey && document.activeElement === letzte) { e.preventDefault(); erste.focus(); }
      }
    };
    document.addEventListener('keydown', taste);
    const vorher = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.current?.querySelector('button')?.focus();
    return () => {
      document.removeEventListener('keydown', taste);
      document.documentElement.style.overflow = vorher;
    };
  }, [offen, schliessen, blaettern]);

  const aktuell = offen >= 0 ? reihenfolge[offen] : null;

  return (
    <section className="v2-sec bg-ink" id="referenzen" aria-labelledby="referenzen-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Arbeitsproben</p>
          <Split as="h2" id="referenzen-titel" className="v2-h-display v2-h-lg">
            Die ersten Referenzobjekte.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Aufnahmen aus abgeschlossenen Objektproduktionen. Unser Portfolio wächst mit
            jedem neuen Objekt.
          </p>
        </div>

        <ul className="qb-versatz qb-mosaik" ref={liste}>
          {sichtbar.map((b, i) => (
            <li key={b.src} data-reveal data-delay={(i % TAKT) * 0.07}>
              <figure>
                <button
                  type="button"
                  className="box"
                  onClick={(e) => {
                    ausloeser.current = e.currentTarget;
                    setOffen(b.pos);
                    track('referenzen_aufruf', { ansicht: 'grossansicht' });
                  }}
                  aria-label={`${b.alt}. Große Ansicht öffnen`}
                >
                  <Bild src={b.src} alt={b.alt} sizes={i === 0 ? '(max-width: 760px) calc(100vw - 40px), 50vw' : '(max-width: 760px) 50vw, 25vw'} />
                  <span className="lupe" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M11 8v6" /><path d="M8 11h6" />
                    </svg>
                  </span>
                </button>
              </figure>
            </li>
          ))}
        </ul>

        {rest > 0 && (
          <div className="v2-mosaik-mehr" data-reveal>
            <button type="button" className="v2-btn ghost on-dark"
                    onClick={() => { setAnzahl((n) => n + TAKT); track('referenzen_aufruf', { ansicht: 'mehr' }); }}>
              Weitere einblenden <Arrow size={15} />
            </button>
          </div>
        )}

        <div className="v2-mosaik-foot" data-reveal>
          <a className="v2-link-inline" href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
          </a>
        </div>
      </div>

      {aktuell && (
        <div
          className="v2-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Große Ansicht der Referenzaufnahme"
          ref={dialog}
          onClick={(e) => { if (e.target === e.currentTarget) schliessen(); }}
        >
          <figure>
            <Bild src={aktuell.src} alt={aktuell.alt} sizes="92vw" />
            <figcaption>{aktuell.alt}</figcaption>
          </figure>
          <button type="button" className="zu" onClick={schliessen} aria-label="Schließen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
          <button type="button" className="vor" onClick={() => blaettern(-1)} aria-label="Vorheriges Bild">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          <button type="button" className="zurueck" onClick={() => blaettern(1)} aria-label="Nächstes Bild">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          <span className="zaehler" aria-live="polite">{offen + 1} / {reihenfolge.length}</span>
        </div>
      )}
    </section>
  );
}
