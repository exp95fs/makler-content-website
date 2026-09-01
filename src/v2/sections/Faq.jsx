import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';

/**
 * FAQ von der Live-Seite. Fragen und Reihenfolge unverändert.
 * Vier Antworten sind angepasst, siehe Kommentare an der jeweiligen Stelle.
 */
const items = [
  {
    q: 'Lohnt sich das wirtschaftlich?',
    // Antwort komplett neu: die frühere baute auf Statistiken auf, für die
    // keine belastbare Primärquelle für den deutschen Markt vorliegt.
    a: 'Im Portal steht Ihr Objekt neben vielen anderen, und dort entscheidet die Darstellung darüber, ob jemand weiterklickt. Wer das Objekt vorher gesehen und verstanden hat, meldet sich gezielter, was Ihnen Besichtigungen erspart, die zu nichts führen. Dazu kommt die Wirkung im Eigentümergespräch: Sie zeigen, wie Sie vermarkten, statt es zu beschreiben. Gemessen an der Provision eines einzelnen Objekts bewegt sich die Produktion ab 350 € netto in einer Größenordnung, die sich schon über einen Auftrag rechnet.',
  },
  {
    q: 'Erstellen Sie auch Content für Objekte zur Vermietung?',
    // Angepasst: Ferien- und Kurzzeitobjekte werden nicht mehr genannt.
    a: 'Ja. Neben Verkaufsobjekten produzieren wir gezielt Content für Mietobjekte. Dort zählt vor allem, dass das Objekt schnell verstanden wird und die Aufnahmen über eine einzelne Vermietung hinaus nutzbar bleiben.',
  },
  {
    q: 'Wie läuft die Terminanfrage ab?',
    // Angepasst: der frühere 10-%-Rabatt gilt nicht mehr.
    a: 'Sie stellen Ihr Paket im Anfragebereich zusammen und wählen einen Wunschtermin. Die Anfrage ist unverbindlich, wir melden uns innerhalb von 1–2 Werktagen persönlich mit einer verbindlichen Bestätigung.',
  },
  {
    q: 'Was kostet die Produktion?',
    // Angepasst an die neue Preisarchitektur.
    a: 'Der Fotopreis richtet sich nach dem Objektumfang: 350 € netto für eine Wohnung, 450 € für ein Einfamilienhaus, 550 € für ein Mehrfamilienhaus. Der Objektfilm kostet 890 €, dazu kommen optionale Erweiterungen wie Drohne, Launch-Reel oder Home Staging. Für jedes weitere Objekt am selben Produktionstag sinkt der fotografische Grundpreis um 50 €. Ihr genauer Preis wird in der Terminanfrage berechnet.',
  },
  {
    q: 'Wie viel Zeit kostet mich das?',
    a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest machen wir.',
  },
  {
    q: 'Wem gehören die Aufnahmen?',
    a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Wir dürfen das Ergebnis als Arbeitsprobe zeigen.',
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
