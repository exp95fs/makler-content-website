import { Split } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';

/**
 * Regelmäßige Zusammenarbeit. Die direkte Eigentümer- und Terminkoordination
 * ist KEIN Standardversprechen für den ersten Auftrag, sondern eine Option
 * bei eingespielter Zusammenarbeit. Keine Kontingent- oder Rahmenpreise.
 */
export function Zusammenarbeit() {
  return (
    <section className="v2-sec tight bg-sage" id="zusammenarbeit" aria-labelledby="zusammenarbeit-titel">
      <div className="v2-wrap">
        <div className="qb-zusammenarbeit">
          <div>
            <p className="v2-eyebrow on-dark" data-reveal>Für Makler</p>
            <Split as="h2" id="zusammenarbeit-titel" className="v2-h-display v2-h-lg">
              Weniger Koordination bei eingespielter Zusammen­arbeit
            </Split>
          </div>
          <div>
            <p className="v2-lead on-dark" data-reveal>
              Bei den ersten Projekten stimmen wir Ablauf und Erwartungen persönlich miteinander
              ab. Wenn die Zusammenarbeit eingespielt ist, kann Quadratblick auf Wunsch die
              direkte Terminabstimmung mit Eigentümern übernehmen. Sie übergeben den Kontakt und
              erhalten die fertigen Bilder.
            </p>
            <div className="ctas" data-reveal>
              <a className="v2-btn on-dark" href={`${SEITEN.anfrage.pfad}?anliegen=zusammenarbeit#kontakt`}
                 data-event="cta_zusammenarbeit">
                Regelmäßige Zusammenarbeit besprechen <Arrow size={16} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
