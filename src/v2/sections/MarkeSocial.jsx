import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Ausblick, kein zweiter Funnel. Bewusst kurz gehalten und mit sekundärem
 * CTA: Der einzige primäre Handlungsaufruf der Seite ist die Objektanfrage.
 * Gemeint ist die Produktion von einsatzfertigem Material, ausdrücklich
 * keine laufende Kanalbetreuung.
 */
const punkte = [
  'Sie selbst im Film, statt nur das Objekt',
  'Gleiche Bildsprache über alle Ihre Objekte',
  'Fertige Beiträge, die Sie selbst hochladen',
];

export function MarkeSocial() {
  return (
    <section className="v2-sec tight bg-sage" id="marke">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Darüber hinaus</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Auch für den Auftritt Ihres Büros.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wenn wir ohnehin regelmäßig für Sie vor Ort sind, entsteht daraus auch Material für
            Ihr Büro selbst: für Ihre Website, Ihre Social-Media-Kanäle und das nächste
            Eigentümergespräch.
          </p>
        </div>

        <ul className="qb-teaser-punkte" data-reveal>
          {punkte.map((p) => <li key={p}>{p}</li>)}
        </ul>

        <div className="v2-brand-foot" data-reveal>
          <p>
            Dafür gibt es keinen Listenpreis, weil Umfang und Häufigkeit sich je Büro stark
            unterscheiden. Nach einem kurzen Gespräch erhalten Sie ein Angebot. Der Einstieg
            läuft in aller Regel über die Objektarbeit.
          </p>
          <Magnetic>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('anfrage')}>
              Darüber sprechen <Arrow size={15} />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
