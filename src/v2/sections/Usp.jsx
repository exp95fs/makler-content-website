import { Split } from '../fx.jsx';

/**
 * "Alles aus einer Hand" von der Live-Seite. Punkte 1, 3 und 4 wörtlich.
 * Punkt 2 hieß dort "Bewusst auf wenige Kunden begrenzt" und ist durch
 * einen Punkt zur planbaren Abwicklung ersetzt: Die alte Aussage weckt
 * bei Maklerbüros Zweifel an der Lieferfähigkeit.
 */
const usps = [
  {
    title: 'Alles aus einer Hand',
    text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff, alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.',
  },
  {
    title: 'Planbare Abwicklung',
    text: 'Ein fester Ansprechpartner, eine klare Vorbereitung des Objekts und ein zugesagter Liefertermin. Sie wissen vor dem Termin, was wann bei Ihnen ankommt.',
  },
  {
    title: 'Konsistenter, hochwertiger Look',
    text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht. Objekt für Objekt wiedererkennbar.',
  },
  {
    title: 'Gedacht aus Sicht der Zielgruppe',
    text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.',
  },
];

export function Usp() {
  return (
    <section className="v2-sec bg-linen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Was uns von anderen Anbietern unterscheidet</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Alles aus einer Hand. Gedacht aus Sicht Ihrer Zielgruppe.
          </Split>
        </div>
        <div className="v2-usps">
          {usps.map((u, i) => (
            <div className="v2-usp" key={u.title} data-reveal data-delay={Math.min(i * 0.08, 0.24)}>
              <span className="big-num">{i + 1}</span>
              <h3>{u.title}</h3>
              <p>{u.text}</p>
            </div>
          ))}
        </div>
        <div className="v2-chance" data-reveal>
          <span className="label">Die Chance</span>
          <p>
            Nur rund 9 % der Makler produzieren objektspezifische Videos, in unserer Region noch
            weniger. Wer jetzt in gutes Bewegtbild investiert, hebt sich sichtbar vom Markt ab.
          </p>
        </div>
      </div>
    </section>
  );
}
