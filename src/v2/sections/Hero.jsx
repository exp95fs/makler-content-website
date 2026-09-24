import { useEffect } from 'react';
import { Split, Magnetic, scrollToId, gsap, prefersReducedMotion } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { images } from '../../content/site.js';

/**
 * Text wörtlich von der Live-Seite. Zwei Eingriffe:
 * der Bindestrich in der H1 ist ein Gedankenstrich geworden, und die
 * Trust-Zeile trägt zusätzlich den Preisanker.
 */
export function Hero() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const tween = gsap.fromTo('.v2-hero-media img',
      { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
    return () => tween.kill();
  }, []);

  return (
    <section className="v2-hero" id="top">
      <div className="v2-hero-media">
        <img
          src={images.hero}
          alt="Außenaufnahme eines Wohnobjekts aus einer Produktion für ein Maklerbüro"
          data-parallax="14"
          fetchpriority="high"
          width="2400"
          height="1600"
        />
      </div>
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        <p className="v2-eyebrow on-dark" data-reveal>Immobilienfotografie · Raum Bühl · Mittelbaden · Ortenau</p>
        <Split as="h1" className="v2-h-display v2-h-xl v2-hero-h" style={{ marginTop: 20 }}>
          Bilder, die Ihre Objekte herausheben.
        </Split>
        <p className="v2-lead v2-hero-lead" data-reveal data-delay="0.35">
          Professionelle Immobilienfotografie für Maklerbüros im Raum Bühl,
          Baden-Baden und Ortenau. Zum Festpreis, und ohne Aufwand für Ihr Büro:
          Terminabstimmung mit dem Eigentümer, Aufnahme vor Ort und Bearbeitung
          übernehmen wir.
        </p>
        <div className="v2-hero-ctas" data-reveal data-delay="0.5">
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('start')}>
              Paket &amp; Termin anfragen <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('portfolio')}>
              Arbeitsproben ansehen
            </button>
          </Magnetic>
        </div>
        <p className="v2-hero-note" data-reveal data-delay="0.65">
          Festpreis ab 350 € netto je Objekt · verbindlich vor dem Termin · Anfrage unverbindlich
        </p>
      </div>
      <div className="v2-hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
