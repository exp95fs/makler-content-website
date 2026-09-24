import { useEffect } from 'react';
import { Split, Magnetic, scrollToId, gsap, prefersReducedMotion } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { images, fotoklassen, preisStern, preishinweisKurz } from '../../content/site.js';

/**
 * Die Headline spitzt allein auf die Bilder zu. Der Lead nennt den Nutzen,
 * nicht den Leistungsumfang: was enthalten ist, steht bei den Paketen, weil
 * der Umfang je nach Büro unterschiedlich abgerufen wird.
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
          Baden-Baden und Ortenau. Hochwertiger Content, der Ihre Objekte
          schneller vermittelt, qualifiziertere Anfragen bringt und Ihr Büro
          als Marke sichtbar macht.
        </p>
        <div className="v2-hero-ctas" data-reveal data-delay="0.5">
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
              Paket &amp; Termin anfragen <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('referenzen')}>
              Arbeitsproben ansehen
            </button>
          </Magnetic>
        </div>
        <p className="v2-hero-note" data-reveal data-delay="0.65">
          Festpreis ab {preisStern(Math.min(...fotoklassen.map((k) => k.foto)))} je Objekt
          {' · '}verbindlich vor dem Termin{' · '}Anfrage unverbindlich
          <span className="fein">{preishinweisKurz}</span>
        </p>
      </div>
      <div className="v2-hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
