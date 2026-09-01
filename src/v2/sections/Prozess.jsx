import { useEffect, useRef } from 'react';
import { Split, gsap, ScrollTrigger, prefersReducedMotion, scrollToId } from '../fx.jsx';

/**
 * "So läuft's ab" von der Live-Seite. Texte wörtlich, mit einer Korrektur
 * in Schritt 02: "Sie müssen nicht dabei sein" gilt nicht, wenn der Makler
 * selbst vor der Kamera steht.
 */
const schritte = [
  { t: 'Kurzes Briefing', x: '10 Minuten am Telefon: Objekt, Ziel (Verkauf/Vermietung), Termin.' },
  { t: 'Ein Termin vor Ort', x: 'Fotos und Video in einem Durchgang. Sie müssen nicht dabei sein, außer Sie möchten selbst vor der Kamera stehen.' },
  { t: 'Konzipierter Schnitt', x: 'Geschnitten nach Konzept, nicht nach Schema.' },
  { t: 'Schnelle Lieferung', x: 'Sie erhalten Ihre finalen Fotos, Videos und Reels einsatzbereit für Portale, Exposé und Social Media.' },
];

export function Prozess() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.to('.v2-flow-line .fill', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.v2-flow', start: 'top 72%', end: 'bottom 55%', scrub: 0.4 },
      });
      gsap.utils.toArray('.v2-flow-step').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 68%',
          onEnter: () => el.classList.add('is-active'),
          onLeaveBack: () => el.classList.remove('is-active'),
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="v2-sec tight bg-linen-2" id="prozess" ref={rootRef}>
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>So läuft&rsquo;s ab</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            In vier Schritten zum fertigen Objekt-Content.
          </Split>
        </div>
        <ol className="v2-flow">
          <div className="v2-flow-line" aria-hidden="true"><div className="fill" /></div>
          {schritte.map((s, i) => (
            <li className="v2-flow-step" key={s.t} data-reveal data-delay={Math.min(i * 0.09, 0.3)}>
              <span className="n">0{i + 1}</span>
              <h3>{s.t}</h3>
              <p>{s.x}</p>
            </li>
          ))}
        </ol>
        <p className="v2-flow-weiter" data-reveal>
          Von hier führen zwei Wege weiter: Sie stellen Ihre Produktion direkt zusammen und fragen
          einen Termin an, oder Sie melden sich unverbindlich über das Kontaktformular.
          {' '}
          <button type="button" className="v2-link-inline" onClick={() => scrollToId('preise')}>
            Zum Buchungsprozess
          </button>
          {' · '}
          <button type="button" className="v2-link-inline" onClick={() => scrollToId('kontakt')}>
            Zum Kontaktformular
          </button>
        </p>
      </div>
    </section>
  );
}
