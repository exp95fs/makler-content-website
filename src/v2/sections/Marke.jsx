import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Kurzer, nachgeordneter Teaser für Bestandskunden, wie im bisherigen
 * Onepager. Kein zweiter Funnel, kein eigenes Angebot, kein Listenpreis.
 *
 * Korrigiert: keine Aussage über bestehende langfristige Zusammenarbeit
 * mit "ausgewählten Maklerbüros" und kein Zielversprechen.
 */
const punkte = [
  'Gemeinsam festgelegt, welche Inhalte auf welchen Kanälen sinnvoll sind',
  'Wiedererkennbare Bildsprache über alle Objekte hinweg',
  'Auf Wunsch Sie als Gesicht Ihres Büros, nicht nur die Immobilie',
];

export function Marke() {
  return (
    <section className="v2-sec tight bg-sage" id="marke" aria-labelledby="marke-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Marke &amp; Social</p>
          <Split as="h2" id="marke-titel" className="v2-h-display v2-h-lg">
            Für Bestandskunden auch über das einzelne Objekt hinaus.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wenn die Zusammenarbeit bei Objekten eingespielt ist, legen wir auf Wunsch gemeinsam
            fest, welche Inhalte für welche Kanäle in welchem Umfang sinnvoll sind.
          </p>
        </div>

        <ul className="qb-teaser-punkte" data-reveal>
          {punkte.map((p) => <li key={p}>{p}</li>)}
        </ul>

        <div className="v2-brand-foot" data-reveal>
          <p>
            Dafür gibt es keinen Listenpreis, weil Umfang und Frequenz sich je Büro stark
            unterscheiden. Nach einem kurzen Gespräch erhalten Sie ein Angebot.
          </p>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href="#kontakt" data-event="cta_zusammenarbeit">
              Darüber sprechen <Arrow size={15} />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
