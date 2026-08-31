import { useEffect, useRef } from 'react';
import { Split, gsap, ScrollTrigger, prefersReducedMotion } from '../fx.jsx';

/**
 * Ablauf aus Kundensicht. Fünf Schritte, kurze Texte.
 * Die Scroll-Fortschrittslinie der bisherigen Prozess-Sektion bleibt erhalten.
 */
const schritte = [
  { t: 'Anfrage', x: 'Sie geben Objekt, gewünschten Umfang und Wunschtermin an. Das geht in wenigen Minuten und ist unverbindlich.' },
  { t: 'Abstimmung', x: 'Sie erhalten die Bestätigung mit Festpreis und Liefertermin. Offene Punkte klären wir kurz telefonisch oder per Mail.' },
  { t: 'Termin', x: 'Der Produktionstag steht fest. Vorab bekommen Sie eine Checkliste, damit das Objekt aufnahmebereit ist.' },
  { t: 'Produktion', x: 'Foto, Drohne und Video entstehen in einem Durchgang vor Ort. Zugang genügt, außer Sie stehen selbst vor der Kamera.' },
  { t: 'Lieferung', x: 'Sie erhalten die bearbeiteten Dateien einsatzfertig zum zugesagten Termin, sortiert nach Verwendungszweck.' },
];

export function Ablauf() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.to('.v2-proc-line .fill', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.v2-proc-steps', start: 'top 72%', end: 'bottom 55%', scrub: 0.4 },
      });
      gsap.utils.toArray('.v2-proc-step').forEach((el) => {
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
    <section className="v2-sec bg-linen" id="ablauf" ref={rootRef}>
      <div className="v2-wrap">
        <div className="v2-proc">
          <div className="v2-proc-left">
            <p className="v2-eyebrow" data-reveal>Ablauf</p>
            <Split as="h2" className="v2-h-display v2-h-lg" style={{ marginTop: 22 }}>
              Von der Anfrage bis zur Lieferung.
            </Split>
            <p className="v2-lead" data-reveal>
              Sie müssen für eine Anfrage kein Gespräch führen. Wenn Sie wissen, was Ihr Objekt
              braucht, buchen Sie den Termin direkt an. Wenn Sie erst etwas klären möchten, melden
              Sie sich, und wir gehen es gemeinsam durch.
            </p>
          </div>
          <div className="v2-proc-steps">
            <div className="v2-proc-line"><div className="fill" /></div>
            {schritte.map((s, i) => (
              <div className="v2-proc-step" key={s.t} data-reveal>
                <span className="num">Schritt 0{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.x}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
