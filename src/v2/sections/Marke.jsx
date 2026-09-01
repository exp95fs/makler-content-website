import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/** "Markenbildung" von der Live-Seite. Texte wörtlich übernommen. */
const saeulen = [
  {
    title: 'Konsistente Bildsprache',
    text: 'Eine durchgängige Handschrift über alle Objekte hinweg. Ihr Büro wird auf den ersten Blick wiedererkannt.',
  },
  {
    title: 'Sie als Gesicht der Region',
    text: 'Makler-Reels, Porträt- und Experten-Content, der Vertrauen aufbaut, bevor das erste Gespräch beginnt.',
  },
  {
    title: 'Strategie statt Einzelclips',
    text: 'Ein roter Faden für Portale, Social Media und Website. Strategisch geplant, nicht zufällig zusammengestellt.',
  },
];

export function Marke() {
  return (
    <section className="v2-sec bg-sage" id="marke">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Markenbildung</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Nicht nur das Objekt – Ihr Maklerbüro als Marke.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Einzelne Objekte zu vermarkten ist der Anfang. Der eigentliche Hebel liegt darin, Sie
            und Ihr Büro als feste Größe in der Region sichtbar zu machen, ob etabliertes
            Maklerbüro oder eigenständiger Makler.
          </p>
        </div>

        <div className="v2-brand-grid">
          {saeulen.map((p, i) => (
            <div className="v2-brand-cell" key={p.title} data-reveal data-delay={i * 0.12}>
              <span className="num">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>

        <div className="v2-brand-foot" data-reveal>
          <p>Wir starten beim einzelnen Objekt und bauen daraus Schritt für Schritt Ihre Marke.</p>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Markenbildung besprechen <Arrow />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
