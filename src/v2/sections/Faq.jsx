import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';

/**
 * FAQ. Wo eine belastbare Angabe noch fehlt, steht eine Platzhalterantwort
 * mit TODO. Diese Stellen vor Veröffentlichung bestätigen lassen.
 */
const items = [
  {
    q: 'Was ist im Preis enthalten?',
    a: 'Die Aufnahmen vor Ort und die fertige Bearbeitung. Enthalten sind Innenräume, Außenansichten sowie Neben- und Technikräume, soweit sie ins Exposé gehören. Sie bekommen die Dateien einsatzfertig für Exposé, Portale und Ihre Website. Drohne und Video kommen separat dazu.',
  },
  {
    q: 'Wie muss die Immobilie vorbereitet sein?',
    a: 'Aufgeräumt, zugänglich, persönliche Gegenstände entfernt, Außenbereiche in ordentlichem Zustand. Sie bekommen vorab eine kurze Checkliste. Ist ein Objekt nicht so weit, kostet das Zeit vor Ort, die wir dann gemeinsam einplanen müssen.',
  },
  {
    q: 'Wie schnell wird geliefert?',
    // TODO: Angabe durch Fabian bestätigen (Regellieferzeit je Objektklasse und je Video-Umfang).
    a: 'Den Liefertermin nennen wir verbindlich mit der Bestätigung. Wenn es schneller gehen muss, gibt es die Express-Bearbeitung mit 30 Prozent Aufschlag, mindestens 120 Euro.',
  },
  {
    q: 'Was passiert bei schlechtem Wetter oder wenn die Drohne nicht fliegen darf?',
    a: 'Die Innenaufnahmen finden statt. Außen- und Drohnenaufnahmen holen wir an einem passenden Tag nach, ohne dass ein zweiter Produktionstag berechnet wird. Ob am Standort geflogen werden darf, prüfen wir vor dem Termin.',
  },
  {
    q: 'Wie viele Korrekturschleifen sind enthalten?',
    // TODO: Angabe durch Fabian bestätigen (Anzahl der enthaltenen Korrekturrunden je Leistung).
    a: 'Eine Korrekturrunde gehört dazu. Sie sammeln Ihre Anmerkungen und geben sie in einem Durchgang. Weitergehende Änderungen stimmen wir separat ab.',
  },
  {
    q: 'Wie sind die Nutzungsrechte geregelt?',
    // TODO: Angabe durch Fabian bestätigen (genauer Umfang der Nutzungsrechte je Leistung).
    a: 'Sie dürfen die Aufnahmen für die Vermarktung des Objekts und auf Ihren eigenen Kanälen nutzen. Ob wir das Ergebnis als Arbeitsprobe zeigen dürfen, vereinbaren wir separat, und Sie können das jederzeit widerrufen.',
  },
  {
    q: 'Wo sind Sie im Einsatz und kommt Anfahrt dazu?',
    // TODO: Angabe durch Fabian bestätigen (Einsatzradius ohne Aufschlag und Konditionen darüber hinaus).
    a: 'Der Schwerpunkt liegt in Bühl, Mittelbaden und der Ortenau. Objekte darüber hinaus sind möglich, die Anfahrt steht dann vor Ihrer Zusage im Festpreis.',
  },
  {
    q: 'Wie funktioniert eine regelmäßige Zusammenarbeit?',
    a: 'Wir planen Produktionstage im Voraus und arbeiten mit festen Abläufen. Was das kostet, hängt davon ab, wie viele Objekte anfallen und wie gut sie sich bündeln lassen. Deshalb besprechen wir es, statt eine Pauschale zu nennen, die nicht zu Ihrem Volumen passt.',
  },
];

function Item({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = open ? `${el.scrollHeight}px` : '0px';
  }, [open]);
  return (
    <div className={`v2-faq-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="v2-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="ico" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
        </span>
      </button>
      <div className="v2-faq-a" ref={bodyRef} aria-hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="v2-sec bg-linen" id="faq">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Häufige Fragen</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Damit keine Fragen offen bleiben.
          </Split>
        </div>
        <div className="v2-faq" data-reveal>
          {items.map((it, i) => (
            <Item key={it.q} q={it.q} a={it.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
