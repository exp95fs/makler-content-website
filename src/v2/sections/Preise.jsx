import { useRef } from 'react';
import { Split, Magnetic } from '../fx.jsx';
import { Arrow, PreisNetto } from '../ui.jsx';
import { useSichtbarTracking } from '../tracking.js';
import { fotoklassen, sonderobjekt, weitereErgaenzungen, ergaenzungen, preisNetto } from '../../content/site.js';

/**
 * Preissektion des Onepagers, Gestaltung wie im bisherigen Onepager:
 * drei gleichwertige Kacheln, ein CTA darunter, Sonderobjekte, Ergänzungen.
 *
 * Buchbar sind Drohnenaufnahmen und das Objekt-Kurzvideo zum festen
 * Preis. Preise mit kleinem "netto"; der vollständige Hinweis zur
 * Umsatzsteuer steht im Footer.
 */
const drohne = ergaenzungen.find((e) => e.key === 'drohne');
const kurzvideo = ergaenzungen.find((e) => e.key === 'kurzvideo');

export function Preise() {
  const ref = useRef(null);
  useSichtbarTracking(ref, 'preisbereich');

  return (
    <section className="v2-sec bg-linen" id="preise" ref={ref} aria-labelledby="preise-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Pakete und Preise</p>
          <Split as="h2" id="preise-titel" className="v2-h-display v2-h-lg">
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
              <p className="preis">
                <b><PreisNetto n={k.foto} /></b>
                <small>Festpreis je Objekt</small>
              </p>
              <p className="menge">{k.bilder}</p>
            </article>
          ))}
        </div>

        <div className="qb-pakete-fuss" data-reveal>
          <Magnetic strength={0.18}>
            <a className="v2-btn" href="#booking" data-event="cta_primary">
              Objekt anfragen <Arrow size={16} />
            </a>
          </Magnetic>
          <p className="dazu">
            In jeder Klasse enthalten: 1 bis 2 Bilder je Raum, innen, außen und
            Nebenräume, vollständig bearbeitet.
            {' '}
            <a className="v2-link-inline on-light" href="#ablauf">Ablauf ansehen</a>
          </p>
        </div>

        <div className="qb-sonder" data-reveal>
          <div>
            <h3>{sonderobjekt.name}</h3>
            <p>{sonderobjekt.beschreibung} Sie erhalten nach einer kurzen Objektprüfung einen verbindlichen Festpreis.</p>
          </div>
          <span className="label">{sonderobjekt.preisLabel}</span>
        </div>

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Drohnenaufnahmen ({preisNetto(drohne.preis)}) und
              ein Objekt-Kurzvideo ({preisNetto(kurzvideo.preis)}) wählen Sie direkt im
              Buchungsprozess aus, alles Weitere stimmen wir in einem kurzen Gespräch auf das
              Objekt ab.
            </p>
            <div className="ctas">
              <a className="v2-btn ghost sm" href="#booking">
                Im Buchungsprozess auswählen <Arrow size={15} />
              </a>
              <a className="v2-btn ghost sm" href="#kontakt">
                Abstimmungstermin vereinbaren
              </a>
            </div>
          </div>
          <ul className="liste">
            {weitereErgaenzungen.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>

      </div>
    </section>
  );
}
