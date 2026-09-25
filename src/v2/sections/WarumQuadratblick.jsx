import { Split } from '../fx.jsx';

/**
 * Sechs Gründe, Gestaltung wie im bisherigen Onepager.
 *
 * Korrigiert gegenüber der früheren Fassung: Video nur zurückhaltend und
 * individuell, keine Zusage "keine Nachberechnung", keine pauschale
 * Eigentümerkoordination und kein "Sie müssen nicht vor Ort sein", kein
 * zugesagter Liefertermin, kein Preisvorteil durch Kombination.
 */
const punkte = [
  {
    title: 'Spezialisiert auf Immobilien',
    text: 'Wir verbinden Fotografie, Drohne und Video mit einem klaren Verständnis für professionelle Immobilienvermarktung. So entstehen Medien, die Objekt und Maklerbüro überzeugend präsentieren.',
  },
  {
    title: 'Fester Preis für die Produktion',
    text: 'Sie wissen vor dem Termin, was die Produktion kostet. Der Preis richtet sich nach der Objektklasse, nicht nach Stunden. Zusätzliche Wünsche nach dem Termin stimmen wir vorab mit Ihnen ab.',
  },
  {
    title: 'Wenig Aufwand auf Ihrer Seite',
    text: 'Sie nennen uns Objekt und Wunschtermin, Vorbereitung, Aufnahme und Bearbeitung liegen bei uns. Ist die Zusammenarbeit eingespielt, übernehmen wir auf Wunsch auch die Terminabstimmung mit dem Eigentümer.',
  },
  {
    title: 'Ein klarer, durchdachter Ablauf',
    text: 'Checkliste zur Objektvorbereitung, klare Abstimmung, vereinbarter Zeitpunkt der Bereitstellung. Jeder Schritt ist festgelegt, damit die Produktion reibungslos läuft.',
  },
  {
    title: 'Wir treten in Ihrem Namen auf',
    text: 'Beim Termin vor Ort begegnen wir dem Eigentümer als Teil Ihrer Vermarktung. Wir verstehen uns nicht als unabhängige Dienstleister, sondern als Vertretung Ihres Büros in einem sensiblen Moment.',
  },
  {
    title: 'Ein Termin, mehrere Formate',
    text: 'Fotos, Drohnenaufnahmen und ein Objekt-Kurzvideo können an einem gemeinsamen Termin entstehen. Das spart Abstimmung und einen zweiten Vor-Ort-Termin.',
  },
];

export function WarumQuadratblick() {
  return (
    <section className="v2-sec bg-linen-2" id="warum" aria-labelledby="warum-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Was uns auszeichnet</p>
          <Split as="h2" id="warum-titel" className="v2-h-display v2-h-lg">
            Warum Quadratblick?
          </Split>
        </div>
        <ul className="v2-gruende">
          {punkte.map((g, i) => (
            <li className="v2-grund" key={g.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num" aria-hidden="true">0{i + 1}</span>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
