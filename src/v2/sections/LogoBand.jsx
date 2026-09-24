import { images } from '../../content/site.js';

/**
 * Logos regionaler Immobilienanbieter, für die Aufnahmen entstanden sind.
 * Bewusst neutral beschriftet: keine Aussage über eine laufende oder
 * bezahlte Zusammenarbeit, keine Resultate. Nur Logos mit belegtem Namen.
 */
export function LogoBand({ dunkel = false }) {
  return (
    <div className={`qb-logos ${dunkel ? 'on-dark' : ''}`}>
      <p className="qb-logos-titel">Aufnahmen aus Projekten für regionale Immobilienanbieter</p>
      <ul className="qb-kunden">
        {images.logos.map((l) => (
          <li key={l.src}>
            <img src={l.src} alt={l.alt} loading="lazy" decoding="async" width="420" height="180" />
          </li>
        ))}
      </ul>
    </div>
  );
}
