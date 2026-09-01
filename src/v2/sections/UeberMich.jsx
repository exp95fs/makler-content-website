import { Split } from '../fx.jsx';
import { images } from '../../content/site.js';

export function UeberMich() {
  return (
    <section className="v2-sec bg-linen-2" id="ueber">
      <div className="v2-wrap">
        <div className="v2-about">
          <div className="v2-about-visual" data-reveal>
            <div className="frame qb-portrait">
              {/* TODO: Platzhalter durch echtes Porträtfoto ersetzen (4:5, min. 1200px) */}
              <img src={images.portrait} alt="Porträt von Fabian, Quadratblick" loading="lazy" width="1200" height="1500" />
            </div>
          </div>
          <div className="v2-about-body">
            <p className="v2-eyebrow" data-reveal>Wer das macht</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Fabian – Foto, Video und strategischer Blick für Immobilienmarken.
            </Split>
            <p data-reveal>
              Ich komme aus der professionellen Foto- und Videoproduktion und habe über viele Jahre
              visuelle Projekte für namhafte Unternehmen umgesetzt. Dabei ging es nie nur um schöne
              Bilder, sondern immer um die Frage: Welche Botschaft soll ankommen und wie muss sie
              aussehen, damit sie bei der richtigen Zielgruppe wirkt?
            </p>
            <p data-reveal>
              Genau diesen Anspruch übertrage ich auf Immobilien. Ich produziere Fotos, Videos und
              Markencontent, die Objekte hochwertig zeigen, Maklerbüros professionell positionieren
              und aus einem einzelnen Auftrag ein stimmiges Gesamtbild machen.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl, unterwegs in Mittelbaden und der Ortenau.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
