import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

/**
 * "Ob Verkauf oder Vermietung" von der Live-Seite.
 * Verkaufsteil wörtlich. Im Vermietungsteil sind Ferienwohnung,
 * Kurzzeitvermietung und Airbnb entfallen, ebenso die beiden
 * Statistik-Punkte und die Quellenfußnote.
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
    flip: true,
    title: 'Mietobjekte',
    text: 'Content, der Mietanfragen steigert und das Objekt in kurzer Zeit verständlich macht.',
    punkte: [
      'Aufnahmen, die über eine einzelne Vermietung hinaus verwendbar bleiben',
      'Realistische Darstellung, damit Anfragen zum Objekt passen',
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
        {segmente.map((s) => (
          <div className={`v2-seg ${s.flip ? 'flip' : ''}`} key={s.tag}>
            <div className="media" data-cursor="view" data-cursor-label={s.tag}>
              <div className="frame" data-clip-reveal>
                <img src={s.img.src} alt={s.img.alt} loading="lazy" data-parallax="14" width="2000" height="1333" />
              </div>
            </div>
            <div className="body" data-reveal>
              <span className={`v2-seg-tag ${s.tone}`}>{s.tag}</span>
              <h3 className="v2-h-display v2-h-md">{s.title}</h3>
              <p>{s.text}</p>
              <ul>
                {s.punkte.map((p) => (
                  <li key={p}><span className="tick">→</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
