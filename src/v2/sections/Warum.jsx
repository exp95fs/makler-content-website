import { Split } from '../fx.jsx';

/**
 * Warum Quadratblick. Vier Punkte, jeder mit eigener Aussage.
 * Bewusst nicht über Bildqualität argumentiert: die ist Voraussetzung
 * und lädt sonst zum Preisvergleich ein.
 *
 * Diese Sektion ist die einzige Stelle der Seite, an der der Gedanke der
 * Mehrfachverwertung und der Vermarktungszeitraum vorkommen dürfen.
 */
const gruende = [
  {
    title: 'Alles an einem Termin',
    text: 'Fotos, Drohne und Video entstehen in einem Durchgang. Sie beauftragen einen Dienstleister statt drei und zahlen eine Anfahrt statt drei.',
  },
  {
    title: 'Über den ersten Tag hinaus gedacht',
    text: 'Ein Objekt braucht nicht nur zur Ankündigung Aufnahmen, sondern auch später noch. Wir produzieren so, dass für die Wochen danach etwas übrig ist.',
  },
  {
    title: 'Jede Aufnahme arbeitet doppelt',
    text: 'Ein Objektfilm verkauft die Immobilie. Gleichzeitig sieht ein Eigentümer, mit welchem Aufwand Ihr Büro arbeitet.',
  },
  {
    title: 'Auf den Büroalltag abgestimmt',
    text: 'Ein Ansprechpartner, feste Preise, planbare Lieferung. Kurze Wege in der Region und ausschließlich Immobilien, also keine Einarbeitung in Ihre Branche.',
  },
];

export function Warum() {
  return (
    <section className="v2-sec bg-linen-2" id="warum">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Warum Quadratblick</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Was uns von einer reinen Fotoproduktion unterscheidet.
          </Split>
          <p className="v2-lead" data-reveal>
            Gute Aufnahmen setzen wir voraus. Vier Dinge kommen dazu.
          </p>
        </div>
        <div className="v2-benefits">
          {gruende.map((g, i) => (
            <article className="v2-benefit" key={g.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <div><h3>{g.title}</h3></div>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
