import { Split } from '../fx.jsx';
import { prozess } from '../../content/site.js';

/**
 * Der tatsächliche Ablauf in vier Schritten, wie freigegeben. Keine
 * Lieferzeit, keine pauschale Eigentümerkoordination beim ersten Projekt.
 */
export function Prozess({ bg = 'bg-linen' }) {
  return (
    <section className={`v2-sec ${bg}`} id="ablauf" aria-labelledby="ablauf-titel">
      <div className="v2-wrap">
        <div className="qb-ablauf">
          <div className="kopf">
            <p className="v2-eyebrow" data-reveal>Ablauf</p>
            <Split as="h2" id="ablauf-titel" className="v2-h-display v2-h-lg">
              So läuft ein Projekt ab.
            </Split>
            <p className="v2-lead" data-reveal>
              Vier Schritte von der Anfrage bis zu den fertigen Bildern. Termin, Umfang
              und Preis werden vorab persönlich bestätigt.
            </p>
          </div>
          <ol className="liste">
            {prozess.map((s, i) => (
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
