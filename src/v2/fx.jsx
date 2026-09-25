import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * GSAP, ScrollTrigger und Lenis werden erst bei Bedarf als eigener Chunk
 * geladen und bei reduzierter Bewegung gar nicht: alle Aufrufer prüfen
 * vorher prefersReducedMotion(). Einmal geladen, teilen sich alle
 * Aufrufer dieselbe Instanz.
 */
let motion = null;
export function ladeMotion() {
  if (!motion) {
    motion = Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')])
      .then(([g, st, l]) => {
        const gsap = g.gsap || g.default;
        const { ScrollTrigger } = st;
        gsap.registerPlugin(ScrollTrigger);
        return { gsap, ScrollTrigger, Lenis: l.default };
      });
  }
  return motion;
}

let lenisInstance = null;

/** Smooth Scrolling (Lenis) + globale Scroll-Effekte. Einmal in AppV2 mounten. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('no-fx');
      return undefined;
    }
    let abgebrochen = false;
    let aufraeumen = null;
    ladeMotion().then(({ gsap, ScrollTrigger, Lenis }) => {
      if (abgebrochen) return;
      aufraeumen = starteSmoothScroll(gsap, ScrollTrigger, Lenis);
    });
    return () => { abgebrochen = true; aufraeumen?.(); };
  }, []);
}

function starteSmoothScroll(gsap, ScrollTrigger, Lenis) {
  {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    let beobachter = null;
    const ctx = gsap.context(() => {
      // Elemente, die beim Start schon im Bild sind, werden nicht animiert:
      // sie stehen bereits sichtbar im vorgerenderten HTML und sollen nicht
      // aus- und wieder eingeblendet werden.
      //
      // Erst alle Positionen lesen (ein Layout), dann schreiben. Ein
      // gemeinsamer IntersectionObserver startet die Animationen; eigene
      // ScrollTrigger je Element würden beim Start für jedes Element das
      // Layout neu berechnen und den Hauptthread blockieren.
      const grenze = window.innerHeight * 0.9;
      const unten = (el) => el.getBoundingClientRect().top >= grenze;
      const reveals = gsap.utils.toArray('[data-reveal]');
      const splits = gsap.utils.toArray('.v2-split[data-split-scroll]');
      const revealUnten = new Set(reveals.filter(unten));
      const splitUnten = new Set(splits.filter(unten));

      reveals.forEach((el) => { if (!revealUnten.has(el)) el.classList.add('is-in'); });
      splits.forEach((el) => { if (!splitUnten.has(el)) el.classList.add('is-done'); });
      if (revealUnten.size) gsap.set([...revealUnten], { opacity: 0, y: 34 });
      splitUnten.forEach((el) => gsap.set(el.querySelectorAll('.wi'), { yPercent: 115 }));

      const starte = (el) => {
        if (splitUnten.has(el)) {
          gsap.to(el.querySelectorAll('.wi'), {
            yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.05,
            onComplete: () => el.classList.add('is-done'),
          });
        } else {
          gsap.to(el, {
            opacity: 1, y: 0, duration: 1.15, ease: 'power3.out',
            delay: parseFloat(el.dataset.delay || 0),
            onComplete: () => el.classList.add('is-in'),
          });
        }
      };
      beobachter = new IntersectionObserver((eintraege) => {
        eintraege.forEach((e) => {
          if (!e.isIntersecting) return;
          beobachter.unobserve(e.target);
          starte(e.target);
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      revealUnten.forEach((el) => beobachter.observe(el));
      splitUnten.forEach((el) => beobachter.observe(el));

      // Parallax: data-parallax="20" => bewegt sich um ±20% der eigenen Höhe
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || 12);
        gsap.fromTo(el, { yPercent: -amount / 2 }, {
          yPercent: amount / 2, ease: 'none',
          // <picture> ist display: contents und hat keine eigene Box
          scrollTrigger: { trigger: el.parentElement.closest(':not(picture)'), start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Bild-Reveal mit Clip
      gsap.utils.toArray('[data-clip-reveal]').forEach((el) => {
        gsap.fromTo(el,
          { clipPath: 'inset(12% 6% 12% 6% round 4px)', scale: 1.06 },
          {
            clipPath: 'inset(0% 0% 0% 0% round 4px)', scale: 1,
            duration: 1.4, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
      });
    });

    return () => {
      beobachter?.disconnect();
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }
}

/**
 * Reveal für Elemente, die erst nach dem Mount dazukommen, etwa nach
 * "weitere Aufnahmen anzeigen".
 *
 * Die globalen ScrollTrigger werden einmalig beim Mount registriert. Alles,
 * was danach in den DOM kommt, trägt zwar `data-reveal`, bekommt aber keinen
 * Tween mehr - und `[data-reveal]` steht per CSS auf `opacity: 0`. Ohne
 * diesen Nachzug bliebe der nachgeladene Inhalt unsichtbar.
 */
export function revealNachgeladen(wurzel) {
  if (!wurzel) return;
  const neu = wurzel.querySelectorAll('[data-reveal]:not(.is-in)');
  if (!neu.length) return;
  if (prefersReducedMotion()) {
    neu.forEach((el) => el.classList.add('is-in'));
    return;
  }
  ladeMotion().then(({ gsap, ScrollTrigger }) => {
    neu.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 34 },
        {
          opacity: 1, y: 0,
          duration: 1.15,
          ease: 'power3.out',
          delay: parseFloat(el.dataset.delay || 0),
          scrollTrigger: { trigger: el, start: 'top 95%', once: true },
          onComplete: () => el.classList.add('is-in'),
        });
    });
    ScrollTrigger.refresh();
  });
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  // Den Abstand zur Navigation liefert scroll-margin-top (v2.css), das
  // Lenis beim Anspringen berücksichtigt.
  if (lenisInstance) lenisInstance.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/**
 * Sprung zu einer Sektion des Onepagers per Ankerlink: weich scrollen,
 * Adresse aktualisieren und den Fokus auf die Zielsektion setzen, damit
 * Tastatur- und Screenreader-Nutzer dort weiterlesen.
 */
export function springeZu(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToId(id);
  if (window.location.hash !== `#${id}`) window.history.pushState(null, '', `#${id}`);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  return true;
}

/** Zerlegt Text in Wort-Masken für den Staffel-Reveal. */
export function Split({ children, as: Tag = 'span', className = '', scroll = true, ...rest }) {
  const words = [];
  const walk = (node, keyPrefix = 'k') => {
    if (typeof node === 'string') {
      node.split(/(\s+)/).forEach((part, i) => {
        if (part.trim() === '') { if (part) words.push(' '); return; }
        words.push(
          <span className="w" key={`${keyPrefix}-${i}`}>
            <span className="wi">{part}</span>
          </span>,
        );
      });
    } else if (Array.isArray(node)) {
      node.forEach((n, i) => walk(n, `${keyPrefix}${i}`));
    } else if (node && node.props) {
      words.push(
        <span className={`w ${node.props.className || ''}`} key={keyPrefix + 'el'}>
          <span className="wi">{node.props.children}</span>
        </span>,
      );
    }
  };
  walk(children);
  return (
    <Tag className={`v2-split ${className}`} {...(scroll ? { 'data-split-scroll': '' } : {})} {...rest}>
      {words}
    </Tag>
  );
}

/** Custom Cursor: Punkt + nachlaufender Ring, wächst über Links/Medien. */
export function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return undefined;
    document.body.classList.add('v2-cursor-on');

    const dot = dotRef.current;
    const ring = ringRef.current;
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };

    const onMove = (e) => { pos.x = e.clientX; pos.y = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });

    let raf;
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onOver = (e) => {
      const view = e.target.closest('[data-cursor="view"]');
      const link = e.target.closest('a, button, [role="button"], .v2-pill');
      ring.classList.toggle('is-view', !!view);
      ring.classList.toggle('is-link', !view && !!link);
      if (view && labelRef.current) labelRef.current.textContent = view.dataset.cursorLabel || 'Ansehen';
    };
    document.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      document.body.classList.remove('v2-cursor-on');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="v2-cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="v2-cursor-ring" ref={ringRef} aria-hidden="true">
        <span className="v2-cursor-label" ref={labelRef}>Ansehen</span>
      </div>
    </>
  );
}

/** Magnetischer Hover für Buttons. */
export function Magnetic({ children, strength = 0.32 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    if (window.matchMedia('(hover: none)').matches) return undefined;

    let xTo = null;
    let yTo = null;
    let abgebrochen = false;
    ladeMotion().then(({ gsap }) => {
      if (abgebrochen) return;
      xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    });

    const onMove = (e) => {
      if (!xTo) return;
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { if (xTo) { xTo(0); yTo(0); } };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      abgebrochen = true;
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);
  return (
    <span ref={ref} style={{ display: 'inline-flex', willChange: 'transform' }}>
      {children}
    </span>
  );
}
