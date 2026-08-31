import { Split } from '../fx.jsx';
import { level, erweiterungen } from '../../content/site.js';

/**
 * Umfang der Produktion. Drei Varianten, deren Namen für sich sprechen.
 * Die Erweiterungen stehen hier bewusst ohne Preise: Konfiguriert und
 * gerechnet wird im Anfrageformular, nicht in der Argumentationsstrecke.
 */
export function Umfang() {
  return (
    <section className="v2-sec bg-linen-2" id="umfang">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Umfang</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Nur Fotos, oder zusätzlich Video.
          </Split>
          <p className="v2-lead" data-reveal>
            Alle drei Varianten entstehen an demselben Termin vor Ort, ohne zweiten Besuch.
          </p>
        </div>

        <div className="qb-level">
          {level.map((l) => (
            <article className={`qb-lv ${l.empfohlen ? 'is-rec' : ''}`} key={l.key} data-reveal>
              {l.empfohlen && <span className="qb-lv-flag">Empfohlen</span>}
              <h3>{l.name}</h3>
              <p className="qb-lv-zweck">{l.zweck}</p>
              <ul>
                {l.punkte.map((p) => <li key={p}><i>—</i>{p}</li>)}
              </ul>
            </article>
          ))}
        </div>

        <div className="qb-erw" data-reveal>
          <span className="k">Zusätzlich buchbar</span>
          <p className="qb-erw-liste">
            {erweiterungen.map((e) => e.name).join(' · ')}
          </p>
          <p className="qb-erw-note">
            Die Preise dafür sehen Sie im Anfrageformular. Dort wird alles, was Sie auswählen,
            direkt mitgerechnet.
          </p>
        </div>
      </div>
    </section>
  );
}
