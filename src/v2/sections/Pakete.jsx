import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { objektklassen, sonderobjekt, filmpakete, buendelVorteil, preis } from '../../content/site.js';

/**
 * "Leistungen & Pakete" von der Live-Seite. Die Sektionsstruktur bleibt
 * (Gruppe Foto, Gruppe Film, erklärender Vorspann je Gruppe, Preishinweis
 * am Ende), der Inhalt folgt der neuen Preisarchitektur:
 * drei Objektklassen statt Basis/Premium, Makler-Film aufgelöst.
 */
export function Pakete() {
  return (
    <section className="v2-sec bg-linen-2" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Leistungen &amp; Pakete</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Der passende Auftritt für jede Immobilie.
          </Split>
          <p className="v2-lead" data-reveal>
            Ob hochwertige Fotostrecke oder emotionaler Immobilienfilm: Wählen Sie das Paket, das
            zu Ihrem Objekt, Ihrer Zielgruppe und Ihrem Vermarktungsziel passt. Alle Leistungen
            lassen sich individuell ergänzen und auf Wunsch zu einer abgestimmten Produktion
            kombinieren.
          </p>
        </div>

        <div className="v2-pkg-groups">
          {/* --- Gruppe Foto --- */}
          <div data-reveal>
            <div className="v2-pkg-group-head">
              <span className="dot sage" />
              <span>Foto</span>
            </div>
            <p className="v2-pkg-note">
              <strong>Welche Objektklasse?</strong> Der Preis richtet sich nach dem Umfang des
              Objekts, nicht nach der Ausstattung des Pakets. Die Qualität der Aufnahmen und der
              Bearbeitung ist in jeder Klasse dieselbe.
            </p>
            <div className="v2-pkg-rows">
              {objektklassen.map((k) => (
                <article className="v2-pkg-row" key={k.key}>
                  <div>
                    <h3>{k.name}</h3>
                    <div className="v2-pkg-price">{preis(k.preis)}<small>netto</small></div>
                  </div>
                  <p>{k.beschreibung}</p>
                </article>
              ))}
              <article className="v2-pkg-row">
                <div>
                  <h3>{sonderobjekt.name}</h3>
                  <div className="v2-pkg-price is-text">{sonderobjekt.preisLabel}</div>
                </div>
                <p>{sonderobjekt.beschreibung}</p>
              </article>
            </div>
          </div>

          {/* --- Gruppe Film --- */}
          <div data-reveal>
            <div className="v2-pkg-group-head">
              <span className="dot terra" />
              <span>Film</span>
            </div>
            <p className="v2-pkg-note">
              <strong>Objektfilm mit oder ohne Ihren Auftritt?</strong> Der Objektfilm inszeniert
              die Immobilie ohne Personen vor der Kamera. Auf Wunsch stehen Sie selbst im Bild,
              das buchen Sie als Erweiterung dazu.
            </p>
            <div className="v2-pkg-rows">
              {filmpakete.map((f) => (
                <article className="v2-pkg-row" key={f.key}>
                  <div>
                    <h3>{f.name}</h3>
                    <div className="v2-pkg-price">{preis(f.preis)}<small>netto</small></div>
                  </div>
                  <p>{f.beschreibung}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="v2-chance" data-reveal>
          <span className="label">Mehrere Objekte</span>
          <p>
            Für jedes weitere Objekt am selben Produktionstag reduziert sich der fotografische
            Grundpreis um {preis(buendelVorteil.betrag)}. Voraussetzung sind derselbe Kunde,
            gemeinsame Rechnung, eine sinnvolle Route ohne zusätzliche Anfahrt und vorbereitete
            Objekte. Der Vorteil gilt für den fotografischen Grundpreis, nicht für Film, Drohne
            oder Express.
          </p>
        </div>

        <div className="v2-pkg-ctas" data-reveal>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
              Paket &amp; Termin anfragen <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="v2-btn ghost" onClick={() => scrollToId('anfrage')}>
              Nachricht schreiben
            </button>
          </Magnetic>
        </div>

        <p className="v2-fine is-text" data-reveal>
          Jedes Paket lässt sich ergänzen, etwa um Drohne, Launch-Reel oder Ihren Auftritt vor der
          Kamera. Die Optionen und ihre Preise sehen Sie in der Terminanfrage, wo sie direkt
          mitgerechnet werden. Alle Preise netto, zzgl. gesetzl. MwSt.
        </p>
      </div>
    </section>
  );
}
