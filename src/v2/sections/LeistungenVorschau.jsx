import { Split } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { images, abPreis, preisStern } from '../../content/site.js';

/**
 * Erste Sektion nach dem Hero, wie im bisherigen Onepager: das
 * Leistungsversprechen mit drei Vorteilen und einer versetzten
 * Bildstrecke.
 *
 * Korrigiert gegenüber der früheren Fassung: kein "nachweislich schneller
 * vermittelt", keine Eigentümerkoordination als Standard (erst bei
 * eingespielter Zusammenarbeit und auf Wunsch), "begleiten" statt
 * "übernehmen den gesamten Prozess".
 */
const vorteile = [
  {
    t: 'Ein Inserat, das heraussticht',
    x: 'Hochwertige Bilder heben Ihr Inserat aus der Masse der Portale heraus und zeigen '
      + 'das Objekt so, wie es sich am besten präsentiert.',
  },
  {
    t: 'Zeit, die in Ihrem Büro bleibt',
    x: 'Vorbereitung, Aufnahme und Bearbeitung liegen bei uns. Ist die Zusammenarbeit '
      + 'eingespielt, stimmen wir auf Wunsch auch den Termin direkt mit dem Eigentümer ab. '
      + 'So bleibt Ihre Zeit dort, wo sie Umsatz macht: beim Verkaufen.',
  },
  {
    t: 'Sichtbar für den nächsten Eigentümer',
    x: 'Eigentümer vergleichen, wie Büros Objekte präsentieren. Wer sichtbar hochwertig '
      + 'vermarktet, empfiehlt sich für das nächste Mandat.',
  },
];

const STRECKE = '(max-width: 900px) 76vw, 36vw';

export function LeistungenVorschau() {
  const [haupt, zwei, drei] = images.inserat.bilder;

  return (
    <section className="v2-sec bg-linen" id="leistungen" aria-labelledby="leistungen-titel">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Unser Leistungsversprechen</p>
            <Split as="h2" id="leistungen-titel" className="v2-h-display v2-h-lg">
              Wir liefern nicht nur hochwertige Bilder. Wir begleiten den gesamten Prozess.
            </Split>
            <p className="v2-lead" data-reveal>
              Von der Abstimmung über den Fototermin bis zur Bereitstellung der fertigen
              Bilder haben Sie einen festen Ansprechpartner.
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
              <a className="v2-btn" href="#preise">
                Pakete und Preise <Arrow size={16} />
              </a>
              <span className="ab">Festpreis ab {preisStern(abPreis())}</span>
            </div>
            <p className="qb-mehr-link" data-reveal>
              <a className="v2-link-inline on-light" href={SEITEN.immobilienfotografie.pfad}>
                Mehr zur Immobilienfotografie <Arrow size={14} />
              </a>
            </p>
          </div>

          <div className="bild">
            <figure className="qb-strecke" data-reveal data-delay="0.12">
              <span className="a"><Bild src={haupt.src} alt={haupt.alt} sizes={STRECKE} /></span>
              <span className="b"><Bild src={zwei.src} alt={zwei.alt} sizes="(max-width: 900px) 42vw, 20vw" /></span>
              <span className="c"><Bild src={drei.src} alt={drei.alt} sizes="(max-width: 900px) 48vw, 23vw" /></span>
              <figcaption>{images.inserat.label}</figcaption>
            </figure>
            <a className="mehr" href="#referenzen" data-event="referenzen_aufruf">
              Mehr Arbeitsproben <Arrow size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
