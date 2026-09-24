import { useRef } from 'react';
import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { useSichtbarTracking } from '../tracking.js';
import {
  fotoklassen, sonderobjekt, ergaenzungen, leistungsumfang, weitereMedien,
  preisNetto, preishinweis,
} from '../../content/site.js';

/**
 * Preise der drei Objektklassen und Drohnenaufnahmen als Zusatzleistung.
 * Paketnamen, Beschreibungen und Bildumfänge unverändert aus site.js.
 *
 * variante="teaser": Startseite, kompakt mit Link auf /preise/.
 * variante="seite":  /preise/, zusätzlich Leistungsumfang, Sonderobjekte,
 *                    weitere Formate und Preishinweis. Die H1 steht dort
 *                    im Seitenkopf, hier beginnt es mit H2.
 */
export function PreisUebersicht({ variante = 'teaser', bg = 'bg-linen' }) {
  const seite = variante === 'seite';
  const ref = useRef(null);
  useSichtbarTracking(ref, 'preisbereich');
  const drohne = ergaenzungen.find((e) => e.key === 'drohne');

  return (
    <section className={`v2-sec ${bg}`} id="preise" ref={ref} aria-labelledby="preise-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>{seite ? 'Objektklassen' : 'Preise'}</p>
          <Split as="h2" id="preise-titel" className="v2-h-display v2-h-lg">
            {seite ? 'Drei Objektklassen, ein Leistungsumfang.' : 'Klare Preise nach Objektklasse.'}
          </Split>
          <p className="v2-lead" data-reveal>
            Die Objektklasse bestimmt Preis und Bildumfang. Aufnahme und Bearbeitung sind in
            jeder Klasse gleich.
          </p>
        </div>

        <div className="qb-pakete">
          {fotoklassen.map((k, i) => (
            <article className="qb-paket" key={k.key} data-reveal data-delay={i * 0.08}>
              <div className="kopf">
                <h3>{k.name}</h3>
                <p className="was">{k.beschreibung}</p>
              </div>
              <p className="preis"><b>{preisNetto(k.foto)}</b></p>
              <p className="menge">{k.bilder}</p>
            </article>
          ))}
        </div>

        <div className="qb-zusatz" data-reveal>
          <div>
            <h3>{drohne.name}</h3>
            <p>{drohne.note}</p>
          </div>
          <p className="betrag"><b>{preisNetto(drohne.preis)}</b> <span>als Add-on</span></p>
        </div>

        {seite && (
          <div className="qb-preis-details" data-reveal>
            <div>
              <h3>In jeder Objektklasse enthalten</h3>
              <ul className="qb-haken">
                {leistungsumfang.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
            <div>
              <h3>{sonderobjekt.name}</h3>
              <p>
                {sonderobjekt.beschreibung} Nach einer kurzen Prüfung erhalten Sie einen
                Festpreis.
              </p>
              <h3>Weitere Formate</h3>
              <p>{weitereMedien}</p>
            </div>
          </div>
        )}

        <div className="qb-pakete-fuss" data-reveal>
          <Magnetic strength={0.18}>
            <a className="v2-btn" href={SEITEN.anfrage.pfad} data-event="cta_primary">
              Verfügbarkeit prüfen <Arrow size={16} />
            </a>
          </Magnetic>
          {!seite && (
            <a className="v2-link-inline on-light" href={SEITEN.preise.pfad}>
              Alle Preise und Details
            </a>
          )}
        </div>

        <p className="v2-fine is-text">
          {preishinweis} Die Bildanzahl ist eine Orientierung nach Objektgröße, keine feste Stückzahl.
        </p>
      </div>
    </section>
  );
}
