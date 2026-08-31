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
              <img src={images.portrait} alt="Porträt von Fabian, Gründer von Quadratblick" loading="lazy" width="1200" height="1500" />
            </div>
          </div>
          <div className="v2-about-body">
            <p className="v2-eyebrow" data-reveal>Wer das macht</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Fabian, Gründer und Produzent bei Quadratblick.
            </Split>
            <p data-reveal>
              Ich komme aus der professionellen Foto- und Videoproduktion und habe über Jahre
              visuelle Projekte für Unternehmen und Marken umgesetzt. Dabei ging es nie nur um
              gute Aufnahmen, sondern immer um die Frage, welche Botschaft ankommen soll und wie
              sie aussehen muss, damit sie bei der richtigen Zielgruppe wirkt.
            </p>
            <p data-reveal>
              Diesen Anspruch übertrage ich auf Immobilien. Vor der Kamera steht das Objekt,
              im Kopf immer auch das Büro, das es vermarktet. Sie haben einen Ansprechpartner
              für Konzept, Produktion und Bearbeitung, von der Anfrage bis zur Lieferung.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl, im Einsatz in Mittelbaden und der Ortenau</p>
          </div>
        </div>
      </div>
    </section>
  );
}
