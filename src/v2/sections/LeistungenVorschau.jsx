import { Split } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { images, kennzahlenQuelle } from '../../content/site.js';

/**
 * Erste Sektion nach dem Hero, wie im bisherigen Onepager: das
 * Leistungsversprechen mit drei Vorteilen und einer versetzten
 * Bildstrecke.
 *
 * Eigentümerabstimmung als Option, nicht als Standard. Die Studienaussage
 * in Punkt 01 trägt ein Sternchen; die Quelle steht unter der Liste
 * (dieselbe Angabe wie im Kennzahlenband, `kennzahlenQuelle`).
 */
const vorteile = [
  {
    t: 'Nachweislich schneller vermittelt*',
    x: 'Ein Inserat, das aus der Masse heraussticht, fällt im Portal auf und wird häufiger '
      + 'angeklickt. Professionell fotografierte Häuser werden im Schnitt deutlich schneller '
      + 'verkauft.*',
  },
  {
    t: 'Vorbereitung, die vor Ort Zeit spart',
    x: 'Vorab erhalten Sie eine Checkliste, auf Wunsch auch für den Eigentümer. Wenn Sie '
      + 'möchten, stimmen wir den Termin direkt mit dem Eigentümer ab.',
  },
  {
    t: 'Sichtbar für den nächsten Eigentümer',
    x: 'Eigentümer vergleichen, wie Büros Objekte präsentieren. Wer sichtbar hochwertig '
      + 'vermarktet, empfiehlt sich für das nächste Mandat.',
  },
];

const STRECKE = '(max-width: 900px) 86vw, 46vw';

export function LeistungenVorschau() {
  const [haupt, zwei, drei] = images.strecke.bilder.map((i) => images.referenzen[i]);

  return (
    <section className="v2-sec bg-linen" id="leistungen" aria-labelledby="leistungen-titel">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Unser Leistungsversprechen</p>
            <Split as="h2" id="leistungen-titel" className="v2-h-display v2-h-lg">
              Ein Ablauf, auf den sich Ihr Büro verlassen kann.
            </Split>
            <p className="v2-lead" data-reveal>
              Von der Anfrage bis zu den fertigen Bildern haben Sie einen festen
              Ansprechpartner. Termin, Umfang, Preis und Bereitstellungszeitpunkt stehen mit
              unserer Bestätigung fest.
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
            <p className="qb-quelle" data-reveal>{kennzahlenQuelle}</p>
            <div className="fuss" data-reveal>
              <a className="v2-btn" href="#preise">
                Pakete und Preise <Arrow size={16} />
              </a>
            </div>
          </div>

          <div className="bild">
            <figure className="qb-strecke" data-reveal data-delay="0.12">
              <span className="a"><Bild src={haupt.src} alt={haupt.alt} sizes={STRECKE} /></span>
              <span className="b"><Bild src={zwei.src} alt={zwei.alt} sizes="(max-width: 900px) 50vw, 27vw" /></span>
              <span className="c"><Bild src={drei.src} alt={drei.alt} sizes="(max-width: 900px) 58vw, 31vw" /></span>
              <figcaption>{images.strecke.label}</figcaption>
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
