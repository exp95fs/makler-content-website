import { Split } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { images } from '../../content/site.js';

/**
 * Core Offer auf der Startseite: Immobilienfotografie. Text wie freigegeben,
 * rechts eine Bildstrecke aus einer Produktion (Hauptbild und zwei kleinere,
 * versetzt darüber).
 */
export function KernLeistung() {
  const [haupt, zwei, drei] = images.inserat.bilder;
  return (
    <section className="v2-sec bg-linen" id="leistung" aria-labelledby="leistung-titel">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Immobilienfotografie</p>
            <Split as="h2" id="leistung-titel" className="v2-h-display v2-h-lg">
              Immobilien­fotografie für einen professionellen ersten Eindruck.
            </Split>
            <p className="v2-lead" data-reveal>
              Quadratblick erstellt hochwertige Innen- und Außenaufnahmen für Exposés,
              Immobilienportale und die Präsentation Ihres Maklerbüros. Der Fokus liegt auf
              einer natürlichen Bildwirkung, klarer Raumdarstellung und einer persönlichen
              Projektabstimmung.
            </p>
            <div className="fuss" data-reveal>
              <a className="v2-btn" href={SEITEN.immobilienfotografie.pfad}>
                Immobilienfotografie ansehen <Arrow size={16} />
              </a>
            </div>
          </div>

          <div className="bild">
            <figure className="qb-strecke" data-reveal>
              <span className="a">
                <Bild src={haupt.src} alt={haupt.alt} sizes="(max-width: 900px) 76vw, 38vw" />
              </span>
              <span className="b">
                <Bild src={zwei.src} alt={zwei.alt} sizes="(max-width: 900px) 42vw, 20vw" />
              </span>
              <span className="c">
                <Bild src={drei.src} alt={drei.alt} sizes="(max-width: 900px) 48vw, 23vw" />
              </span>
              <figcaption>Beispielaufnahmen</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
