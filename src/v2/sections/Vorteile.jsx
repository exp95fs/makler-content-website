import { Split } from '../fx.jsx';
import { fotoklassen, ergaenzungen, preis, preisNetto } from '../../content/site.js';

/**
 * Konkrete Vorteile. Je Punkt höchstens zwei kurze Sätze, keine
 * Superlative, keine absoluten Versprechen, keine Wirkungsbehauptungen.
 */
const drohne = ergaenzungen.find((e) => e.key === 'drohne');
const stufen = fotoklassen.map((k) => preis(k.foto).replace(' €', '')).join(', ');

const punkte = [
  {
    t: 'Auf Immobilien spezialisiert',
    x: 'Quadratblick ist auf Immobilienfotografie spezialisiert. Aufnahmen und Bearbeitung sind auf Exposés und Immobilienportale ausgerichtet.',
  },
  {
    t: 'Direkter Ansprechpartner',
    x: 'Sie stimmen sich direkt mit Fabian Schneebiegl ab. Er begleitet Ihr Projekt persönlich bis zur finalen Bildauswahl.',
  },
  {
    t: 'Klare Preise nach Objektklasse',
    x: `Die Objektklasse bestimmt den Preis: ${stufen} € netto. Umfang, Preis und Termin werden vorab persönlich bestätigt.`,
  },
  {
    t: 'Natürliche Bildbearbeitung',
    x: 'Die Bearbeitung zielt auf eine realistische, stimmige Bildwirkung. Räume sollen so erscheinen, wie sie bei einer Besichtigung wirken.',
  },
  {
    t: 'Regional aus Bühl',
    x: 'Standort ist Bühl. Im Einsatz in Baden-Baden, Achern und den umliegenden Gemeinden in Mittelbaden.',
  },
  {
    t: 'Drohnenaufnahmen optional',
    x: `Luftaufnahmen lassen sich für ${preisNetto(drohne.preis)} ergänzen, sofern rechtlich zulässig und die Witterung es erlaubt.`,
  },
];

export function Vorteile() {
  return (
    <section className="v2-sec bg-linen-2" id="vorteile" aria-labelledby="vorteile-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Vorteile</p>
          <Split as="h2" id="vorteile-titel" className="v2-h-display v2-h-lg">
            Was Sie bei Quadratblick erwarten können.
          </Split>
        </div>
        <ul className="v2-gruende">
          {punkte.map((g, i) => (
            <li className="v2-grund" key={g.t} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num" aria-hidden="true">0{i + 1}</span>
              <h3>{g.t}</h3>
              <p>{g.x}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
