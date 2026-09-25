import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { CTA, zusammenarbeit } from '../../content/site.js';

/**
 * Regelmäßige Zusammenarbeit für Maklerbüros und Immobilienabteilungen.
 * Ersetzt die frühere Marken-Sektion, gleiche Fläche (bg-sage).
 * Texte in site.js (`zusammenarbeit`).
 *
 * Der CTA führt zum Kontaktformular und wählt dort das Anliegen
 * "Regelmäßig mehrere Objekte" vor (Ereignis `qb:anliegen`, siehe
 * Kontakt.jsx). Ohne JavaScript bleibt es ein normaler Anker auf #kontakt.
 */
export function RegelmaessigeZusammenarbeit() {
  const vorwaehlen = () => {
    window.dispatchEvent(new CustomEvent('qb:anliegen', { detail: zusammenarbeit.anliegen }));
  };

  return (
    <section className="v2-sec bg-sage" id="zusammenarbeit" aria-labelledby="zusammenarbeit-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>{zusammenarbeit.eyebrow}</p>
          <Split as="h2" id="zusammenarbeit-titel" className="v2-h-display v2-h-lg">
            {zusammenarbeit.titel}
          </Split>
          <p className="v2-lead on-dark" data-reveal>{zusammenarbeit.lead}</p>
        </div>

        <ul className="qb-zusammen-punkte" data-reveal>
          {zusammenarbeit.punkte.map((p) => (
            <li key={p.t}>
              <h3>{p.t}</h3>
              <p>{p.x}</p>
            </li>
          ))}
        </ul>

        <div className="qb-zusammen-start" data-reveal>
          <h3>{zusammenarbeit.startTitel}</h3>
          <ol>
            {zusammenarbeit.start.map((schritt, i) => (
              <li key={schritt}>
                <span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span>{schritt}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="qb-zusammen-cta" data-reveal>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href="#kontakt" data-event="cta_zusammenarbeit" onClick={vorwaehlen}>
              {CTA.kontakt} <Arrow size={15} />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
