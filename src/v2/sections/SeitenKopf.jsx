import { Bild } from '../ui.jsx';

/**
 * Kopfbereich der Unterseiten. Trägt die einzige H1 der Seite.
 * Wie beim Hero der Startseite ohne Reveal-Animation: H1 und Einleitung
 * sind sofort sichtbar.
 */
export function SeitenKopf({ eyebrow, titel, einleitung, bild, bildAlt = '', children, kompakt = false }) {
  return (
    <section className={`v2-hero sub qb-kopf ${bild ? '' : 'no-img'} ${kompakt ? 'kompakt' : ''}`}
             aria-labelledby="seiten-titel">
      {bild && (
        <div className="v2-hero-media">
          <Bild src={bild} alt={bildAlt} vorrang sizes="100vw" />
        </div>
      )}
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        {eyebrow && <p className="v2-eyebrow on-dark">{eyebrow}</p>}
        <h1 id="seiten-titel" className="v2-h-display v2-h-sub v2-hero-h">{titel}</h1>
        {einleitung && <p className="v2-lead v2-hero-lead">{einleitung}</p>}
        {children}
      </div>
    </section>
  );
}
