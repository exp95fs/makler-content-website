import { Split, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { fotoklassen, preis } from '../../content/site.js';

/**
 * Kompakte Vorschau auf das Angebot. Bewusst ohne Beispielbilder: hier wird
 * benannt, was es gibt, nicht gezeigt. Die Arbeitsproben folgen als eigene
 * Sektion.
 *
 * Gewichtung: Fotografie ist das Kernangebot und trägt die Sektion. Bewegtbild
 * steht als Ergänzung daneben, ohne eigenen Preisanker, weil dafür noch keine
 * Referenzen und keine Marktvalidierung vorliegen.
 */
const fotoPunkte = [
  'Innenräume, Außenansichten und die Bereiche, die ins Exposé gehören',
  'Vollständig bearbeitet und einsatzfertig für Portale, Exposé und Website',
  'Fester Preis je Objektklasse, vor dem Termin verbindlich zugesagt',
];

export function LeistungenVorschau() {
  const ab = Math.min(...fotoklassen.map((k) => k.foto));

  return (
    <section className="v2-sec bg-linen" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Das Angebot</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Professionelle Immobilienfotografie zum Festpreis.
          </Split>
          <p className="v2-lead" data-reveal>
            Das ist unser Kerngeschäft. Sie buchen eine Objektklasse, wir übernehmen
            alles Weitere: Terminabstimmung mit dem Eigentümer, Aufnahme vor Ort und
            Bearbeitung bis zur fertigen Bildauswahl.
          </p>
        </div>

        <div className="qb-angebot">
          <article className="qb-angebot-haupt" data-reveal>
            <span className="marke">Kernleistung</span>
            <h3>Objektfotografie</h3>
            <ul>
              {fotoPunkte.map((p) => (
                <li key={p}><span className="tick">→</span>{p}</li>
              ))}
            </ul>
            <div className="fuss">
              <button type="button" className="v2-btn" onClick={() => scrollToId('preise')}>
                Pakete und Preise <Arrow size={16} />
              </button>
              <span className="ab">Festpreis ab {preis(ab)} netto je Objekt</span>
            </div>
          </article>

          <article className="qb-angebot-neben" data-reveal data-delay="0.12">
            <span className="marke">Ergänzend</span>
            <h3>Drohne und Bewegtbild</h3>
            <p>
              Drohnenaufnahmen aus der Luft und vertikale Clips für Social Media
              lassen sich im selben Termin mitproduzieren. Was für ein Objekt
              sinnvoll ist, klären wir vorher gemeinsam, statt es pauschal
              mitzuverkaufen.
            </p>
            <button type="button" className="v2-btn ghost sm" onClick={() => scrollToId('preise')}>
              Ergänzungen ansehen <Arrow size={15} />
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
