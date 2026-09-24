import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { fotoklassen, ergaenzungen, preisNetto } from '../../content/site.js';

/**
 * Häufige Fragen als semantisches HTML (Button + Region). Kein FAQ-Schema.
 * Antworten nur mit belegten Angaben: keine Lieferzeiten, keine
 * Rechtebedingungen, keine pauschale Eigentümerkoordination.
 */
const [wohnung, efh, mfh] = fotoklassen;
const drohne = ergaenzungen.find((e) => e.key === 'drohne');

export const FRAGEN = {
  kosten: {
    q: 'Was kostet die Immobilienfotografie?',
    a: `Der Preis richtet sich nach der Objektklasse: ${preisNetto(wohnung.foto)} für eine Wohnung, ${preisNetto(efh.foto)} für ein Einfamilienhaus und ${preisNetto(mfh.foto)} für ein Mehrfamilienhaus. Drohnenaufnahmen lassen sich für ${preisNetto(drohne.preis)} ergänzen. Für größere oder besondere Objekte erhalten Sie nach einer kurzen Prüfung einen Festpreis.`,
  },
  anwesenheit: {
    q: 'Muss ich beim Fototermin dabei sein?',
    a: 'Bei den ersten Projekten stimmen wir den Ablauf persönlich und eng miteinander ab. Wenn die Zusammenarbeit eingespielt ist, kann Quadratblick auf Wunsch die Terminabstimmung mit Eigentümern direkt übernehmen.',
  },
  bereitstellung: {
    q: 'Wann erhalte ich die Bilder?',
    a: 'Den Zeitpunkt der Bereitstellung bestätigen wir zusammen mit Leistungsumfang, Preis und Termin persönlich. Die Bilder werden digital bereitgestellt.',
  },
  video: {
    q: 'Bieten Sie auch Video an?',
    a: 'Der Schwerpunkt liegt auf Immobilienfotografie. Weitere Medienformate, etwa Video, sind auf Anfrage möglich.',
  },
  bilder: {
    q: 'Wie viele Bilder erhalte ich?',
    a: `Als Orientierung: ${wohnung.bilder} bei einer Wohnung, ${efh.bilder} bei einem Einfamilienhaus und ${mfh.bilder} bei einem Mehrfamilienhaus, jeweils 1 bis 2 Bilder je Raum. Die genaue Anzahl richtet sich nach dem Objekt.`,
  },
  vorbereitung: {
    q: 'Wie sollte die Immobilie vorbereitet sein?',
    a: 'Aufgeräumt, zugänglich, persönliche Gegenstände entfernt, Außenbereiche in ordentlichem Zustand. Eine Checkliste zur Objektvorbereitung erhalten Sie vorab.',
  },
  wetter: {
    q: 'Was passiert bei schlechtem Wetter?',
    a: 'Innenaufnahmen sind weitgehend wetterunabhängig. Ob Außen- und Drohnenaufnahmen wie geplant möglich sind, hängt von Witterung und Standort ab. Das stimmen wir vor dem Termin ab.',
  },
  rechte: {
    q: 'Wie dürfen die Bilder genutzt werden?',
    // TODO: Angabe durch Fabian bestätigen (Umfang der Nutzungsrechte).
    a: 'Den Umfang der Nutzungsrechte legen wir mit der Auftragsbestätigung fest.',
  },
};

function Eintrag({ id, q, a, offen, umschalten }) {
  const koerper = useRef(null);
  useEffect(() => {
    const el = koerper.current;
    if (el) el.style.height = offen ? `${el.scrollHeight}px` : '0px';
  }, [offen]);
  return (
    <div className={`v2-faq-item ${offen ? 'is-open' : ''}`}>
      <h3 className="v2-faq-h">
        <button type="button" className="v2-faq-q" id={`${id}-frage`}
                aria-expanded={offen} aria-controls={`${id}-antwort`} onClick={umschalten}>
          <span>{q}</span>
          <span className="ico" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
          </span>
        </button>
      </h3>
      <div className="v2-faq-a" id={`${id}-antwort`} role="region" aria-labelledby={`${id}-frage`}
           ref={koerper} {...(offen ? {} : { inert: '' })}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function Faq({ fragen, titel = 'Häufige Fragen', id = 'faq', bg = 'bg-linen-2' }) {
  const [offen, setOffen] = useState(0);
  return (
    <section className={`v2-sec ${bg}`} id={id} aria-labelledby={`${id}-titel`}>
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>FAQ</p>
          <Split as="h2" id={`${id}-titel`} className="v2-h-display v2-h-lg">{titel}</Split>
        </div>
        <div className="v2-faq" data-reveal>
          {fragen.map((key, i) => (
            <Eintrag key={key} id={`${id}-${key}`} q={FRAGEN[key].q} a={FRAGEN[key].a}
                     offen={offen === i} umschalten={() => setOffen(offen === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
