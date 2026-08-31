import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';
import { objektklassen, sonderobjekt, buendelVorteil, level, erweiterungen, preis } from '../../content/site.js';

/**
 * Objektcontent im Detail: Einordnung als Vermarktungspaket, Objektklassen,
 * Vermarktungslevel, Erweiterungen, Rahmenhinweis, Objektvorbereitung.
 * Sämtliche Preise stammen aus src/content/site.js.
 */
export function Objektcontent() {
  return (
    <section className="v2-sec bg-linen-2" id="objektcontent">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Stufe 1 · Objektcontent</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Sie buchen kein Bilderpaket. Sie buchen die Vermarktung eines Objekts.
          </Split>
          <p className="v2-lead" data-reveal>
            Eine Immobilie hat mehrere Anlässe, zu denen sie sichtbar werden muss: die Ankündigung,
            den Start der Vermarktung, die Phase der aktiven Suche, besondere Merkmale des Objekts
            und schließlich den Abschluss. Wir planen die Produktion so, dass für diese Anlässe
            Material vorhanden ist, statt einmal zum Start zu fotografieren.
          </p>
        </div>

        {/* --- Objektklassen --- */}
        <div className="qb-block" data-reveal>
          <h3 className="qb-block-h">Objektklassen</h3>
          <p className="qb-block-lead">
            Der Preis richtet sich nach dem Umfang des Objekts. Die Qualität der Aufnahmen ist in
            jeder Klasse dieselbe. Sie erhalten eine auf das Objekt abgestimmte, vollständig
            bearbeitete Bildauswahl.
          </p>
        </div>
        <div className="qb-klassen">
          {objektklassen.map((k) => (
            <article className="qb-klasse" key={k.key} data-reveal>
              <div>
                <h4>{k.name}</h4>
                <p>{k.beschreibung}</p>
              </div>
              <div className="qb-klasse-preis">{preis(k.preis)}<small>netto</small></div>
            </article>
          ))}
          <article className="qb-klasse is-sonder" data-reveal>
            <div>
              <h4>{sonderobjekt.name}</h4>
              <p>{sonderobjekt.beschreibung}</p>
            </div>
            <div className="qb-klasse-preis is-text">{sonderobjekt.preisLabel}</div>
          </article>
        </div>
        <p className="v2-fine is-text" data-reveal>
          Mehrere Objekte am selben Produktionstag: Für jedes weitere Objekt reduziert sich der
          fotografische Grundpreis um {preis(buendelVorteil.betrag)}. {buendelVorteil.bedingungen}
        </p>

        {/* --- Vermarktungslevel --- */}
        <div className="qb-block" data-reveal style={{ marginTop: 'clamp(48px, 6vw, 84px)' }}>
          <h3 className="qb-block-h">Umfang der Vermarktung</h3>
          <p className="qb-block-lead">
            Auf der Objektklasse baut auf, wie weit das Objekt sichtbar werden soll. Alle drei
            Stufen entstehen aus demselben Vor-Ort-Termin.
          </p>
        </div>
        <div className="qb-level">
          {level.map((l) => (
            <article className={`qb-lv ${l.empfohlen ? 'is-rec' : ''}`} key={l.key} data-reveal>
              {l.empfohlen && <span className="qb-lv-flag">Empfohlen</span>}
              <h4>{l.name}</h4>
              <p className="qb-lv-zweck">{l.zweck}</p>
              <ul>
                {l.punkte.map((p) => <li key={p}><i>—</i>{p}</li>)}
              </ul>
            </article>
          ))}
        </div>

        {/* --- Erweiterungen --- */}
        <div className="qb-block" data-reveal style={{ marginTop: 'clamp(48px, 6vw, 84px)' }}>
          <h3 className="qb-block-h">Erweiterungen</h3>
          <p className="qb-block-lead">
            Ergänzt wird, was zum Objekt passt. Wir schlagen nur vor, was für die Vermarktung
            dieser Immobilie einen erkennbaren Zweck hat.
          </p>
        </div>
        <div className="qb-addons">
          {erweiterungen.map((e) => (
            <div className="qb-addon" key={e.key} data-reveal>
              <div className="qb-addon-h">
                <h4>{e.name}</h4>
                <span className="qb-addon-p">{e.preisLabel}</span>
              </div>
              <p>{e.beschreibung}</p>
            </div>
          ))}
        </div>
        <p className="v2-fine" data-reveal>Alle Preise netto, zzgl. gesetzlicher USt.</p>

        {/* --- Rahmen + Vorbereitung --- */}
        <div className="qb-hinweise">
          <div className="qb-hinweis" data-reveal>
            <span className="k">Regelmäßiger Bedarf</span>
            <p>
              Wenn laufend Objekte anstehen, richten wir die Zusammenarbeit darauf aus: feste
              Abläufe, gebündelte Produktionstage, ein Ansprechpartner. Die Konditionen dafür
              besprechen wir im Gespräch, weil sie vom Volumen und der Terminplanung abhängen.
            </p>
          </div>
          <div className="qb-hinweis" data-reveal>
            <span className="k">Vor dem Termin</span>
            <p>
              Wir setzen ein aufnahmebereites Objekt voraus: aufgeräumte, zugängliche Räume und
              geklärten Zugang. Sie erhalten vorab eine kurze Checkliste, damit der Termin im
              geplanten Rahmen bleibt.
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
