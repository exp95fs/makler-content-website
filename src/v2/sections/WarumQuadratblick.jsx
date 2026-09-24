import { Split } from '../fx.jsx';

/**
 * Sechs Punkte ohne Gedankenstriche und ohne Kennzahlen-Badges.
 * Schwerpunkt liegt auf den Zusagen, die Quadratblick tatsächlich
 * einlösen kann: Festpreis, kein Aufwand beim Makler, festgelegter
 * Ablauf und das Auftreten gegenüber dem Eigentümer.
 */
const punkte = [
  {
    title: 'Spezialisiert auf Immobilien',
    text: 'Wir verbinden Foto, Drohne und Video mit einem klaren Verständnis für professionelle Immobilienvermarktung. So entstehen Medien, die Objekt und Maklerbüro überzeugend präsentieren.',
  },
  {
    title: 'Fester Preis, keine Überraschung',
    text: 'Sie wissen vor dem Termin, was die Produktion kostet. Kein Preis nach Aufwand, keine Nachberechnung, keine Ab-Preise, bei denen sich erst später zeigt, wo Sie landen.',
  },
  {
    title: 'Kein Aufwand auf Ihrer Seite',
    text: 'Von der Terminabstimmung mit dem Eigentümer bis zur fertigen Bildauswahl übernehmen wir den gesamten Ablauf. Sie müssen nicht vor Ort sein und nichts koordinieren.',
  },
  {
    title: 'Ein bewährter, durchdachter Ablauf',
    text: 'Checkliste zur Objektvorbereitung, klare Abstimmung, zugesagter Liefertermin. Jeder Schritt ist festgelegt, damit die Produktion reibungslos läuft, ohne dass Sie sich darum kümmern.',
  },
  {
    title: 'Wir treten in Ihrem Namen auf',
    text: 'Beim Termin vor Ort begegnen wir dem Eigentümer als Teil Ihrer Vermarktung. Wir verstehen uns nicht als unabhängige Dienstleister, sondern als Vertretung Ihres Büros in einem sensiblen Moment.',
  },
  {
    title: 'Ein Termin, mehrere Formate',
    text: 'Fotos, Drohnenaufnahmen und vertikale Clips können an einem gemeinsamen Termin entstehen. Das spart Abstimmung und Produktionsaufwand. Diese Vorteile spiegeln sich auch im Preis wider.',
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
