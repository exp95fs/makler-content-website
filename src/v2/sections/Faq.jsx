import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { fotoklassen, ergaenzungen, preisVoll } from '../../content/site.js';

/**
 * Häufige Fragen als semantisches HTML (Button + Region). Kein FAQ-Schema.
 * Antworten nur mit belegten Angaben: keine Lieferzeiten, keine
 * Rechtebedingungen, keine pauschale Eigentümerkoordination.
 */
const [wohnung, efh, mfh] = fotoklassen;
const drohne = ergaenzungen.find((e) => e.key === 'drohne');
const kurzvideo = ergaenzungen.find((e) => e.key === 'kurzvideo');

/**
 * Fragen des bisherigen Onepagers in der alten Reihenfolge und Tonalität.
 * Korrigiert: keine Zusage "Sie müssen nicht dabei sein", Eigentümer-
 * abstimmung nur bei eingespielter Zusammenarbeit und auf Wunsch, keine
 * Nachberechnungs- oder Expresszusage, keine kostenlose Nachholung von
 * Außenaufnahmen, Nutzungsrechte in der freigegebenen,
 * neutralen Fassung.
 */
export const FRAGEN_START = {
  produktion: {
    q: 'Was kostet die Produktion?',
    a: `Der Preis richtet sich nach der Objektklasse und steht vor dem Termin fest: ${preisVoll(wohnung.foto)} für eine Wohnung, ${preisVoll(efh.foto)} für ein Einfamilienhaus, ${preisVoll(mfh.foto)} für ein Mehrfamilienhaus. Drohnenaufnahmen lassen sich für ${preisVoll(drohne.preis)} ergänzen, ein Objekt-Kurzvideo für ${preisVoll(kurzvideo.preis)}. Für größere oder besondere Objekte erhalten Sie nach kurzer Prüfung einen Festpreis. Die Produktion selbst rechnen wir nicht nach Stunden ab. Zusätzliche Wünsche nach dem Termin stimmen wir vorab mit Ihnen ab und berechnen sie nach Aufwand.`,
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
    a: `Im Buchungsprozess können Sie Drohnenaufnahmen für ${preisVoll(drohne.preis)} und ein Objekt-Kurzvideo für ${preisVoll(kurzvideo.preis)} direkt dazubuchen. Was für ein Objekt sinnvoll ist, unterscheidet sich stark, deshalb stimmen wir das in einem kurzen Gespräch ab, statt es pauschal mitzuverkaufen.`,
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

export function Faq({ fragen = Object.keys(FRAGEN_START), titel = 'Damit keine Fragen offen bleiben.', eyebrow = 'Häufige Fragen', quelle = FRAGEN_START, id = 'faq', bg = 'bg-linen-2' }) {
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
