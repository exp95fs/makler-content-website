import { Split } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';

/**
 * Kurzfassung des freigegebenen About-Texts. Der vollständige Text steht auf
 * /ueber-quadratblick/, hier nur der Einstieg, um Dopplungen zu vermeiden.
 * Keine Team-Darstellung.
 */
export function AboutTeaser({ bg = 'bg-linen' }) {
  return (
    <section className={`v2-sec ${bg}`} id="ueber" aria-labelledby="ueber-titel">
      <div className="v2-wrap">
        <div className="qb-about">
          <p className="v2-eyebrow" data-reveal>Über Quadratblick</p>
          <Split as="h2" id="ueber-titel" className="v2-h-display v2-h-lg">
            Fabian Schneebiegl – persönlicher Ansprech­partner hinter Quadratblick
          </Split>
          <p className="v2-lead" data-reveal>
            Quadratblick ist meine spezialisierte Marke für Immobilienfotografie in Bühl und
            Mittelbaden. Ich begleite jedes Projekt persönlich – von der Abstimmung über den
            Fototermin bis zur finalen Bildauswahl.
          </p>
          <p data-reveal>
            <a className="v2-link-inline on-light" href={SEITEN.ueber.pfad}>
              Mehr über Quadratblick <Arrow size={14} />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
