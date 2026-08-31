import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

/**
 * Verkauf und Vermietung. Verkaufsobjekte sind der Schwerpunkt,
 * Miet- und Ferienobjekte gehören dazu.
 * Frühere Prozentangaben zur Wirkung wurden entfernt, da keine belastbare
 * Quelle vorliegt.
 */
const segmente = [
  {
    tag: 'Verkaufen',
    tone: 'terra',
    title: 'Wohnungen, Häuser und Anwesen',
    text: 'Der Schwerpunkt unserer Arbeit. Content, der den Wert eines Kaufobjekts vermittelt und im Portal gegen viele andere Inserate bestehen muss.',
    punkte: [
      'Vollständige Darstellung inklusive Neben- und Außenbereichen',
      'Realistisches Raumgefühl, damit Anfragen zum Objekt passen',
      'Material, das Sie im Akquisegespräch mit Eigentümern zeigen können',
    ],
    img: images.referenzen[2],
  },
  {
    tag: 'Vermieten',
    tone: 'sage',
    flip: true,
    title: 'Miet-, Kurzzeit- und Ferienobjekte',
    text: 'Objekte, die dauerhaft oder wiederkehrend vermietet werden. Hier zählt, dass das Objekt in kurzer Zeit verstanden wird und der Content über mehrere Vermietungszyklen nutzbar bleibt.',
    punkte: [
      'Aufnahmen, die über einzelne Vermietungen hinaus verwendbar sind',
      'Formate für Portale und für Ihre eigenen Kanäle',
      'Auf Wunsch mit Blick auf Lage und Umgebung per Drohne',
    ],
    img: images.referenzen[4],
  },
];

export function Segmente() {
  return (
    <section className="v2-sec bg-linen" id="segmente">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Für welches Ziel</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Ob Verkauf oder Vermietung: Der Content folgt dem Ziel des Objekts.
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
