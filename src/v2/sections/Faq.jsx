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

/**
 * Fragen des bisherigen Onepagers in der alten Reihenfolge und Tonalität.
 * Korrigiert: keine Zusage "Sie müssen nicht dabei sein", Eigentümer-
 * abstimmung nur bei eingespielter Zusammenarbeit und auf Wunsch, keine
 * Nachberechnungs- oder Expresszusage, keine kostenlose Nachholung von
 * Außenaufnahmen, kein Launch-Reel, Nutzungsrechte in der freigegebenen,
 * neutralen Fassung.
 */
export const FRAGEN_START = {
  produktion: {
    q: 'Was kostet die Produktion?',
    a: `Der Preis richtet sich nach der Objektklasse und steht vor dem Termin fest: ${preisNetto(wohnung.foto)} für eine Wohnung, ${preisNetto(efh.foto)} für ein Einfamilienhaus, ${preisNetto(mfh.foto)} für ein Mehrfamilienhaus, jeweils zzgl. der gesetzlichen Umsatzsteuer. Drohnenaufnahmen lassen sich für ${preisNetto(drohne.preis)} ergänzen. Für größere oder besondere Objekte erhalten Sie nach einer kurzen Prüfung einen verbindlichen Festpreis. Keine Abrechnung nach Stunden.`,
  },
  zeit: {
    q: 'Wie viel Zeit kostet mich das?',
    a: 'Wenig. Sie stellen die Anfrage, wir stimmen Termin und Umfang mit Ihnen ab, schicken vorab die Checkliste zur Objektvorbereitung und sind zum vereinbarten Zeitpunkt vor Ort. Die ersten Projekte stimmen wir eng miteinander ab. Ist die Zusammenarbeit eingespielt, übernehmen wir auf Wunsch auch die Terminabstimmung mit dem Eigentümer.',
  },
  eigentuemer: {
    q: 'Wer spricht mit dem Eigentümer?',
    a: 'Das legen wir gemeinsam fest. Bei eingespielter Zusammenarbeit übernehmen wir auf Wunsch die Abstimmung direkt. Vor Ort treten wir als Teil Ihrer Vermarktung auf, nicht als unabhängiger Dienstleister. Der Verkauf einer Immobilie ist für Eigentümer ein sensibler Vorgang, entsprechend verhalten wir uns: angekündigt, pünktlich, zurückhaltend und im Namen Ihres Büros.',
  },
  vorbereitung: {
    q: 'Wie muss die Immobilie vorbereitet sein?',
    a: 'Aufgeräumt, zugänglich, persönliche Gegenstände entfernt, Außenbereiche in ordentlichem Zustand. Die Checkliste dazu geht vorab an Sie und auf Wunsch direkt an den Eigentümer. Ist ein Objekt nicht so weit, kostet das Zeit vor Ort, die wir dann gemeinsam einplanen müssen.',
  },
  lieferung: {
    q: 'Wann erhalte ich die Bilder?',
    a: 'Den Zeitpunkt der Bereitstellung nennen wir mit unserer Bestätigung, gemeinsam mit Termin, Leistungsumfang und Preis. Die Bilder werden digital bereitgestellt.',
  },
  wetter: {
    q: 'Was passiert bei schlechtem Wetter?',
    a: 'Die Innenaufnahmen sind weitgehend wetterunabhängig. Ob Außen- und Drohnenaufnahmen wie geplant möglich sind, hängt von Witterung und Standort ab. Das stimmen wir vor dem Termin mit Ihnen ab, ebenso, ob am Standort geflogen werden darf.',
  },
  ergaenzen: {
    q: 'Was lässt sich ergänzen?',
    a: `Im Buchungsprozess können Sie Drohnenaufnahmen für ${preisNetto(drohne.preis)} direkt dazubuchen. Video ist nach individueller Abstimmung möglich. Was für ein Objekt sinnvoll ist, unterscheidet sich stark, deshalb stimmen wir das in einem kurzen Gespräch ab, statt es pauschal mitzuverkaufen.`,
  },
  rechte: FRAGEN.rechte,
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

export function Faq({ fragen, titel = 'Häufige Fragen', eyebrow = 'FAQ', quelle = FRAGEN, id = 'faq', bg = 'bg-linen-2' }) {
  const [offen, setOffen] = useState(0);
  return (
    <section className={`v2-sec ${bg}`} id={id} aria-labelledby={`${id}-titel`}>
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>{eyebrow}</p>
          <Split as="h2" id={`${id}-titel`} className="v2-h-display v2-h-lg">{titel}</Split>
        </div>
        <div className="v2-faq" data-reveal>
          {fragen.map((key, i) => (
            <Eintrag key={key} id={`${id}-${key}`} q={quelle[key].q} a={quelle[key].a}
                     offen={offen === i} umschalten={() => setOffen(offen === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
