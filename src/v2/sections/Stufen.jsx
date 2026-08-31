import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Leistungsstufen. Ersetzt die frühere Zwei-Wege-Darstellung: Objektcontent
 * ist die Basis, Marke & Social baut darauf auf. Bewusst versetzt und in
 * unterschiedlicher Gewichtung dargestellt, damit keine Entweder-oder-Wahl
 * suggeriert wird.
 */
export function Stufen() {
  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Wie wir arbeiten</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Es beginnt beim Objekt. Und es hört dort nicht auf.
          </Split>
          <p className="v2-lead" data-reveal>
            Jedes Maklerbüro braucht Content für seine Objekte. Aus derselben Produktion entsteht
            Material, das Ihr Büro als Marke sichtbar macht. Die zweite Stufe ist kein separates
            Projekt, sondern die konsequente Fortsetzung der ersten.
          </p>
        </div>

        <ol className="qb-stufen">
          <li className="qb-stufe" data-reveal>
            <div className="qb-stufe-marke"><span className="n">Stufe 1</span></div>
            <div className="qb-stufe-body">
              <h3>Objektcontent</h3>
              <p className="qb-stufe-lead">
                Die Basis für jedes Objekt: Fotos, Drohnenaufnahmen und Video für Exposé, Portale
                und Ihre eigenen Kanäle. Gebucht pro Objekt, produziert an einem Termin.
              </p>
              <ul className="qb-stufe-punkte">
                <li>Drei Objektklassen mit festen Preisen</li>
                <li>Erweiterungen nur dort, wo sie zum Objekt passen</li>
                <li>Sichtbarkeit über den gesamten Vermarktungszeitraum</li>
              </ul>
              <Magnetic>
                <button type="button" className="v2-btn ghost" onClick={() => scrollToId('objektcontent')}>
                  Leistungen und Preise ansehen <Arrow size={15} />
                </button>
              </Magnetic>
            </div>
          </li>

          <li className="qb-stufe is-next" data-reveal data-delay="0.12">
            <div className="qb-stufe-marke"><span className="n">Stufe 2</span></div>
            <div className="qb-stufe-body">
              <h3>Marke &amp; Social</h3>
              <p className="qb-stufe-lead">
                Aus der laufenden Objektarbeit wird sichtbare Präsenz Ihres Büros. Material, das
                Eigentümer erreicht, bevor sie an einen Verkauf denken, und Vertrauen bei
                Kaufinteressenten aufbaut.
              </p>
              <ul className="qb-stufe-punkte">
                <li>Sie selbst als Gesicht Ihres Büros</li>
                <li>Wiedererkennbare Bildsprache über alle Objekte</li>
                <li>Einsatzfertiges Material, das Sie selbst ausspielen</li>
              </ul>
              <Magnetic>
                <button type="button" className="v2-btn" onClick={() => scrollToId('marke')}>
                  Zur zweiten Stufe <Arrow size={15} />
                </button>
              </Magnetic>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
