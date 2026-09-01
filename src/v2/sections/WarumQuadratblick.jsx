import { Split } from '../fx.jsx';

/**
 * Sechs Punkte, Texte wörtlich nach Vorgabe. Keine Gedankenstriche,
 * keine Kennzahlen-Badges: die Punkte tragen sich selbst.
 */
const punkte = [
  {
    title: 'Spezialisiert auf Immobilien',
    text: 'Wir verbinden Foto, Drohne und Video mit einem klaren Verständnis für professionelle Immobilienvermarktung. So entstehen Medien, die Objekt und Maklerbüro überzeugend präsentieren.',
  },
  {
    title: 'Ein Termin, mehrere Formate',
    text: 'Fotos, Drohnenaufnahmen, Reels und Objektfilme können an einem gemeinsamen Termin entstehen. Das spart Abstimmung und Produktionsaufwand. Diese Vorteile spiegeln sich auch im Preis wider.',
  },
  {
    title: 'Flexibel statt starrer Pakete',
    text: 'Sie buchen genau die Leistungen, die zu Ihrem Objekt und Ihren Zielen passen. Alle Formate sind einzeln verfügbar und lassen sich sinnvoll miteinander kombinieren.',
  },
  {
    title: 'Für alle relevanten Kanäle',
    text: 'Wir produzieren passende Inhalte für Exposé, Immobilienportale, Website und Social Media. So bleibt Ihre Immobilie an den entscheidenden Kontaktpunkten professionell sichtbar.',
  },
  {
    title: 'Mehrwert über das Objekt hinaus',
    text: 'Eine Produktion soll möglichst mehr leisten als nur ein einzelnes Inserat. Wo es sinnvoll ist, entstehen zusätzliche Inhalte, die länger genutzt werden können und nachhaltig auf das Markenbild Ihres Maklerbüros einzahlen.',
  },
  {
    title: 'Strategische Zusammenarbeit auf Wunsch',
    text: 'Auf Wunsch denken wir über einzelne Objekte hinaus. Mit strategisch geplanten Inhalten stärken wir Marke, Persönlichkeit und Fachkompetenz, damit Makler langfristig sichtbar werden und sich als vertrauenswürdige Ansprechpartner im Markt positionieren.',
  },
];

export function WarumQuadratblick() {
  return (
    <section className="v2-sec bg-linen-2" id="warum">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Was uns auszeichnet</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Warum Quadratblick?
          </Split>
        </div>
        <div className="v2-gruende">
          {punkte.map((g, i) => (
            <article className="v2-grund" key={g.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
