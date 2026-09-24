import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Split, revealNachgeladen } from '../fx.jsx';
import { InstagramGlyph, Arrow } from '../ui.jsx';
import { images, referenzGruppen, kontakt } from '../../content/site.js';

/**
 * Referenzen als versetzte Gruppen. Jede Gruppe zeigt vier große Aufnahmen
 * in unterschiedlichen Formaten, damit erkennbar wird, dass ganze Objekte
 * produziert werden und nicht Einzelbilder.
 *
 * Bewusst wenige Aufnahmen im Ausgangszustand: die weiteren Gruppen liegen
 * hinter einem Button. Die Lightbox läuft dagegen über alle Aufnahmen, auch
 * die noch nicht eingeblendeten, und ist vollständig mit der Tastatur
 * bedienbar (Pfeiltasten blättern, Escape schließt, der Fokus kehrt auf die
 * auslösende Kachel zurück).
 */
export function Referenzen() {
  const [offen, setOffen] = useState(-1);
  const [alleZeigen, setAlleZeigen] = useState(false);
  const ausloeser = useRef(null);
  const dialog = useRef(null);
  const liste = useRef(null);

  // Anzeigereihenfolge der Gruppen ist zugleich die Reihenfolge in der
  // Lightbox, damit Blättern und Raster übereinstimmen.
  const { gruppen, reihenfolge } = useMemo(() => {
    const flach = [];
    const g = referenzGruppen.map((gr) => ({
      ...gr,
      bilder: gr.bilder.map((i) => {
        const bild = images.referenzen[i];
        const pos = flach.push(bild) - 1;
        return { ...bild, pos };
      }),
    }));
    return { gruppen: g, reihenfolge: flach };
  }, []);

  // Im Ausgangszustand stehen nur die markierten Gruppen und von ihnen nur
  // die ersten vier Aufnahmen - ein voller Rastertakt. Der Rest folgt auf Klick.
  const TAKT = 4;
  const sichtbareGruppen = alleZeigen
    ? gruppen
    : gruppen.filter((g) => g.sichtbar).map((g) => ({ ...g, bilder: g.bilder.slice(0, TAKT) }));
  const versteckt = reihenfolge.length - sichtbareGruppen.reduce((n, g) => n + g.bilder.length, 0);

  // Nachgeladene Gruppen bekommen ihren Reveal nachträglich, sonst bleiben
  // sie auf opacity 0 stehen.
  useEffect(() => {
    if (alleZeigen) revealNachgeladen(liste.current);
  }, [alleZeigen]);

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

        <ul className="qb-refgruppen" ref={liste}>
          {sichtbareGruppen.map((g) => (
            <li className="qb-refgruppe" key={g.titel}>
              <div className="titel" data-reveal>
                <b>{g.titel}</b>
                <span>{g.label}</span>
              </div>
              <ul className="qb-versatz">
                {g.bilder.map((b, i) => (
                  <li key={b.src} data-reveal data-delay={i * 0.07}>
                    <button
                      type="button"
                      onClick={(e) => { ausloeser.current = e.currentTarget; setOffen(b.pos); }}
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
            </li>
          ))}
        </ul>

        {!alleZeigen && versteckt > 0 && (
          <div className="v2-mosaik-mehr" data-reveal>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => setAlleZeigen(true)}>
              Weitere {versteckt} Aufnahmen anzeigen <Arrow size={15} />
            </button>
          </div>
        )}

        <div className="v2-mosaik-foot" data-reveal>
          <a className="v2-link-inline" href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
          </a>
          <span className="v2-idx">{reihenfolge.length} Aufnahmen · Raum Bühl, Mittelbaden, Ortenau</span>
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
            <img src={reihenfolge[offen].src} alt={reihenfolge[offen].alt} />
            <figcaption>{reihenfolge[offen].alt}</figcaption>
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
          <span className="zaehler">{offen + 1} / {reihenfolge.length}</span>
        </div>
      )}
    </section>
  );
}
