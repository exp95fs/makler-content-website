import { fotoklassen, preis } from '../../content/site.js';

/**
 * Band unter dem Hero in der Gestaltung des früheren Kennzahlenbands.
 *
 * Die früheren internationalen Prozentwerte (Anfragen mit Video,
 * Vermittlungsdauer, Verkäuferpräferenzen) sind nicht belegt und werden
 * nicht mehr gezeigt. Stattdessen stehen hier drei überprüfbare Aussagen
 * zu Region, Ansprechpartner und Preis - ohne Zählanimation, ohne
 * Wirkungsversprechen.
 */
const preise = fotoklassen.map((k) => k.foto);
const spanne = `${Math.min(...preise)}–${preis(Math.max(...preise))} *`;

const signale = [
  { wert: 'Mittelbaden', label: 'Standort Bühl, im Einsatz in Baden-Baden, Achern und Umgebung' },
  { wert: '1 Ansprechpartner', label: 'Von der Anfrage bis zur fertigen Bildauswahl: Fabian Schneebiegl' },
  { wert: spanne, label: 'Festpreis je Objektklasse, vor dem Termin bestätigt' },
];

export function StatBar() {
  return (
    <section className="v2-stats qb-signale" aria-label="Auf einen Blick">
      <div className="v2-wrap">
        <ul className="v2-stats-grid">
          {signale.map((s) => (
            <li className="v2-stat" key={s.label}>
              <span className="v2-stat-num">{s.wert}</span>
              <span className="v2-stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
