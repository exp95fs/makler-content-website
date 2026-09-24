import { useEffect } from 'react';
import { Magnetic, gsap, prefersReducedMotion } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { images, abPreis, preisStern, preishinweisKurz } from '../../content/site.js';

/**
 * Hero des Onepagers. Gestaltung und Texte wie im bisherigen Onepager.
 *
 * Subline wie im bisherigen Onepager (auf Wunsch von Fabian), Region
 * Bühl, Baden-Baden, Achern statt Ortenau.
 *
 * Eyebrow, H1, Lead, CTAs und Preiszeile tragen bewusst KEINE
 * Reveal-Animation: sie sind im vorgerenderten HTML sofort sichtbar und
 * verzögern weder die Lesbarkeit noch den Largest Contentful Paint.
 * Das Hintergrundbild zoomt beim Laden leicht aus und läuft mit Parallax.
 */
export function Hero() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const tween = gsap.fromTo('.v2-hero-media img',
      { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
    return () => tween.kill();
  }, []);

  return (
    <section className="v2-hero" id="top" aria-labelledby="hero-titel">
      <div className="v2-hero-media">
        <Bild src={images.hero} vorrang sizes="100vw" data-parallax="14"
              alt="Wohnhaus mit heller Holzfassade und dunklem Sockel, Außenaufnahme" />
      </div>
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        <p className="v2-eyebrow on-dark">Immobilienfotografie · Raum Bühl · Baden-Baden · Achern</p>
        <h1 id="hero-titel" className="v2-h-display v2-h-xl v2-hero-h" style={{ marginTop: 20 }}>
          Bilder, die Ihre Objekte herausheben.
        </h1>
        <p className="v2-lead v2-hero-lead">
          Professionelle Immobilienfotografie für Maklerbüros im Raum Bühl,
          Baden-Baden, Achern und Umgebung. Hochwertiger Content, der Ihre Objekte
          schneller vermittelt, qualifiziertere Anfragen bringt und Ihr Büro
          als Marke sichtbar macht.
        </p>
        <div className="v2-hero-ctas">
          <Magnetic>
            <a className="v2-btn" href="#booking" data-event="cta_primary">
              Paket &amp; Termin anfragen <Arrow />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href="#referenzen" data-event="referenzen_aufruf">
              Arbeitsproben ansehen
            </a>
          </Magnetic>
        </div>
        <p className="v2-hero-note">
          Festpreis ab {preisStern(abPreis())} je Objekt
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
