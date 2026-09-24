import { Split, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { images, fotoklassen, preis } from '../../content/site.js';

/**
 * Erste Sektion nach dem Hero. Sie trägt das Leistungsversprechen: gute
 * Bilder sind das Produkt, der übernommene Ablauf ist der Grund, warum ein
 * Büro damit keine Zeit verliert.
 *
 * Die drei Punkte sind bewusst als Vorteile formuliert, nicht als
 * Leistungsumfang. Was enthalten ist, steht weiter unten bei den Paketen.
 *
 * Rechts stehen zwei Bildstrecken als Teaser: je ein Hauptbild mit zwei
 * kleineren, versetzt darüber gelegt.
 */
const vorteile = [
  {
    t: 'Schneller vermittelt',
    x: 'Ein Inserat, das aus der Masse heraussticht, wird häufiger geöffnet und bringt ernsthaftere Anfragen.',
  },
  {
    t: 'Zeit, die in Ihrem Büro bleibt',
    x: 'Terminabstimmung mit dem Eigentümer, Aufnahme und Bearbeitung laufen über uns. Ihr Aufwand endet mit der Anfrage.',
  },
  {
    t: 'Sichtbar für den nächsten Eigentümer',
    x: 'Eigentümer vergleichen, wie Büros Objekte präsentieren. Wer sichtbar hochwertig vermarktet, empfiehlt sich für das nächste Mandat.',
  },
];

function Bildstrecke({ inserat, versatz }) {
  const [haupt, zwei, drei] = inserat.bilder;
  return (
    <figure className={`qb-strecke ${versatz}`}>
      <span className="a">
        <img src={haupt.src} alt={haupt.alt} loading="lazy" width="1400" height="933" />
      </span>
      <span className="b">
        <img src={zwei.src} alt={zwei.alt} loading="lazy" width="1400" height="933" />
      </span>
      <span className="c">
        <img src={drei.src} alt={drei.alt} loading="lazy" width="1400" height="933" />
      </span>
      <figcaption>{inserat.label}</figcaption>
    </figure>
  );
}

export function LeistungenVorschau() {
  const ab = Math.min(...fotoklassen.map((k) => k.foto));

  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Leistungsversprechen</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Wir liefern nicht nur Bilder. Wir übernehmen die Produktion.
            </Split>
            <p className="v2-lead" data-reveal>
              Von der Terminabstimmung mit dem Eigentümer bis zur Auslieferung der
              fertigen Bilder läuft alles über uns. Ihr Inserat hebt sich ab, und
              die Zeit dafür bleibt in Ihrem Büro.
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
              <span className="ab">Festpreis ab {preis(ab)} netto</span>
            </div>
          </div>

          <div className="bild">
            <div className="qb-strecken" data-reveal data-delay="0.12">
              <Bildstrecke inserat={images.inserate[0]} versatz="hoch" />
              <Bildstrecke inserat={images.inserate[1]} versatz="tief" />
            </div>
            <button type="button" className="mehr" onClick={() => scrollToId('referenzen')}>
              Mehr Arbeitsproben <Arrow size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
