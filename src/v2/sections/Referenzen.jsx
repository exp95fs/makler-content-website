import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Split, revealNachgeladen } from '../fx.jsx';
import { Arrow, Bild, InstagramGlyph } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { track } from '../tracking.js';
import { images, referenzGruppen, referenzAuswahl, kontakt } from '../../content/site.js';

/**
 * Referenzgalerie, nach Objekt gruppiert in einem versetzten Raster.
 *
 * `variante="seite"` (/referenzen/): alle Aufnahmen mit Bildunterschrift,
 * je Gruppe der CTA "Ähnliches Objekt anfragen".
 *
 * `variante="start"` (Onepager): Gestaltung der früheren Arbeitsproben-
 * Sektion, aber nicht nach Objekt gruppiert: eine gemischte Auswahl aus
 * allen Objekten (`referenzAuswahl`) als kompaktes Mosaik. Zunächst ein
 * großes und vier kleine Bilder, "Weitere einblenden" ergänzt jeweils
 * eine Reihe. Die Großansicht läuft über die ganze Auswahl.
 *
 * Bildunterschriften beschreiben nur, was auf der Aufnahme zu sehen ist.
 * Objektart, Ort und Auftraggeber sind nicht belegt und werden nicht
 * genannt (siehe referenzGruppen in site.js).
 *
 * Großansicht: vollständig per Tastatur bedienbar, Pfeiltasten blättern,
 * Escape schließt, der Fokus kehrt auf die auslösende Kachel zurück.
 */
// Startseite: ein großes und vier kleine Bilder, danach je eine Reihe.
const ANFANG = 5;
const TAKT = 4;

export function Referenzen({ variante = 'seite' }) {
  const start = variante === 'start';
  const [offen, setOffen] = useState(-1);
  const [anzahl, setAnzahl] = useState(ANFANG);
  const ausloeser = useRef(null);
  const dialog = useRef(null);
  const liste = useRef(null);

  // Seite: nach Objekt gruppiert. Start: eine Gruppe ohne Titel mit der
  // gemischten Auswahl. Die flache Reihenfolge ist zugleich die der
  // Großansicht.
  const { gruppen, reihenfolge } = useMemo(() => {
    const flach = [];
    const quelle = start
      ? [{ titel: 'Auswahl', bilder: referenzAuswahl }]
      : referenzGruppen;
    const g = quelle.map((gr) => ({
      ...gr,
      bilder: gr.bilder.map((i) => {
        const bild = images.referenzen[i];
        const pos = flach.push(bild) - 1;
        return { ...bild, pos };
      }),
    }));
    return { gruppen: g, reihenfolge: flach };
  }, [start]);

  const sichtbareGruppen = start
    ? gruppen.map((g) => ({ ...g, bilder: g.bilder.slice(0, anzahl) }))
    : gruppen;
  const rest = reihenfolge.length - anzahl;

  // Nachgeladene Aufnahmen bekommen ihren Reveal nachträglich.
  useEffect(() => {
    if (start && anzahl > ANFANG) revealNachgeladen(liste.current);
  }, [start, anzahl]);

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
    <section className="v2-sec bg-ink" id={start ? 'referenzen' : 'galerie'}
             {...(start ? { 'aria-labelledby': 'referenzen-titel' } : { 'aria-label': 'Referenzgalerie' })}>
      <div className="v2-wrap">
        {start && (
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
        )}

        <ul className="qb-refgruppen" ref={liste}>
          {sichtbareGruppen.map((g) => (
            <li className="qb-refgruppe" key={g.titel}>
              {!start && (
                <div className="titel">
                  <h2>{g.titel}</h2>
                  <span>{g.label}</span>
                </div>
              )}
              <ul className={start ? 'qb-versatz qb-mosaik' : 'qb-versatz'}>
                {g.bilder.map((b, i) => (
                  <li key={b.src} {...(start ? { 'data-reveal': '', 'data-delay': (i % TAKT) * 0.07 } : {})}>
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
                        <Bild src={b.src} alt={b.alt} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1560px) 55vw, 860px" />
                        <span className="lupe" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /><path d="M11 8v6" /><path d="M8 11h6" />
                          </svg>
                        </span>
                      </button>
                      {!start && <figcaption>{b.alt}</figcaption>}
                    </figure>
                  </li>
                ))}
              </ul>
              {!start && (
                <p className="qb-ref-cta">
                  <a className="v2-btn ghost on-dark sm" href={SEITEN.anfrage.pfad} data-event="cta_primary">
                    Ähnliches Objekt anfragen <Arrow size={14} />
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>

        {start && rest > 0 && (
          <div className="v2-mosaik-mehr" data-reveal>
            <button type="button" className="v2-btn ghost on-dark"
                    onClick={() => { setAnzahl((n) => n + TAKT); track('referenzen_aufruf', { ansicht: 'mehr' }); }}>
              Weitere einblenden <Arrow size={15} />
            </button>
          </div>
        )}

        {start && (
          <div className="v2-mosaik-foot" data-reveal>
            <a className="v2-link-inline" href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
              <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
            </a>
          </div>
        )}
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
