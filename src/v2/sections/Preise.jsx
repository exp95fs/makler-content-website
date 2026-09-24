import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { fotoklassen, sonderobjekt, weitereErgaenzungen, preis } from '../../content/site.js';

/**
 * Drei Fotopakete als Kacheln, keine vollständige Preisliste. Ergänzungen
 * stehen nur als Aufzählung ohne Preise: sie werden im Buchungsprozess
 * ausgewählt oder im Abstimmungstermin auf das Objekt zugeschnitten.
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
            Jede Klasse erhält dieselbe professionelle Qualität. Der Preis richtet
            sich nach dem Produktionsumfang des Objekts, nicht nach einer Basis-
            oder Premiumstufe. Was Ihr Objekt kostet, steht vor dem Termin fest.
          </p>
        </div>

        <div className="qb-pakete">
          {fotoklassen.map((k, i) => (
            <article className={`qb-paket ${k.empfohlen ? 'is-rec' : ''}`} key={k.key}
                     data-reveal data-delay={i * 0.08}>
              {k.empfohlen && <span className="flag">Häufigste Klasse</span>}
              <h3>{k.name}</h3>
              <p className="was">{k.beschreibung}</p>
              <div className="preis">
                {preis(k.foto)}<small>netto, Festpreis</small>
              </div>
              <p className="umfang">{k.umfang}</p>
              <Magnetic strength={0.18}>
                <button type="button" className={`v2-btn ${k.empfohlen ? '' : 'ghost'} sm`}
                        onClick={() => scrollToId('booking')}>
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

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Deshalb gibt es hier keine
              Preisliste zum Abhaken, sondern eine Auswahl, die zum Objekt passt.
              Im Buchungsprozess wählen Sie direkt aus, alles Weitere stimmen wir
              in einem kurzen Gespräch ab und stellen ein Vermarktungspaket
              zusammen, das zur Immobilie passt.
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

        <p className="v2-fine is-text" data-reveal>Alle Preise netto, zzgl. gesetzl. MwSt.</p>
      </div>
    </section>
  );
}
