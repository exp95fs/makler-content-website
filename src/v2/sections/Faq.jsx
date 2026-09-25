import { useEffect, useRef, useState } from 'react';
import { Split } from '../fx.jsx';
import { FRAGEN_START } from '../../content/site.js';

export { FRAGEN_START };

/**
 * Häufige Fragen als semantisches HTML (Button + Region). Fragen und
 * Antworten stehen in site.js (`FRAGEN_START`); daraus erzeugt head.js
 * auch das FAQPage-Schema, Text und Schema sind damit identisch.
 */
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
