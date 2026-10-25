import { Split, Magnetic } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/**
 * Regelmäßige Zusammenarbeit für Büros mit mehreren Objekten im Jahr.
 * Beschreibt den gemeinsamen Ablauf, kein eigenes Angebot: keine
 * Prozentzahlen, keine Rabatt- oder Paketzusagen.
 *
 * "Zusammenarbeit besprechen" wählt im Anfrageformular das Anliegen
 * "Regelmäßig mehrere Objekte" vor (`data-anliegen`, Kontakt.jsx). Der
 * Textlink darunter führt bestehende Kunden zur Seite /objekt-anfragen.
 */
const punkte = [
  {
    t: 'Einmal abgestimmt',
    x: 'Checkliste, Bildstil und Freigabeweg legen wir zu Beginn fest. Jedes weitere Objekt braucht nur noch Adresse und Wunschtermin.',
  },
  {
    t: 'Ein fester Ansprechpartner',
    x: 'Sie sprechen immer mit derselben Person, die Ihre Objekte und Abläufe kennt.',
  },
  {
    t: 'Einheitlicher Auftritt',
    x: 'Alle Objekte erscheinen in derselben Bildsprache, im Portal wie auf Ihrer Website.',
  },
];

export function Zusammenarbeit() {
  return (
    <section className="v2-sec tight bg-sage" id="zusammenarbeit" aria-labelledby="zusammenarbeit-titel">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Für Maklerbüros und Immobilienabteilungen</p>
          <Split as="h2" id="zusammenarbeit-titel" className="v2-h-display v2-h-lg">
            Mehrere Objekte im Jahr? Ein Ablauf für alle.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wenn Ihr Büro regelmäßig Objekte vermarktet, stimmen wir Ablauf, Ansprechpartner,
            Vorbereitung und Freigaben einmal gemeinsam ab. Danach läuft jedes neue Objekt nach
            demselben Muster.
          </p>
        </div>

        <ul className="v2-brand-grid" data-reveal>
          {punkte.map((p, i) => (
            <li className="v2-brand-cell" key={p.t}>
              <span className="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.t}</h3>
              <p>{p.x}</p>
            </li>
          ))}
        </ul>

        <div className="v2-brand-foot" data-reveal>
          <Magnetic>
            <a className="v2-btn" href="#kontakt" data-cta="zusammenarbeit" data-anliegen="regelmaessig">
              Zusammenarbeit besprechen <Arrow size={15} />
            </a>
          </Magnetic>
          <a className="qb-bestand-link" href="/objekt-anfragen/">
            Bereits Kunde? Neues Objekt direkt anfragen →
          </a>
        </div>
      </div>
    </section>
  );
}
