import { Split, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { abPreise, images, preis } from '../../content/site.js';

/**
 * Kompakte Vorschau auf Foto und Video, direkt unter dem Kennzahlenband.
 * Der Preis ist hier bewusst Nebeninformation. Die vollständige
 * Aufschlüsselung und die Buchung folgen weiter unten unter #preise.
 */
const bloecke = [
  {
    key: 'foto',
    label: 'Foto',
    titel: 'Bilder, die das Objekt tragen',
    text: 'Bearbeitete Aufnahmen für Exposé und Portale, abgestimmt auf das jeweilige Objekt. Innenräume, Außenansichten und die Bereiche, auf die es beim Rundgang ankommt.',
    ab: abPreise.foto,
    bild: images.referenzen[2],
  },
  {
    key: 'video',
    label: 'Video',
    titel: 'Bewegtbild, das Räume erlebbar macht',
    text: 'Objektfilm, Drohnenaufnahmen und vertikale Reels. Raumgefühl, Licht und Laufwege werden sichtbar, auf dem Portal wie auf Ihren eigenen Kanälen.',
    ab: abPreise.video,
    bild: images.referenzen[1],
  },
];

export function LeistungenVorschau() {
  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Was wir produzieren</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Foto und Video für Ihre Immobilie.
          </Split>
        </div>

        <div className="v2-vorschau">
          {bloecke.map((b, i) => (
            <article className={`v2-vor ${b.key}`} key={b.key} data-reveal data-delay={i * 0.1}>
              <div className="bild" data-clip-reveal>
                <img src={b.bild.src} alt={b.bild.alt} loading="lazy" width="2000" height="1333" />
                <span className="marke">{b.label}</span>
              </div>
              <div className="text">
                <h3>{b.titel}</h3>
                <p>{b.text}</p>
                <div className="fuss">
                  <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('preise')}>
                    Preise ansehen <Arrow size={15} />
                  </button>
                  <span className="ab">ab {preis(b.ab)} netto</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
