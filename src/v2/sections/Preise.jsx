import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { fotoklassen, sonderobjekt, enthalten, weitereErgaenzungen, preis } from '../../content/site.js';

/**
 * Drei Fotopakete als gleichwertige Kacheln. Bewusst keine Hervorhebung
 * einer Klasse: es wird nicht zwischen Optionen gewählt, die Objektgröße
 * entscheidet. Preise stehen über subgrid auf gleicher Höhe, auch wenn
 * Namen oder Beschreibungen unterschiedlich lang umbrechen.
 *
 * In der Kachel steht nur, was sich zwischen den Klassen unterscheidet:
 * Name, Objektbeschreibung, Preis und die Bildanzahl. Alles Gemeinsame
 * steht darunter im Ablauf, sonst lesen sich die drei Kacheln gleich.
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
                <b>{preis(k.foto)}</b>
                <small>netto · Festpreis</small>
              </div>
              <p className="menge">{k.bilder}</p>
              <Magnetic strength={0.18}>
                <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('booking')}>
                  Diese Klasse anfragen <Arrow size={15} />
                </button>
              </Magnetic>
            </article>
          ))}
        </div>

        <div className="qb-sonder" data-reveal>
          <div>
            <b>{sonderobjekt.name}</b>
            <p>{sonderobjekt.beschreibung} Sie erhalten nach einer kurzen Objektprüfung einen verbindlichen Festpreis.</p>
          </div>
          <span className="label">{sonderobjekt.preisLabel}</span>
        </div>

        <div className="qb-enthalten" data-reveal>
          <div className="kopf">
            <span className="k">In jeder Klasse enthalten</span>
            <p>
              Jedes Paket enthält 1 bis 2 Bilder je Raum, innen, außen und
              Nebenräume. Ihr Aufwand beschränkt sich auf die Anfrage.
            </p>
          </div>
          <ol className="ablauf">
            {enthalten.map((e, i) => (
              <li key={e.t}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <b>{e.t}</b>
                <span className="x">{e.x}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Deshalb gibt es hier keine
              Preisliste zum Abhaken, sondern eine Auswahl, die zum Objekt passt.
              Im Buchungsprozess wählen Sie direkt aus, alles Weitere stimmen wir
              in einem kurzen Gespräch ab.
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
          Alle Preise netto, zzgl. gesetzl. MwSt. Die Bildanzahl ist eine
          Orientierung nach Objektgröße, keine feste Stückzahl.
        </p>
      </div>
    </section>
  );
}
