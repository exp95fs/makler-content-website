import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { Abschluss } from '../sections/Abschluss.jsx';
import { Bild, Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { images, kontakt } from '../../content/site.js';

/**
 * Über Quadratblick. Freigegebener About-Text, ergänzt nur um belegte
 * Angaben (Standort, Einsatzgebiet, Schwerpunkt, Kontakt).
 *
 * Kein Porträt: public/images/portrait/portrait.jpg ist ein Platzhalter.
 * TODO: Angabe durch Fabian bestätigen – echtes Porträt (4:5) einsetzen.
 */
export function UeberSeite() {
  const bild = images.referenzen[17];
  return (
    <PageShell seite="ueber">
      <SeitenKopf
        kompakt
        eyebrow="Quadratblick"
        titel="Über Quadratblick"
        einleitung="Immobilienfotografie für Makler in Mittelbaden – mit einem persönlichen Ansprechpartner."
      />
      <section className="v2-sec bg-linen-2" aria-labelledby="fabian-titel">
        <div className="v2-wrap">
          <div className="qb-ueber">
            <div className="text">
              <h2 id="fabian-titel" className="v2-h-display v2-h-md">
                Fabian Schneebiegl – persönlicher Ansprech­partner hinter Quadratblick
              </h2>
              <p>
                Quadratblick ist meine spezialisierte Marke für Immobilienfotografie in Bühl und
                Mittelbaden. Ich begleite jedes Projekt persönlich – von der Abstimmung über den
                Fototermin bis zur finalen Bildauswahl. Erfahrung aus professioneller Foto- und
                Videoproduktion fließt in die Umsetzung ein; im Mittelpunkt steht ein klarer und
                verlässlicher Ablauf für Makler und ihre Objekte.
              </p>
              <dl className="qb-fakten">
                <div><dt>Standort</dt><dd>Bühl</dd></div>
                <div><dt>Einsatzgebiet</dt><dd>Bühl, Baden-Baden, Achern und Umgebung</dd></div>
                <div><dt>Schwerpunkt</dt><dd>Immobilienfotografie für Makler</dd></div>
                <div><dt>Kontakt</dt><dd>
                  <a href={kontakt.telefonHref}>{kontakt.telefon}</a><br />
                  <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
                </dd></div>
              </dl>
              <p className="qb-weiter">
                <a className="v2-link-inline on-light" href={SEITEN.immobilienfotografie.pfad}>
                  Leistung ansehen <Arrow size={14} />
                </a>
                <a className="v2-link-inline on-light" href={SEITEN.referenzen.pfad}>
                  Referenzen ansehen <Arrow size={14} />
                </a>
              </p>
            </div>
            <figure className="bild">
              <Bild src={bild.src} alt={bild.alt} sizes="(max-width: 900px) calc(100vw - 40px), 44vw" />
              <figcaption>Aufnahme aus einem Referenzprojekt</figcaption>
            </figure>
          </div>
        </div>
      </section>
      <Abschluss />
    </PageShell>
  );
}
