import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

/**
 * Kundenlogos als eigenständige Vertrauenssektion, nicht als schmales Band.
 * Bestehende Kunden sind das stärkste Signal, das die Seite hat, deshalb
 * bekommen sie eine Überschrift, Luft und eine feste Box je Logo, damit
 * unterschiedliche Formate optisch gleich schwer wirken.
 */
export function LogoBand() {
  return (
    <section className="v2-sec tight bg-linen-2" id="kunden">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Setzen auf Quadratblick</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Maklerbüros und Immobilienmakler, die mit uns arbeiten.
          </Split>
        </div>

        <ul className="qb-kunden">
          {images.logos.map((l, i) => (
            <li key={l.src} data-reveal data-delay={Math.min(i * 0.08, 0.3)}>
              <img src={l.src} alt={l.alt} loading="lazy" />
            </li>
          ))}
        </ul>

        <p className="qb-kunden-note" data-reveal>
          Vom institutionellen Immobilienbereich bis zum inhabergeführten
          Maklerbüro, im Raum Bühl, Mittelbaden und der Ortenau.
        </p>
      </div>
    </section>
  );
}
