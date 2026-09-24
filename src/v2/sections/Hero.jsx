import { useEffect } from 'react';
import { Magnetic, gsap, prefersReducedMotion } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { images, preisNetto, abPreis } from '../../content/site.js';

/**
 * Hero der Startseite. Texte wie freigegeben.
 *
 * Eyebrow, H1, Subheadline, CTAs und Preiszeile tragen bewusst KEINE
 * Reveal-Animation: sie sind im vorgerenderten HTML sofort sichtbar und
 * verzögern weder die Lesbarkeit noch den Largest Contentful Paint.
 * Nur das Hintergrundbild zoomt beim Laden leicht aus.
 */
export function Hero() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const tween = gsap.fromTo('.v2-hero-media img',
      { scale: 1.06 }, { scale: 1, duration: 2.2, ease: 'power2.out' });
    return () => tween.kill();
  }, []);

  return (
    <section className="v2-hero" id="top" aria-labelledby="hero-titel">
      <div className="v2-hero-media">
        <Bild src={images.hero} vorrang sizes="100vw"
              alt="Wohnhaus mit heller Holzfassade und dunklem Sockel, Außenaufnahme" />
      </div>
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        <p className="v2-eyebrow on-dark">
          Immobilienfotografie für Makler · Bühl · Baden-Baden · Achern
        </p>
        <h1 id="hero-titel" className="v2-h-display v2-h-xl v2-hero-h">
          Professionelle Immobilien­fotos für Makler in Mittelbaden.
        </h1>
        <p className="v2-lead v2-hero-lead">
          Natürliche Bildbearbeitung, klare Preise nach Objektklasse und persönliche
          Abstimmung – für Makler und Immobilienprojekte in Bühl, Baden-Baden,
          Achern und Umgebung.
        </p>
        <div className="v2-hero-ctas">
          <Magnetic>
            <a className="v2-btn" href={SEITEN.anfrage.pfad} data-event="cta_primary">
              Verfügbarkeit prüfen <Arrow />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href={SEITEN.referenzen.pfad}>
              Referenzprojekte ansehen
            </a>
          </Magnetic>
        </div>
        <p className="v2-hero-note">Immobilienfotografie ab {preisNetto(abPreis())}</p>
      </div>
    </section>
  );
}
