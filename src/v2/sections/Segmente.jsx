import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

/**
 * "Ob Verkauf oder Vermietung" von der Live-Seite: zwei gleichwertige
 * Karten nebeneinander mit Label, Überschrift, Absatz, drei Bullets und
 * Bildbereich darunter. Auf schmalen Viewports untereinander.
 *
 * Ferienwohnung, Kurzzeitvermietung und Airbnb bleiben ungenannt, das
 * ist eine bestehende Vorgabe. Die Kennzahlen und die Quellenfußnote
 * stehen wieder wie live.
 */
const segmente = [
  {
    tag: 'Verkaufen',
    tone: 'terra',
    title: 'Wohnungen · Häuser · Anwesen',
    text: 'Content, der den Wert eines Kaufobjekts vermittelt und den richtigen Käufer schneller anzieht.',
    punkte: [
      'Schnellere Vermittlung, höhere Wahrnehmung des Objekts',
      'Vorqualifizierte Käufer durch realistisches Raumgefühl',
      'Stärkere Position im Akquisegespräch mit Eigentümern',
    ],
    img: images.referenzen[2],
  },
  {
    tag: 'Vermieten',
    tone: 'sage',
    title: 'Mietobjekte',
    text: 'Content, der Mietanfragen steigert und das Objekt in kurzer Zeit verständlich macht.',
    punkte: [
      'Bis zu +40 % mehr Buchungen mit Profi-Fotos',
      '~26 % höhere erzielbare Preise, weniger Leerstand',
      'Wiederverwendbarer Content für Portale & Social Media',
    ],
    img: images.referenzen[4],
  },
];

export function Segmente() {
  return (
    <section className="v2-sec bg-linen" id="segmente">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Für welches Ziel?</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Ob Verkauf oder Vermietung: Der richtige Content für Ihr Objekt.
          </Split>
        </div>

        <div className="v2-segkarten">
          {segmente.map((s, i) => (
            <article className="v2-segkarte" key={s.tag} data-reveal data-delay={i * 0.1}>
              <span className={`v2-seg-tag ${s.tone}`}>{s.tag}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <ul>
                {s.punkte.map((p) => (
                  <li key={p}><span className="tick">→</span>{p}</li>
                ))}
              </ul>
              <div className="frame">
                <img src={s.img.src} alt={s.img.alt} loading="lazy" width="2000" height="1333" />
              </div>
            </article>
          ))}
        </div>

        <p className="v2-fine is-text" data-reveal>
          Vermietungszahlen: Branchen-Zusammenstellungen. Richtwerte, keine Garantie.
        </p>
      </div>
    </section>
  );
}
