import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../fx.jsx';
import { kennzahlen, kennzahlenQuelle } from '../../content/site.js';

/**
 * Kennzahlenband unter dem Hero.
 *
 * Wichtig: Der Zielwert ist der Ausgangszustand. Auf der Live-Seite startet
 * der Zähler bei 0 und bleibt dort stehen, wenn die Animation nicht anläuft,
 * sodass "+0 %" zu lesen ist. Hier wird der Endwert direkt gerendert; die
 * Animation zählt nur dann hoch, wenn sie tatsächlich starten kann. Ohne
 * JavaScript, bei prefers-reduced-motion oder wenn der IntersectionObserver
 * nie feuert, steht der richtige Wert.
 */
function Stat({ wert, prefix = '', suffix = '', label }) {
  const [anzeige, setAnzeige] = useState(wert);
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    let frame = null;
    const beobachter = new IntersectionObserver((eintraege) => {
      eintraege.forEach((e) => {
        if (!e.isIntersecting) return;
        beobachter.unobserve(el);
        const dauer = 1200;
        const start = performance.now();
        const tick = (jetzt) => {
          const p = Math.min((jetzt - start) / dauer, 1);
          setAnzeige(Math.round(wert * (1 - Math.pow(1 - p, 3))));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        setAnzeige(0);
        frame = requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    beobachter.observe(el);
    return () => { beobachter.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [wert]);

  return (
    <div className="v2-stat" ref={ref}>
      <div className="v2-stat-num">{prefix}{anzeige}{suffix}</div>
      <div className="v2-stat-label">{label}</div>
    </div>
  );
}

export function StatBar() {
  return (
    <section className="v2-stats" aria-label="Kennzahlen">
      <div className="v2-wrap">
        <div className="v2-stats-grid">
          {kennzahlen.map((k) => (
            <Stat key={k.label} wert={k.wert} prefix={k.prefix} suffix={k.suffix} label={k.label} />
          ))}
        </div>
        <p className="v2-stats-src">{kennzahlenQuelle}</p>
      </div>
    </section>
  );
}
