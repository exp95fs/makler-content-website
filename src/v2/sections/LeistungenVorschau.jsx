import { Split, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { images, fotoklassen, preisStern } from '../../content/site.js';

/**
 * Erste Sektion nach dem Hero. Sie trägt das Leistungsversprechen: gute
 * Bilder sind das Produkt, der übernommene Prozess ist der Grund, warum ein
 * Büro damit keine Zeit verliert.
 *
 * Die drei Punkte sind bewusst als Vorteile formuliert, nicht als
 * Leistungsumfang. Was enthalten ist, steht in der Ablaufsektion.
 *
 * Rechts eine Bildstrecke: ein Hauptbild mit zwei kleineren, versetzt
 * darüber gelegt.
 */
const vorteile = [
  {
    t: 'Nachweislich schneller vermittelt',
    x: 'Ein Inserat, das aus der Masse heraussticht, wird häufiger geöffnet, bringt '
      + 'qualifiziertere Anfragen und wird nachweislich schneller vermittelt.',
  },
  {
    t: 'Zeit, die in Ihrem Büro bleibt',
    x: 'Sie schicken uns den Kontakt zum Eigentümer, wir liefern die fertigen Bilder. '
      + 'Alles dazwischen übernehmen wir, damit Ihre Zeit dort bleibt, wo sie Umsatz macht: '
      + 'beim Verkaufen.',
  },
  {
    t: 'Sichtbar für den nächsten Eigentümer',
    x: 'Eigentümer vergleichen, wie Büros Objekte präsentieren. Wer sichtbar hochwertig '
      + 'vermarktet, empfiehlt sich für das nächste Mandat.',
  },
];

export function LeistungenVorschau() {
  const ab = Math.min(...fotoklassen.map((k) => k.foto));
  const [haupt, zwei, drei] = images.inserat.bilder;

  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Unser Leistungsversprechen</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Wir liefern nicht nur hochwertige Bilder. Wir übernehmen den gesamten Prozess.
            </Split>
            <p className="v2-lead" data-reveal>
              Von der Terminabstimmung mit dem Eigentümer bis zur Auslieferung der
              fertigen Bilder läuft alles über uns.
            </p>
            <ol className="punkte" data-reveal>
              {vorteile.map((a, i) => (
                <li key={a.t}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <b>{a.t}</b>
                  <span className="x">{a.x}</span>
                </li>
              ))}
            </ol>
            <div className="fuss" data-reveal>
              <button type="button" className="v2-btn" onClick={() => scrollToId('preise')}>
                Pakete und Preise <Arrow size={16} />
              </button>
              <span className="ab">Festpreis ab {preisStern(ab)}</span>
            </div>
          </div>

          <div className="bild">
            <figure className="qb-strecke" data-reveal data-delay="0.12">
              <span className="a">
                <img src={haupt.src} alt={haupt.alt} loading="lazy" width="1400" height="933" />
              </span>
              <span className="b">
                <img src={zwei.src} alt={zwei.alt} loading="lazy" width="1400" height="933" />
              </span>
              <span className="c">
                <img src={drei.src} alt={drei.alt} loading="lazy" width="1400" height="933" />
              </span>
              <figcaption>{images.inserat.label}</figcaption>
            </figure>
            <button type="button" className="mehr" onClick={() => scrollToId('referenzen')}>
              Mehr Arbeitsproben <Arrow size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
