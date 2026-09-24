/*
 * DERZEIT NICHT EINGEBUNDEN. Auf Wunsch von Fabian entfernt, bis ein
 * passendes Porträt oder Video vorliegt. Zum Einbinden in
 * pages/Startseite.jsx vor der FAQ einsetzen und in Shell.jsx den Anker
 * { id: 'ueber', label: 'Über uns' } wieder aufnehmen.
 */
import { Split } from '../fx.jsx';

/**
 * "Wer das macht", Gestaltung wie im bisherigen Onepager.
 *
 * Das frühere Porträt war ein Platzhalterbild. Statt eines Platzhalters
 * steht die gestaltete Fläche mit Monogramm (vorhandene Stile .frame,
 * .mono, .cap); es wird kein Bild geladen.
 * TODO: Angabe durch Fabian bestätigen – echtes Porträt (4:5) einsetzen.
 *
 * Korrigiert: keine unbelegten Angaben zu Dauer und Auftraggebern
 * ("über viele Jahre", "namhafte Unternehmen"), Video nachgeordnet,
 * Region Bühl, Baden-Baden, Achern.
 */
export function UeberMich() {
  return (
    <section className="v2-sec bg-linen-2" id="ueber" aria-labelledby="ueber-titel">
      <div className="v2-wrap">
        <div className="v2-about">
          <div className="v2-about-visual" data-reveal aria-hidden="true">
            <div className="frame qb-portrait">
              <span className="mono">Q</span>
              <span className="cap">Fabian Schneebiegl · Quadratblick · Bühl</span>
            </div>
          </div>
          <div className="v2-about-body">
            <p className="v2-eyebrow" data-reveal>Wer das macht</p>
            <Split as="h2" id="ueber-titel" className="v2-h-display v2-h-lg">
              Fabian – Fotografie und strategischer Blick für Immobilien­marken.
            </Split>
            <p data-reveal>
              Ich komme aus der professionellen Foto- und Videoproduktion und habe visuelle
              Projekte für Unternehmen umgesetzt. Dabei ging es nie nur um schöne Bilder,
              sondern immer um die Frage: Welche Botschaft soll ankommen und wie muss sie
              aussehen, damit sie bei der richtigen Zielgruppe wirkt?
            </p>
            <p data-reveal>
              Genau diesen Anspruch übertrage ich auf Immobilien. Mein Schwerpunkt ist die
              Immobilienfotografie: Bilder, die Objekte hochwertig zeigen und Maklerbüros
              professionell positionieren. Ich begleite jedes Projekt persönlich, von der
              Abstimmung bis zur finalen Bildauswahl.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl, unterwegs in Baden-Baden, Achern und Umgebung.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
