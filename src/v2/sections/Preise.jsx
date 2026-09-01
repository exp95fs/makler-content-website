import { Split } from '../fx.jsx';
import { objektklassen, sonderobjekt, filmarten, optionen, buendelVorteil, preis } from '../../content/site.js';

/**
 * Vollständige Preisdarstellung. Alle Werte kommen aus src/content/site.js,
 * derselben Datei, aus der auch die Vorschau und der Buchungsworkflow lesen.
 */
const objektfilm = filmarten.find((f) => f.key === 'objektfilm');
const maklerfilm = filmarten.find((f) => f.key === 'maklerfilm');
const kurz = (k) => k.kurz || k.name;

function Tabelle({ titel, zeilen, spalte = 'netto' }) {
  return (
    <div className="v2-preistabelle">
      <div className="kopf">
        <span>{titel}</span>
        <span>{spalte}</span>
      </div>
      {zeilen.map((z) => (
        <div className="zeile" key={z.name}>
          <div>
            <b>{z.name}</b>
            {z.text && <p>{z.text}</p>}
          </div>
          <span className={`betrag ${z.istText ? 'is-text' : ''}`}>{z.wert}</span>
        </div>
      ))}
    </div>
  );
}

export function Preise() {
  return (
    <section className="v2-sec bg-linen" id="preise">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Leistungen &amp; Preise</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Alle Leistungen, alle Preise, direkt buchbar.
          </Split>
          <p className="v2-lead" data-reveal>
            Der Preis richtet sich nach der Objektklasse. Darunter stellen Sie Ihre Produktion
            zusammen und fragen einen Termin an, mit denselben Preisen.
          </p>
        </div>

        <div className="v2-preisbloecke">
          {/* 7.1 Foto */}
          <div data-reveal>
            <Tabelle
              titel="Foto"
              zeilen={[
                ...objektklassen.map((k) => ({ name: k.name, text: k.beschreibung, wert: preis(k.foto) })),
                { name: sonderobjekt.name, text: sonderobjekt.beschreibung, wert: sonderobjekt.preisLabel, istText: true },
              ]}
            />
            <p className="v2-preisnote" data-reveal>
              Jede Objektkategorie erhält dieselbe professionelle Qualität. Der Preis richtet sich
              nach dem typischen Produktionsumfang, nicht nach einer Basis- oder Premiumqualität.
            </p>
          </div>

          {/* 7.2 Video */}
          <div data-reveal>
            <Tabelle
              titel="Video · Objektfilm"
              zeilen={[
                ...objektklassen.map((k) => ({ name: kurz(k), wert: preis(k[objektfilm.feld]) })),
                { name: sonderobjekt.name, wert: sonderobjekt.preisLabel, istText: true },
              ]}
            />
            <p className="v2-preisnote">{objektfilm.beschreibung}</p>
          </div>

          {/* 7.3 Maklerfilm */}
          <div data-reveal>
            <Tabelle
              titel="Maklerfilm"
              zeilen={[
                ...objektklassen.map((k) => ({ name: kurz(k), wert: preis(k[maklerfilm.feld]) })),
                { name: sonderobjekt.name, wert: sonderobjekt.preisLabel, istText: true },
              ]}
            />
            <p className="v2-preisnote">
              Der Maklerfilm erweitert den Objektfilm um Ihre persönliche Präsentation vor der
              Kamera.
            </p>
          </div>

          {/* 7.4 Erweiterungen */}
          <div data-reveal>
            <Tabelle
              titel="Weitere Erweiterungen"
              zeilen={optionen.map((o) => ({
                name: o.zusatz ? `${o.name} (${o.zusatz})` : o.name,
                wert: o.preisLabel,
                istText: !o.preis,
              }))}
            />
            <p className="v2-preisnote">
              Für jedes weitere Objekt am selben Produktionstag reduziert sich der fotografische
              Grundpreis um {preis(buendelVorteil.betrag)}. {buendelVorteil.bedingungen}
            </p>
          </div>
        </div>

        <p className="v2-fine is-text" data-reveal>Alle Preise netto, zzgl. gesetzl. MwSt.</p>
      </div>
    </section>
  );
}
