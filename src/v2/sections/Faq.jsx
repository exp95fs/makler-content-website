import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';

/**
 * FAQ. Wo eine belastbare Angabe noch fehlt, steht eine Platzhalterantwort
 * mit TODO. Diese Stellen vor Veröffentlichung bestätigen lassen.
 */
const items = [
  {
    q: 'Was ist im Preis einer Objektklasse enthalten?',
    a: 'Die Produktion vor Ort und die vollständige Bearbeitung einer auf das Objekt abgestimmten Bildauswahl. Enthalten sind Innenaufnahmen, Außenansichten sowie Neben- und Technikräume, soweit sie ins Exposé gehören. Sie erhalten die Dateien einsatzfertig für Exposé, Portale und Ihre eigenen Kanäle. Erweiterungen wie Drohne oder Video kommen separat dazu.',
  },
  {
    q: 'Wie muss die Immobilie vorbereitet sein?',
    a: 'Die Räume sollten aufgeräumt und zugänglich sein, persönliche Gegenstände entfernt, Außenbereiche in ordentlichem Zustand und der Zugang zum Termin geklärt. Sie erhalten dafür vorab eine kurze Checkliste. Ist ein Objekt nicht aufnahmebereit, kostet das Zeit vor Ort, die wir dann gemeinsam einplanen müssen.',
  },
  {
    q: 'Wie schnell wird geliefert?',
    // TODO: Angabe durch Fabian bestätigen (Regellieferzeit je Objektklasse und je Video-Umfang).
    a: 'Den Liefertermin nennen wir verbindlich mit der Auftragsbestätigung, abhängig von Umfang und Auslastung. Wenn es schneller gehen muss, gibt es die Express-Bearbeitung mit einem Aufschlag von 30 Prozent, mindestens 120 Euro.',
  },
  {
    q: 'Was passiert bei schlechtem Wetter oder wenn die Drohne nicht fliegen darf?',
    a: 'Innenaufnahmen finden statt. Außen- und Drohnenaufnahmen verschieben wir auf einen passenden Termin, ohne dass dafür ein zweiter Produktionstag berechnet wird. Drohnenflüge hängen zusätzlich von der rechtlichen Zulässigkeit am Standort ab. Das prüfen wir vor dem Termin, nicht erst vor Ort.',
  },
  {
    q: 'Wie viele Korrekturschleifen sind enthalten?',
    // TODO: Angabe durch Fabian bestätigen (Anzahl der enthaltenen Korrekturrunden je Leistung).
    a: 'Eine gebündelte Korrekturrunde ist Bestandteil jeder Produktion. Sie sammeln Ihre Anmerkungen und geben sie in einem Durchgang, das hält den Ablauf für beide Seiten schlank. Weitergehende Änderungswünsche stimmen wir separat ab.',
  },
  {
    q: 'Wie sind die Nutzungsrechte geregelt?',
    // TODO: Angabe durch Fabian bestätigen (genauer Umfang der Nutzungsrechte je Leistung).
    a: 'Sie erhalten die Rechte, die Aufnahmen für die Vermarktung des Objekts und für Ihre eigenen Kanäle zu nutzen. Ob wir das Ergebnis als Arbeitsprobe zeigen dürfen, vereinbaren wir separat, und Sie können das jederzeit widerrufen.',
  },
  {
    q: 'Was kostet es, wenn mehrere Objekte am selben Tag produziert werden?',
    a: 'Für jedes weitere Objekt am selben Produktionstag reduziert sich der fotografische Grundpreis um 50 Euro. Voraussetzung sind derselbe Kunde, eine gemeinsame Rechnung, eine sinnvolle Route ohne zusätzliche Anfahrt und vorbereitete Objekte.',
  },
  {
    q: 'Wo sind Sie im Einsatz und kommt Anfahrt dazu?',
    // TODO: Angabe durch Fabian bestätigen (Einsatzradius ohne Aufschlag und Konditionen darüber hinaus).
    a: 'Der Schwerpunkt liegt in Bühl, Mittelbaden und der Ortenau. Objekte darüber hinaus sind möglich, wir nennen die Anfahrt dann vor der Zusage im Festpreis. Sie erfahren die Kondition also, bevor Sie sich entscheiden.',
  },
  {
    q: 'Wie funktioniert eine regelmäßige Zusammenarbeit?',
    a: 'Wenn laufend Objekte anstehen, planen wir Produktionstage im Voraus und arbeiten mit festen Abläufen und einem Ansprechpartner. Die Konditionen hängen davon ab, wie viele Objekte anfallen und wie gut sie sich bündeln lassen. Das besprechen wir im Gespräch, statt eine Pauschale zu nennen, die nicht zu Ihrem Volumen passt.',
  },
  {
    q: 'Worin unterscheiden sich Objektcontent und Marke & Social?',
    a: 'Objektcontent verkauft eine konkrete Immobilie. Marke & Social macht Ihr Büro sichtbar, unabhängig vom einzelnen Objekt. Beides entsteht oft aus derselben Produktion: Der Objektfilm verkauft die Immobilie und zeigt gleichzeitig, wie Sie arbeiten. Objektcontent hat feste Preise, Marke & Social wird nach einem Gespräch angeboten.',
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
