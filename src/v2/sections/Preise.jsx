import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { objektklassen, sonderobjekt, buendelVorteil, preis } from '../../content/site.js';

/**
 * Die erste inhaltliche Sektion nach dem Logoband. Sie beantwortet
 * vollständig, was gebucht wird und was es kostet. Alles Weitere auf der
 * Seite ist Ergänzung.
 */
export function Preise() {
  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Leistungen und Preise</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Fotos für Ihr Objekt, zum Festpreis.
          </Split>
          <p className="v2-lead" data-reveal>
            Sie buchen die Fotoproduktion für eine Immobilie. Der Preis steht vorher fest und
            richtet sich nach der Größe des Objekts, nicht nach der Anzahl der Bilder. Schwerpunkt
            sind Verkaufsobjekte, Mietobjekte produzieren wir ebenso.
          </p>
        </div>

        <div className="qb-klassen">
          {objektklassen.map((k) => (
            <article className="qb-klasse" key={k.key} data-reveal>
              <div>
                <h3>{k.name}</h3>
                <p>{k.beschreibung}</p>
              </div>
              <div className="qb-klasse-preis">{preis(k.preis)}<small>netto</small></div>
            </article>
          ))}
          <article className="qb-klasse is-sonder" data-reveal>
            <div>
              <h3>{sonderobjekt.name}</h3>
              <p>{sonderobjekt.beschreibung}</p>
            </div>
            <div className="qb-klasse-preis is-text">{sonderobjekt.preisLabel}</div>
          </article>
        </div>

        <div className="qb-hinweise">
          <div className="qb-hinweis" data-reveal>
            <span className="k">Mehrere Objekte an einem Tag</span>
            <p>
              Für jedes weitere Objekt am selben Tag sinkt der Fotopreis um{' '}
              {preis(buendelVorteil.betrag)}, bei sinnvoller Route und gemeinsamer Rechnung.
            </p>
          </div>
          <div className="qb-hinweis" data-reveal>
            <span className="k">Wenn laufend Objekte anstehen</span>
            <p>
              Bei regelmäßigem Bedarf planen wir Produktionstage im Voraus. Die Konditionen dafür
              besprechen wir, weil sie von der Menge abhängen.
            </p>
          </div>
        </div>

        <div className="v2-hero-ctas" data-reveal>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Objekt anfragen <Arrow />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
