import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../fx.jsx';
import { kennzahlen, kennzahlenQuelle } from '../../content/site.js';

/**
 * Kennzahlenband unter dem Hero, wie im bisherigen Onepager.
 *
 * Der Zielwert ist der Ausgangszustand: im vorgerenderten HTML, ohne
 * JavaScript und bei reduzierter Bewegung steht der richtige Wert. Die
 * Animation zählt nur dann hoch, wenn sie tatsächlich starten kann.
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
          // rAF liefert den Frame-Zeitstempel, der vor `start` liegen kann.
          const p = Math.min(Math.max((jetzt - start) / dauer, 0), 1);
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
    <section className="v2-stats qb-signale" aria-label="Kennzahlen">
      <div className="v2-wrap">
        {/* Unsichtbarer Spiegel der Quellenzeile: gleicht deren Höhe oben aus,
            damit die Kennzahlen im Band mittig stehen. */}
        <p className="v2-stats-src qb-spiegel" aria-hidden="true">{kennzahlenQuelle}</p>
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
