import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { fotoklassen, sonderobjekt, weitereErgaenzungen, preisStern, preishinweis } from '../../content/site.js';

/**
 * Drei Fotopakete als gleichwertige Kacheln. Bewusst keine Hervorhebung
 * einer Klasse: es wird nicht zwischen Optionen gewählt, die Objektgröße
 * entscheidet. Preise stehen über subgrid auf gleicher Höhe, auch wenn
 * Namen oder Beschreibungen unterschiedlich lang umbrechen.
 *
 * In der Kachel steht nur, was sich zwischen den Klassen unterscheidet:
 * Name, Objektbeschreibung, Preis und die Bildanzahl. Ein einziger CTA
 * steht unter den Kacheln, nicht drei nebeneinander: die Klasse wird im
 * Buchungsprozess ohnehin noch einmal gewählt.
 *
 * Was in jeder Klasse enthalten ist, steht als eigene Sektion "Ablauf".
 */
export function Preise() {
  return (
    <section className="v2-sec bg-linen" id="preise">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Pakete und Preise</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Ein Festpreis je Objektklasse. Keine Überraschungen.
          </Split>
          <p className="v2-lead" data-reveal>
            In jeder Klasse steckt dasselbe Vermarktungspaket: derselbe Ablauf,
            dieselbe Bearbeitung, dieselbe Qualität. Was sich unterscheidet, ist
            allein die Größe des Objekts und damit die Anzahl der Bilder.
          </p>
        </div>

        <div className="qb-pakete">
          {fotoklassen.map((k, i) => (
            <article className="qb-paket" key={k.key} data-reveal data-delay={i * 0.08}>
              <div className="kopf">
                <h3>{k.name}</h3>
                <p className="was">{k.beschreibung}</p>
              </div>
              <div className="preis">
                <b>{preisStern(k.foto)}</b>
                <small>Festpreis je Objekt</small>
              </div>
              <p className="menge">{k.bilder}</p>
            </article>
          ))}
        </div>

        <div className="qb-pakete-fuss" data-reveal>
          <Magnetic strength={0.18}>
            <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
              Objekt anfragen <Arrow size={16} />
            </button>
          </Magnetic>
          <p className="dazu">
            In jeder Klasse enthalten: 1 bis 2 Bilder je Raum, innen, außen und
            Nebenräume, vollständig bearbeitet.
            {' '}
            <button type="button" className="v2-link-inline on-light" onClick={() => scrollToId('ablauf')}>
              Ablauf ansehen
            </button>
          </p>
        </div>

        <div className="qb-sonder" data-reveal>
          <div>
            <b>{sonderobjekt.name}</b>
            <p>{sonderobjekt.beschreibung} Sie erhalten nach einer kurzen Objektprüfung einen verbindlichen Festpreis.</p>
          </div>
          <span className="label">{sonderobjekt.preisLabel}</span>
        </div>

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Drohnenaufnahmen und ein kurzes
              Objektreel wählen Sie direkt im Buchungsprozess aus, alles Weitere
              stimmen wir in einem kurzen Gespräch auf das Objekt ab.
            </p>
            <div className="ctas">
              <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('booking')}>
                Im Buchungsprozess auswählen <Arrow size={15} />
              </button>
              <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('kontakt')}>
                Abstimmungstermin vereinbaren
              </button>
            </div>
          </div>
          <ul className="liste">
            {weitereErgaenzungen.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>

        <p className="v2-fine is-text" data-reveal>
          {preishinweis} Die Bildanzahl ist eine Orientierung nach Objektgröße,
          keine feste Stückzahl.
        </p>
      </div>
    </section>
  );
}
