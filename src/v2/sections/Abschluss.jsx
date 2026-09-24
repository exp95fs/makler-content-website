import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { SEITEN } from '../seiten.js';
import { kontakt } from '../../content/site.js';

/** Abschluss-CTA am Seitenende. Ein CTA, dazu die direkten Kontaktwege. */
export function Abschluss({ titel = 'Ein Objekt steht an?' }) {
  return (
    <section className="v2-sec tight bg-ink" id="anfragen" aria-labelledby="abschluss-titel">
      <div className="v2-wrap">
        <div className="qb-abschluss">
          <Split as="h2" id="abschluss-titel" className="v2-h-display v2-h-lg">{titel}</Split>
          <p className="v2-lead on-dark" data-reveal>
            Senden Sie Objektklasse, Standort und gewünschten Zeitraum. Sie erhalten eine
            persönliche Bestätigung zu Termin, Leistungsumfang und Preis.
          </p>
          <div className="ctas" data-reveal>
            <Magnetic>
              <a className="v2-btn" href={SEITEN.anfrage.pfad} data-event="cta_primary">
                Verfügbarkeit prüfen <Arrow />
              </a>
            </Magnetic>
            <p className="direkt">
              Oder direkt: <a href={kontakt.telefonHref}>{kontakt.telefon}</a>
              {' · '}
              <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
