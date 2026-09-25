import { Split } from '../fx.jsx';
import { ablauf, CTA } from '../../content/site.js';

/**
 * Der Ablauf einer Produktion als eigene Sektion, wie im bisherigen
 * Onepager. Texte der Schritte stehen in site.js (`ablauf`), dort auch die
 * Korrekturen zur Eigentümerkoordination und zur Bereitstellung.
 */
export function Ablauf() {
  return (
    <section className="v2-sec bg-linen-2" id="ablauf" aria-labelledby="ablauf-titel">
      <div className="v2-wrap">
        <div className="qb-ablauf">
          <div className="kopf">
            <p className="v2-eyebrow" data-reveal>Ablauf</p>
            <Split as="h2" id="ablauf-titel" className="v2-h-display v2-h-lg">
              So läuft die Zusammenarbeit.
            </Split>
            <p className="v2-lead" data-reveal>
              Sie stellen die Anfrage, den Rest begleiten wir: von der Abstimmung bis zu
              den fertigen Bildern.
            </p>
            <div className="ctas" data-reveal>
              <a className="v2-btn ghost sm" href="#booking" data-event="cta_primary">{CTA.termin}</a>
              <a className="v2-btn ghost sm" href="#kontakt" data-event="cta_kontakt">{CTA.kontakt}</a>
            </div>
          </div>

          <ol className="liste">
            {ablauf.map((s, i) => (
              <li key={s.t} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
                <span className="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <p className="x">{s.x}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
