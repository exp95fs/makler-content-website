import { fotoklassen, preis } from '../../content/site.js';

/**
 * Drei sachliche Vertrauenssignale direkt unter dem Hero. Ersetzt den
 * früheren Block mit internationalen Prozentkennzahlen: keine Statistik,
 * keine Wirkungsversprechen, nur überprüfbare Aussagen.
 */
const netto = fotoklassen.map((k) => preis(k.foto).replace(' €', '')).join(', ');

const signale = [
  { t: 'Regional in Mittelbaden', x: 'Standort Bühl, im Einsatz in Baden-Baden, Achern und den umliegenden Gemeinden.' },
  { t: 'Direkter Ansprechpartner', x: 'Von der Anfrage bis zur finalen Bildauswahl sprechen Sie mit Fabian Schneebiegl.' },
  { t: 'Klare Preise nach Objektklasse', x: `${netto} € netto – je nach Objekt, vor dem Termin bestätigt.` },
];

export function Vertrauen() {
  return (
    <section className="qb-vertrauen" aria-label="Auf einen Blick">
      <div className="v2-wrap">
        <ul>
          {signale.map((s) => (
            <li key={s.t}>
              <b>{s.t}</b>
              <span>{s.x}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
