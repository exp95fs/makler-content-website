import { Split, scrollToId } from '../fx.jsx';
import { ablauf } from '../../content/site.js';

/**
 * Der Ablauf einer Produktion als eigene Sektion.
 *
 * Stand vorher als Aufzählung in der Preissektion und machte sie
 * unübersichtlich. Hier trägt jeder Schritt seinen eigenen Wert: nicht
 * "Bearbeitung", sondern was in der Bearbeitung tatsächlich passiert.
 *
 * Die Sektion ersetzt das frühere "So läuft's ab".
 */
export function Ablauf() {
  return (
    <section className="v2-sec bg-linen-2" id="ablauf">
      <div className="v2-wrap">
        <div className="qb-ablauf">
          <div className="kopf">
            <p className="v2-eyebrow" data-reveal>Ablauf</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              So läuft die Zusammenarbeit.
            </Split>
            <p className="v2-lead" data-reveal>
              Ein Schritt liegt bei Ihnen. Den Rest übernehmen wir, vom ersten Kontakt
              mit dem Eigentümer bis zu den fertigen Bildern.
            </p>
            <div className="ctas" data-reveal>
              <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('booking')}>
                Objekt anfragen
              </button>
              <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('kontakt')}>
                Erst kurz sprechen
              </button>
            </div>
          </div>

          <ol className="liste">
            {ablauf.map((s, i) => (
              <li key={s.t} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <b>{s.t}</b>
                <span className="x">{s.x}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
