import { images } from '../../content/site.js';

/**
 * Kundenlogos. Bewusst als kompakte Gruppe neben einer Kontextzeile,
 * nicht über die volle Breite verteilt: Vier Logos in einem breiten Band
 * würden leer wirken. Kein Auto-Scroll.
 */
export function LogoBand() {
  return (
    <section className="qb-logoband" aria-label="Auftraggeber">
      <div className="v2-wrap">
        <div className="qb-logoband-inner" data-reveal>
          <p className="qb-logoband-text">Produziert für Maklerbüros<br />und Immobilienabteilungen in der Region</p>
          <ul className="qb-logoband-list">
            {images.logos.map((l) => (
              <li key={l.src}>
                {/* TODO: Platzhalter durch echtes Kundenlogo ersetzen (3:1, SVG einfarbig) */}
                <img src={l.src} alt={l.alt} width="240" height="80" loading="lazy" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
