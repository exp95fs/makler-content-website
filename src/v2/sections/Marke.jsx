import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Teaser, kein zweiter Funnel. Bewusst kurz und mit sekundärem CTA:
 * Der primäre Weg ist die Buchung unter #preise.
 */
const punkte = [
  'Gemeinsam festgelegt, welche Inhalte auf welchen Kanälen laufen',
  'Wiedererkennbare Bildsprache über alle Objekte hinweg',
  'Sie als Gesicht Ihres Büros, nicht nur die Immobilie',
];

export function Marke() {
  return (
    <section className="v2-sec tight bg-sage" id="marke">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Marke &amp; Social</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Für Bestandskunden auch über das einzelne Objekt hinaus.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Mit ausgewählten Maklerbüros arbeiten wir langfristig zusammen. Wir legen gemeinsam
            fest, welche Inhalte für welche Kanäle in welchem Umfang sinnvoll sind, damit Sie Ihre
            Ziele bei Sichtbarkeit und Vertrauen erreichen.
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
            <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('kontakt')}>
              Darüber sprechen <Arrow size={15} />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
