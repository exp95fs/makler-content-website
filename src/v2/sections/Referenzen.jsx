import { useCallback, useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { InstagramGlyph } from '../ui.jsx';
import { images, kontakt } from '../../content/site.js';

/**
 * Referenzgalerie als Mosaik. Kacheln in zwei Breiten, beim Klick öffnet
 * sich eine Lightbox über alle Aufnahmen, auch die noch nicht
 * eingeblendeten. Vollständig mit der Tastatur bedienbar: die Kacheln
 * sind Buttons, im geöffneten Zustand blättern Pfeiltasten, Escape
 * schließt, und der Fokus kehrt auf die auslösende Kachel zurück.
 */
export function Referenzen() {
  const bilder = images.referenzen;
  const [offen, setOffen] = useState(-1);
  const [alleZeigen, setAlleZeigen] = useState(false);
  const SICHTBAR = 15;
  const ausloeser = useRef(null);
  const dialog = useRef(null);

  const schliessen = useCallback(() => {
    setOffen(-1);
    if (ausloeser.current) ausloeser.current.focus();
  }, []);

  const blaettern = useCallback((richtung) => {
    setOffen((i) => (i + richtung + bilder.length) % bilder.length);
  }, [bilder.length]);

  useEffect(() => {
    if (offen < 0) return undefined;
    const taste = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); blaettern(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); blaettern(-1); }
      else if (e.key === 'Tab') {
        // Fokus im Dialog halten
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

  return (
    <section className="v2-sec bg-ink" id="referenzen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Arbeitsproben</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Die ersten Referenzobjekte.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Aufnahmen aus abgeschlossenen Produktionen für Maklerbüros und Immobilienabteilungen
            in der Region. Unser Portfolio wächst mit jedem neuen Objekt.
          </p>
        </div>

        <ul className="v2-mosaik">
          {bilder.slice(0, alleZeigen ? bilder.length : SICHTBAR).map((b, i) => (
            <li className={b.gross ? 'gross' : ''} key={b.src} data-reveal data-delay={Math.min(i * 0.05, 0.3)}>
              <button
                type="button"
                onClick={(e) => { ausloeser.current = e.currentTarget; setOffen(i); }}
                aria-label={`${b.alt}. Große Ansicht öffnen`}
              >
                <img src={b.src} alt={b.alt} loading="lazy" width="2000" height="1333" />
                <span className="lupe" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M11 8v6" /><path d="M8 11h6" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {!alleZeigen && bilder.length > SICHTBAR && (
          <div className="v2-mosaik-mehr" data-reveal>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => setAlleZeigen(true)}>
              Alle {bilder.length} Aufnahmen zeigen
            </button>
          </div>
        )}

        <div className="v2-mosaik-foot" data-reveal>
          <a className="v2-link-inline" href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
          </a>
          <span className="v2-idx">{bilder.length} Aufnahmen · Raum Bühl, Mittelbaden, Ortenau</span>
        </div>
      </div>

      {offen >= 0 && (
        <div
          className="v2-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Große Ansicht der Referenzaufnahme"
          ref={dialog}
          onClick={(e) => { if (e.target === e.currentTarget) schliessen(); }}
        >
          <figure>
            <img src={bilder[offen].src} alt={bilder[offen].alt} />
            <figcaption>{bilder[offen].alt}</figcaption>
          </figure>
          <button type="button" className="zu" onClick={schliessen} aria-label="Schließen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
          <button type="button" className="vor" onClick={() => blaettern(-1)} aria-label="Vorheriges Bild">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
          </button>
          <button type="button" className="zurueck" onClick={() => blaettern(1)} aria-label="Nächstes Bild">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          <span className="zaehler">{offen + 1} / {bilder.length}</span>
        </div>
      )}
    </section>
  );
}
