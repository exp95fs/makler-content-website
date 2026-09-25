import { useRef } from 'react';
import { Split, Magnetic } from '../fx.jsx';
import { Arrow, PreisNetto } from '../ui.jsx';
import { useSichtbarTracking } from '../tracking.js';
import { CTA, fotoklassen, aufAnfrage, festpreisUmfang, ergaenzungen, preis, brutto, preisNetto, preisBrutto } from '../../content/site.js';

/**
 * Preissektion des Onepagers, Gestaltung wie im bisherigen Onepager:
 * drei gleichwertige Kacheln mit Festpreis, darunter über die volle
 * Breite die Klasse "auf Anfrage", was der Festpreis umfasst und was nach
 * Absprache dazukommt, ein CTA, Ergänzungen.
 *
 * Preise netto mit kleinem "netto", darunter der Bruttopreis inkl. USt.
 * Der vollständige Hinweis zur Umsatzsteuer steht im Footer.
 */

const festpreisKlassen = fotoklassen.filter((k) => !k.aufAnfrage);
const sonderKlassen = fotoklassen.filter((k) => k.aufAnfrage);

export function Preise() {
  const ref = useRef(null);
  useSichtbarTracking(ref, 'preisbereich');

  return (
    <section className="v2-sec bg-linen" id="preise" ref={ref} aria-labelledby="preise-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Pakete und Preise</p>
          <Split as="h2" id="preise-titel" className="v2-h-display v2-h-lg">
            Festpreis nach Objektklasse.
          </Split>
          <p className="v2-lead" data-reveal>
            Der Preis richtet sich nach der Objektklasse, nicht nach Stunden, und steht vor
            dem Termin fest. Er umfasst die Aufnahmen vor Ort und die Standardbearbeitung
            eines aufnahmebereiten Objekts. Größere oder besondere Objekte prüfen wir kurz
            und nennen Ihnen vorab einen Festpreis.
          </p>
        </div>

        <div className="qb-pakete">
          {festpreisKlassen.map((k, i) => (
            <article className="qb-paket" key={k.key} data-reveal data-delay={i * 0.08}>
              <div className="kopf">
                <h3>{k.name}</h3>
                <p className="was">{k.beschreibung}</p>
              </div>
              <p className="preis">
                <b><PreisNetto n={k.foto} /></b>
                <small>{preis(brutto(k.foto))} inkl. 19 % USt.</small>
              </p>
              <p className="menge">{k.bilder}</p>
            </article>
          ))}
        </div>

        {sonderKlassen.map((k) => (
          <article className="qb-sonder" key={k.key} data-reveal>
            <div>
              <h3>{k.name}</h3>
              <p>{k.beschreibung}</p>
            </div>
            <p className="label">{aufAnfrage.zeile}</p>
          </article>
        ))}

        <div className="qb-preis-details" data-reveal>
          {[festpreisUmfang.enthalten, festpreisUmfang.zusaetzlich].map((b) => (
            <div key={b.t}>
              <h3>{b.t}</h3>
              <p>{b.x}</p>
            </div>
          ))}
        </div>

        <div className="qb-pakete-fuss" data-reveal>
          <Magnetic strength={0.18}>
            <a className="v2-btn" href="#booking" data-event="cta_primary">
              {CTA.termin} <Arrow size={16} />
            </a>
          </Magnetic>
        </div>

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Drohnenaufnahmen und ein Objekt-Kurzvideo
              wählen Sie direkt im Buchungsprozess aus, alles Weitere stimmen wir in einem
              kurzen Gespräch auf das Objekt ab.
            </p>
            <div className="ctas">
              <a className="v2-btn ghost sm" href="#booking" data-event="cta_primary">
                {CTA.termin} <Arrow size={15} />
              </a>
              <a className="v2-btn ghost sm" href="#kontakt" data-event="cta_kontakt">
                {CTA.kontakt}
              </a>
            </div>
          </div>
          <ul className="liste">
            {ergaenzungen.map((e) => (
              <li key={e.key}>
                <span className="kopf">
                  <b>{e.name}</b>
                  <span className="betrag">+ {preisNetto(e.preis)} · {preisBrutto(e.preis)}</span>
                </span>
                <span className="x">{e.kurz}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
