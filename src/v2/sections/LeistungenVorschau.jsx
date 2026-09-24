import { Split, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { images, fotoklassen, preis } from '../../content/site.js';

/**
 * Erste Sektion nach dem Hero. Sie muss in wenigen Sekunden zeigen, dass
 * die Bilder gut sind, und einen Grund zum Weiterscrollen geben. Deshalb
 * steht hier nicht der volle Leistungstext, sondern ein großes Bild als
 * sofortiger Beleg, drei knappe Aussagen und der Preisanker.
 *
 * Die Kundenlogos folgen als eigene Sektion und werden hier nicht
 * vorweggenommen.
 */
const aussagen = [
  {
    t: 'Für Exposé, Portale und Ihre Kanäle',
    x: 'Innenräume, Außenansichten und Nebenräume, vollständig bearbeitet und einsatzfertig geliefert.',
  },
  {
    t: 'Fester Preis nach Objektgröße',
    x: 'Sie wissen vor dem Termin, was die Produktion kostet. Keine Abrechnung nach Aufwand.',
  },
  {
    t: 'Wir übernehmen den ganzen Ablauf',
    x: 'Von der Terminabstimmung mit dem Eigentümer bis zur fertigen Bildauswahl.',
  },
];

export function LeistungenVorschau() {
  const ab = Math.min(...fotoklassen.map((k) => k.foto));
  const beleg = images.referenzen[0];

  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="qb-einstieg">
          <div className="text">
            <p className="v2-eyebrow" data-reveal>Immobilienfotografie</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              So sieht ein Objekt aus, das professionell fotografiert wurde.
            </Split>
            <ol className="punkte" data-reveal>
              {aussagen.map((a, i) => (
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

          <div className="bild" data-reveal data-delay="0.15">
            <div className="frame" data-clip-reveal>
              <img src={beleg.src} alt={beleg.alt} loading="lazy" width="1800" height="1200" />
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
