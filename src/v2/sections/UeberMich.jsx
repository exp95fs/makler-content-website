import { Split } from '../fx.jsx';

/**
 * "Über uns" vor der FAQ, nur Text: kein Bild und kein Platzhalter, bis
 * ein passendes Porträt vorliegt. Eyebrow links, Text rechts; auf Mobil
 * gestapelt.
 *
 * Korrigiert: keine unbelegten Angaben zu Dauer und Auftraggebern
 * ("über viele Jahre", "namhafte Unternehmen").
 */
export function UeberMich() {
  return (
    <section className="v2-sec bg-linen" id="ueber" aria-labelledby="ueber-titel">
      <div className="v2-wrap">
        <div className="v2-about ohne-bild">
          <p className="v2-eyebrow" data-reveal>Über uns</p>
          <div className="v2-about-body">
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
            <p data-reveal>
              Sie haben einen festen Ansprechpartner, vom ersten Gespräch bis zur
              Bereitstellung der Bilder.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl, unterwegs in Baden-Baden, Rastatt, Achern und Umgebung.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
