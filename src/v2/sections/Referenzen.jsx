import { useCallback, useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { InstagramGlyph } from '../ui.jsx';
import { images, kontakt } from '../../content/site.js';

/**
 * Referenzen als horizontales Karussell mit sichtbarem Anschnitt des
 * nächsten Bildes. Natives Scroll-Snapping, per Touch, Maus und Tastatur
 * bedienbar. Keine Fremdbibliothek.
 */
export function Referenzen() {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update]);

  const scrollBy = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section className="v2-sec bg-ink" id="portfolio">
      <div className="v2-wrap">
        <div className="qb-ref-head">
          <div className="v2-sec-head" style={{ marginBottom: 0 }}>
            <p className="v2-eyebrow on-dark" data-reveal>Arbeitsproben</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Die ersten Referenzobjekte.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Aufnahmen aus abgeschlossenen Produktionen für Maklerbüros und Immobilienabteilungen
              in der Region. Unser regionales Portfolio wächst mit jedem neuen Objekt.
            </p>
          </div>
          <div className="qb-ref-nav" data-reveal>
            <button type="button" onClick={() => scrollBy(-1)} disabled={atStart} aria-label="Vorherige Aufnahmen">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
            </button>
            <button type="button" onClick={() => scrollBy(1)} disabled={atEnd} aria-label="Weitere Aufnahmen">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <ul
          className="qb-ref-track"
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label="Referenzaufnahmen, horizontal scrollbar"
        >
          {images.referenzen.map((img, i) => (
            <li key={img.src}>
              <figure>
                <img src={img.src} alt={img.alt} loading={i < 2 ? 'eager' : 'lazy'} width="1600" height="1067" />
              </figure>
            </li>
          ))}
        </ul>

        <div className="qb-ref-foot" data-reveal>
          <a className="v2-link-inline" href={kontakt.instagram} target="_blank" rel="noopener noreferrer">
            <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
          </a>
          <span className="v2-idx" style={{ color: 'rgba(243,238,229,0.4)' }}>Raum Bühl · Mittelbaden · Ortenau</span>
        </div>
      </div>
    </section>
  );
}
