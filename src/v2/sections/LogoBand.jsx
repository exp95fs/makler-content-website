import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

/**
 * Logos als eigenständige Vertrauenssektion des Onepagers, in der
 * Gestaltung des bisherigen Onepagers (Überschrift, Luft, feste Box je
 * Logo).
 *
 * Überschrift ohne "die mit uns arbeiten" bzw. "Setzen auf", weil eine
 * laufende Zusammenarbeit nicht für alle gezeigten Logos belegt ist.
 */
export function LogoSektion() {
  return (
    <section className="v2-sec tight bg-linen-2" id="kunden" aria-labelledby="kunden-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Referenzen aus der Region</p>
          <Split as="h2" id="kunden-titel" className="v2-h-display v2-h-lg">
            Aufnahmen für regionale Immobilien­anbieter.
          </Split>
        </div>

        <ul className="qb-kunden">
          {images.logos.map((l, i) => (
            <li key={l.src} data-reveal data-delay={Math.min(i * 0.08, 0.3)}>
              <img src={l.src} alt={l.alt} loading="lazy" decoding="async" width="420" height="180" />
            </li>
          ))}
        </ul>

        <p className="qb-kunden-note" data-reveal>
          Vom institutionellen Immobilienbereich bis zum inhabergeführten Unternehmen.
        </p>
      </div>
    </section>
  );
}
