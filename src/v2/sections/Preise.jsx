import { Split, Magnetic } from '../fx.jsx';
import { Arrow, PreisNetto } from '../ui.jsx';
import { track } from '../tracking.js';
import { fotoklassen, ergaenzungen, preis, brutto, preisNetto, preisBrutto } from '../../content/site.js';
import { beispielFuerPreisklasse, anker } from '../../content/beispiele.js';
import { oeffneBeispiel } from './Referenzen.jsx';

/**
 * Preissektion des Onepagers, Gestaltung wie im bisherigen Onepager:
 * drei gleichwertige Kacheln, ein CTA darunter, Ergänzungen.
 *
 * Preise netto mit kleinem "netto", darunter der Bruttopreis inkl. USt.
 * Der vollständige Hinweis zur Umsatzsteuer steht im Footer.
 *
 * Hat eine Klasse ein freigegebenes Hauptbeispiel, öffnet "Beispiel
 * ansehen" direkt dessen Galerie. Klassen ohne Beispiel bekommen keinen
 * Link, auch keinen deaktivierten.
 *
 * "Für dieses Objekt anfragen" führt zum Anfrageformular und wählt dort
 * die Objektklasse vor (`data-klasse`, ausgewertet in Kontakt.jsx).
 */

export function Preise() {
  return (
    <section className="v2-sec bg-linen" id="preise" aria-labelledby="preise-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Pakete und Preise</p>
          <Split as="h2" id="preise-titel" className="v2-h-display v2-h-lg">
            Ein Festpreis. Alles inkludiert. Ohne Überraschungen.
          </Split>
          <p className="v2-lead" data-reveal>
            Jedes Paket enthält alle Bilder, die Sie für eine erfolgreiche Vermarktung
            brauchen. Die Preise unterscheiden sich allein nach Größe des Objekts und
            damit nach der Anzahl der Bilder.
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
                <small>{preis(brutto(k.foto))} inkl. 19 % USt.</small>
              </p>
              <p className="menge">{k.bilder}</p>
              <BeispielLink klasse={k} />
              <a className="v2-btn ghost sm anfrage" href="#kontakt" data-klasse={k.key}
                 onClick={() => track('preiskachel_anfrage', { klasse: k.key })}>
                Für dieses Objekt anfragen<span className="qb-sr">: {k.name}</span>
              </a>
            </article>
          ))}
        </div>

        <div className="qb-pakete-fuss" data-reveal>
          <Magnetic strength={0.18}>
            <a className="v2-btn" href="#kontakt" data-cta="preise">
              Unverbindlich anfragen <Arrow size={16} />
            </a>
          </Magnetic>
        </div>

        <div className="qb-ergaenzung" data-reveal>
          <div className="text">
            <span className="k">Dazu buchbar</span>
            <h3>Was sich sinnvoll ergänzen lässt</h3>
            <p>
              Nicht jedes Objekt braucht dasselbe. Drohnenaufnahmen und ein Objekt-Kurzvideo
              lassen sich zu jeder Objektklasse ergänzen. Was für Ihr Objekt sinnvoll ist,
              stimmen wir nach Ihrer Anfrage kurz mit Ihnen ab.
            </p>
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

function BeispielLink({ klasse }) {
  const l = beispielFuerPreisklasse(klasse.key);
  if (!l) return null;
  const slug = l.slug;
  return (
    <a className="bsp" href={`#${anker(slug)}`} aria-haspopup="dialog"
       onClick={(e) => { e.preventDefault(); oeffneBeispiel(slug, e.currentTarget, 'preiskachel'); }}>
      Beispiel ansehen<span className="qb-sr">: {klasse.name}</span> <Arrow size={14} />
    </a>
  );
}
