import { Split } from '../fx.jsx';
import { Arrow, Bild } from '../ui.jsx';
import { LogoBand } from './LogoBand.jsx';
import { SEITEN } from '../seiten.js';
import { images, referenzGruppen } from '../../content/site.js';

/**
 * Auszug aus den Referenzen für die Startseite: ein Objekt im versetzten
 * Raster, die Logos und der Weg zur vollständigen Referenzseite.
 */
export function ReferenzTeaser() {
  const gruppe = referenzGruppen[0];
  const bilder = gruppe.bilder.slice(0, 4).map((i) => images.referenzen[i]);

  return (
    <section className="v2-sec bg-ink" id="referenzen" aria-labelledby="referenzen-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Referenzen</p>
          <Split as="h2" id="referenzen-titel" className="v2-h-display v2-h-lg">
            Ausgewählte Immobilien­projekte
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Einblicke in Immobilienaufnahmen aus regionalen Projekten – von Wohnungen bis zu
            größeren Wohnobjekten.
          </p>
        </div>

        <div className="qb-refgruppe" data-reveal>
          <div className="titel">
            <b>{gruppe.titel}</b>
            <span>{gruppe.label}</span>
          </div>
          <ul className="qb-versatz">
            {bilder.map((b) => (
              <li key={b.src}>
                <span className="kachel box">
                  <Bild src={b.src} alt={b.alt}
                        sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1560px) 55vw, 860px" />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="qb-ref-fuss" data-reveal>
          <a className="v2-btn ghost on-dark" href={SEITEN.referenzen.pfad}>
            Alle Referenzprojekte ansehen <Arrow size={15} />
          </a>
        </div>

        <LogoBand dunkel />
      </div>
    </section>
  );
}
