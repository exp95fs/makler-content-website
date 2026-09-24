import { PageShell } from '../Shell.jsx';
import { Split, Magnetic } from '../fx.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { Prozess } from '../sections/Prozess.jsx';
import { Zusammenarbeit } from '../sections/Zusammenarbeit.jsx';
import { Faq } from '../sections/Faq.jsx';
import { Abschluss } from '../sections/Abschluss.jsx';
import { Bild, Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import {
  images, fotoklassen, sonderobjekt, ergaenzungen, leistungsumfang, preisNetto, preishinweis,
} from '../../content/site.js';

/**
 * Core-Service-Seite. Leistungsdetails und Bildumfänge unverändert aus
 * site.js, nichts erweitert. Die Preise stehen hier als kompakte Tabelle
 * je Objektklasse; die ausführliche Preisseite ist /preise/.
 */
const drohne = ergaenzungen.find((e) => e.key === 'drohne');

export function Immobilienfotografie() {
  const einsatz = images.referenzen[2];
  const bearbeitung = images.referenzen[9];
  return (
    <PageShell seite="immobilienfotografie">
      <SeitenKopf
        eyebrow="Leistung"
        titel="Immobilien­fotografie für Makler"
        einleitung="Professionelle Innen- und Außenaufnahmen für Exposés und Immobilienportale – für Makler und Immobilienprojekte in Bühl, Baden-Baden, Achern und der umliegenden Region. Quadratblick verbindet eine natürliche Bildwirkung mit persönlicher Abstimmung und klaren Preisen nach Objektklasse."
        bild={images.hero}
        bildAlt=""
      >
        <div className="v2-hero-ctas">
          <Magnetic>
            <a className="v2-btn" href={SEITEN.anfrage.pfad} data-event="cta_primary">
              Verfügbarkeit prüfen <Arrow />
            </a>
          </Magnetic>
        </div>
      </SeitenKopf>

      {/* 1. Einsatz der Bilder */}
      <section className="v2-sec bg-linen" aria-labelledby="einsatz-titel">
        <div className="v2-wrap">
          <div className="qb-zweispaltig">
            <div className="text">
              <p className="v2-eyebrow" data-reveal>Einsatz</p>
              <Split as="h2" id="einsatz-titel" className="v2-h-display v2-h-lg">
                Bilder für Exposé, Immobilienportal und Ihren Auftritt.
              </Split>
              <p className="v2-lead" data-reveal>
                Die Aufnahmen sind für Exposés und Immobilienportale ausgelegt. Innenaufnahmen zeigen
                die Räume und wie sie zusammenhängen, Außenaufnahmen das Gebäude in seinem Umfeld.
                Ebenso eignen sie sich für die Präsentation auf der Website Ihres Maklerbüros.
              </p>
            </div>
            <figure className="bild" data-reveal>
              <Bild src={einsatz.src} alt={einsatz.alt} sizes="(max-width: 900px) calc(100vw - 40px), 46vw" />
            </figure>
          </div>
        </div>
      </section>

      {/* 2. + 3. Leistungsumfang und Objektklassen */}
      <section className="v2-sec bg-linen-2" id="leistungsumfang" aria-labelledby="umfang-titel">
        <div className="v2-wrap">
          <div className="v2-sec-head">
            <p className="v2-eyebrow" data-reveal>Leistungsumfang</p>
            <Split as="h2" id="umfang-titel" className="v2-h-display v2-h-lg">
              Was jede Objektklasse umfasst.
            </Split>
          </div>
          <ul className="qb-haken grosz" data-reveal>
            {leistungsumfang.map((l) => <li key={l}>{l}</li>)}
          </ul>

          <div className="qb-tabelle-huelle" data-reveal>
            <table className="qb-tabelle">
              <caption>Objektklassen, Bildumfang und Preise</caption>
              <thead>
                <tr><th scope="col">Objektklasse</th><th scope="col">Objekt</th><th scope="col">Bildumfang</th><th scope="col">Preis</th></tr>
              </thead>
              <tbody>
                {fotoklassen.map((k) => (
                  <tr key={k.key}>
                    <th scope="row">{k.name}</th>
                    <td>{k.beschreibung}</td>
                    <td>{k.bilder}</td>
                    <td className="preis">{preisNetto(k.foto)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">{sonderobjekt.name}</th>
                  <td>{sonderobjekt.beschreibung}</td>
                  <td>nach Objekt</td>
                  <td className="preis">{sonderobjekt.preisLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="v2-fine is-text">
            {preishinweis} Die Bildanzahl ist eine Orientierung nach Objektgröße, keine feste Stückzahl.{' '}
            <a href={SEITEN.preise.pfad}>Zur Preisübersicht</a>
          </p>
        </div>
      </section>

      {/* 4. Ablauf */}
      <Prozess bg="bg-linen" />

      {/* 5. Natürliche Bildbearbeitung */}
      {/* TODO: Angabe durch Fabian bestätigen – technische Details der Bearbeitung. */}
      <section className="v2-sec bg-ink" aria-labelledby="bearbeitung-titel">
        <div className="v2-wrap">
          <div className="qb-zweispaltig umgekehrt">
            <div className="text">
              <p className="v2-eyebrow on-dark" data-reveal>Bildbearbeitung</p>
              <Split as="h2" id="bearbeitung-titel" className="v2-h-display v2-h-lg">
                Natürliche Bildbearbeitung.
              </Split>
              <p className="v2-lead on-dark" data-reveal>
                Ziel der Bearbeitung ist eine realistische Bildwirkung: stimmige Farben, ausgewogene
                Helligkeit und Fensterausblicke, die nicht überstrahlen. Räume sollen so erscheinen,
                wie sie bei einer Besichtigung wirken – ohne künstlichen Look.
              </p>
            </div>
            <figure className="bild" data-reveal>
              <Bild src={bearbeitung.src} alt={bearbeitung.alt} sizes="(max-width: 900px) calc(100vw - 40px), 46vw" />
            </figure>
          </div>
        </div>
      </section>

      {/* 6. Drohnenaufnahmen */}
      <section className="v2-sec tight bg-linen" id="drohne" aria-labelledby="drohne-titel">
        <div className="v2-wrap">
          <div className="qb-zusatz gross">
            <div>
              <p className="v2-eyebrow">Optional</p>
              <h2 id="drohne-titel" className="v2-h-display v2-h-md">Drohnenaufnahmen als Zusatzleistung</h2>
              <p>{drohne.note}</p>
            </div>
            <p className="betrag"><b>{preisNetto(drohne.preis)}</b> <span>als Add-on</span></p>
          </div>
        </div>
      </section>

      {/* 7. Eingespielte Zusammenarbeit */}
      <Zusammenarbeit />

      {/* 8. FAQ */}
      <Faq fragen={['bilder', 'vorbereitung', 'wetter', 'rechte']} id="faq-leistung"
           titel="Fragen zur Immobilien­fotografie" />

      {/* 9. CTA */}
      <Abschluss />
    </PageShell>
  );
}
