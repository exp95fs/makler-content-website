import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';

/**
 * FAQ von der Live-Seite. Fragen und Reihenfolge unverändert.
 * Vier Antworten sind angepasst, siehe Kommentare an der jeweiligen Stelle.
 */
const items = [
  {
    q: 'Was kostet die Produktion?',
    a: 'Der Preis richtet sich nach der Objektklasse und steht vor dem Termin fest: 350 € netto für eine Wohnung, 450 € für ein Einfamilienhaus, 550 € für ein Mehrfamilienhaus. Für größere oder besondere Objekte erhalten Sie nach einer kurzen Prüfung einen verbindlichen Festpreis. Keine Abrechnung nach Aufwand, keine Nachberechnung.',
  },
  {
    q: 'Wie viel Zeit kostet mich das?',
    a: 'Die Anfrage. Mehr nicht. Wir stimmen den Termin direkt mit dem Eigentümer ab, schicken vorab die Checkliste zur Objektvorbereitung und sind zum vereinbarten Zeitpunkt vor Ort. Sie müssen nicht dabei sein.',
  },
  {
    q: 'Wer spricht mit dem Eigentümer?',
    a: 'Wir. Und wir treten dabei als Teil Ihrer Vermarktung auf, nicht als unabhängiger Dienstleister. Der Verkauf einer Immobilie ist für Eigentümer ein sensibler Vorgang, entsprechend verhalten wir uns vor Ort: angekündigt, pünktlich, zurückhaltend und im Namen Ihres Büros.',
  },
  {
    q: 'Wie muss die Immobilie vorbereitet sein?',
    a: 'Aufgeräumt, zugänglich, persönliche Gegenstände entfernt, Außenbereiche in ordentlichem Zustand. Die Checkliste dazu geht vorab an Sie und auf Wunsch direkt an den Eigentümer. Ist ein Objekt nicht so weit, kostet das Zeit vor Ort, die wir dann gemeinsam einplanen müssen.',
  },
  {
    q: 'Wie schnell wird geliefert?',
    // TODO: Angabe durch Fabian bestätigen (Regellieferzeit je Objektklasse).
    a: 'Den Liefertermin nennen wir verbindlich mit der Bestätigung, gemeinsam mit dem Festpreis. Wenn es schneller gehen muss, ist eine vorgezogene Bearbeitung gegen Aufschlag möglich.',
  },
  {
    q: 'Was passiert bei schlechtem Wetter?',
    a: 'Die Innenaufnahmen finden statt. Außen- und Drohnenaufnahmen holen wir an einem passenden Tag nach, ohne dass ein zweiter Produktionstag berechnet wird. Ob am Standort geflogen werden darf, prüfen wir vor dem Termin.',
  },
  {
    q: 'Was lässt sich ergänzen?',
    a: 'Im Buchungsprozess können Sie direkt ein Launch-Reel dazubuchen, einen vertikalen Rundgang für Social Media. Drohnenaufnahmen, ein Objektfilm oder Ihr Auftritt vor der Kamera sind ebenfalls möglich. Was für ein Objekt sinnvoll ist, unterscheidet sich stark, deshalb stimmen wir das in einem kurzen Gespräch ab, statt es pauschal mitzuverkaufen.',
  },
  {
    q: 'Wem gehören die Aufnahmen?',
    // TODO: Angabe durch Fabian bestätigen (genauer Umfang der Nutzungsrechte).
    a: 'Sie erhalten die Rechte, die Aufnahmen für die Vermarktung des Objekts und auf Ihren eigenen Kanälen zu nutzen. Ob wir das Ergebnis als Arbeitsprobe zeigen dürfen, vereinbaren wir separat, und Sie können das jederzeit widerrufen.',
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
    <section className="v2-sec bg-linen-2" id="faq">
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
