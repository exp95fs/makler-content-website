import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Stufe 2. Aufbau und Optik der bisherigen Markenbildungs-Sektion bleiben,
 * der Text ist auf die Positionierung geschärft.
 * Marke & Social bedeutet Produktion von einsatzfertigem Material,
 * ausdrücklich keine laufende Kanalbetreuung.
 */
const saeulen = [
  {
    title: 'Sie als Gesicht Ihres Büros',
    text: 'Wenn Sie im Objektfilm durch die Immobilie führen, sehen Eigentümer nicht nur das Objekt. Sie sehen, wer ihre Immobilie vermarkten würde.',
  },
  {
    title: 'Eine Handschrift über alle Objekte',
    text: 'Gleiche Bildsprache, gleiche Bearbeitung, gleiche Perspektivlogik. Ihr Auftritt bleibt wiedererkennbar, egal welches Objekt gerade läuft.',
  },
  {
    title: 'Material, das über den Verkauf hinaus wirkt',
    text: 'Aufnahmen aus abgeschlossenen Vermarktungen belegen Ihre Arbeit. Sie werden zum Argument beim nächsten Eigentümergespräch.',
  },
];

export function MarkeSocial() {
  return (
    <section className="v2-sec bg-sage" id="marke">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Stufe 2 · Marke &amp; Social</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Nicht nur das Objekt. Auch Ihr Maklerbüro.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Objekte kommen und gehen. Ihr Büro bleibt. Wir produzieren das Material, mit dem Sie
            zwischen den Vermarktungen sichtbar bleiben: bei Eigentümern, die noch überlegen, und
            bei Käufern, die wissen wollen, mit wem sie es zu tun haben. Sie spielen es selbst aus,
            wir übernehmen die Produktion.
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

        <div className="qb-marke-preis" data-reveal>
          <span className="k">Preis</span>
          <p>
            Für diese Stufe nennen wir keinen Listenpreis. Umfang, Frequenz und Formate
            unterscheiden sich von Büro zu Büro so deutlich, dass eine Zahl auf der Website in
            die Irre führen würde. Nach einem kurzen Gespräch über Ihre Situation erhalten Sie
            ein konkretes Angebot.
          </p>
        </div>

        <div className="v2-brand-foot" data-reveal>
          <p>Der Einstieg läuft in aller Regel über die Objektarbeit. Wer damit zufrieden ist, geht den Schritt weiter.</p>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Gespräch vereinbaren <Arrow />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
