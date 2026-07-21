import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenisInstance = null;

/** Smooth Scrolling (Lenis) + globale Scroll-Effekte. Einmal in AppV2 mounten. */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) {
      document.documentElement.classList.add('no-fx');
      return undefined;
    }

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

    const ctx = gsap.context(() => {
      // Standard-Reveals
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 34 },
          {
            opacity: 1, y: 0,
            duration: 1.15,
            ease: 'power3.out',
            delay: parseFloat(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onComplete: () => el.classList.add('is-in'),
          });
      });

      // Wort-Masken (kinetische Typo)
      gsap.utils.toArray('.v2-split[data-split-scroll]').forEach((el) => {
        gsap.to(el.querySelectorAll('.wi'), {
          y: 0, duration: 1.1, ease: 'power4.out', stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          onComplete: () => el.classList.add('is-done'),
        });
      });

      // Parallax: data-parallax="20" => bewegt sich um ±20% der eigenen Höhe
      gsap.utils.toArray('[data-parallax]').forEach((el) => {
        const amount = parseFloat(el.dataset.parallax || 12);
        gsap.fromTo(el, { yPercent: -amount / 2 }, {
          yPercent: amount / 2, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
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
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: -70, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' });

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
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

/** Zählt eine Zahl hoch, sobald das Element sichtbar wird. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(prefersReducedMotion() ? to : 0);
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / (duration * 1000), 1);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 4))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

export { gsap, ScrollTrigger };
