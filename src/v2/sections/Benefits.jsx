import { Split } from '../fx.jsx';

/**
 * "Sechs Gründe" von der Live-Seite. Texte und Badges wörtlich übernommen.
 * Darstellung wie live: drei Spalten, zwei Reihen, als Karten.
 */
const gruende = [
  {
    title: 'Objekte heben sich ab',
    text: 'Im Portal entscheidet das erste Bild. Profi-Fotos bringen spürbar mehr Aufmerksamkeit.',
    kpi: '+61 % mehr Aufrufe',
  },
  {
    title: 'Bleiben im Kopf',
    text: 'Video vermittelt Raumgefühl, Licht und Laufwege. Interessenten erinnern sich an Ihr Objekt, nicht an das nächste in der Liste.',
  },
  {
    title: 'Schneller vermittelt',
    text: 'Bessere Darstellung verkürzt die Zeit am Markt nachweislich, bei Fotos wie bei Video.',
    kpi: 'bis zu ~32 % schneller',
  },
  {
    title: 'Qualifiziertere Anfragen',
    text: 'Wer das Objekt im Video gesehen hat, meldet sich gezielter. Weniger Besichtigungstourismus, weniger vergeudete Termine.',
  },
  {
    title: 'Repräsentiert Ihr Büro',
    text: 'Konsistenter, hochwertiger Content zeigt Ihren Qualitätsanspruch. Bei Eigentümern wie bei Käufern.',
  },
  {
    title: 'Baut Ihre Marke',
    text: 'Reels und Maklerpräsenz arbeiten auch für Sie, nicht nur fürs Objekt.',
    kpi: '71 % wählen Makler mit starker Online-Präsenz',
  },
];

export function Benefits() {
  return (
    <section className="v2-sec bg-linen-2" id="gruende">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Warum hochwertiger Content</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Sechs Gründe, warum sich der Invest in guten Content rechnet.
          </Split>
          <p className="v2-lead" data-reveal>
            Hochwertige Fotos und Videos sind kein Schmuck fürs Inserat. Sie sind ein messbarer
            Hebel auf Anfragen, Vermittlungsdauer und das Bild, das Ihr Büro abgibt.
          </p>
        </div>
        <div className="v2-gruende">
          {gruende.map((g, i) => (
            <article className="v2-grund" key={g.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <h3>{g.title}</h3>
              <p>{g.text}</p>
              {g.kpi && <span className="kpi">{g.kpi}</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
