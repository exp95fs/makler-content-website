import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll, scrollToId, Split, Cursor, Magnetic, CountUp, gsap, prefersReducedMotion } from './fx.jsx';
import { StorySections } from './StorySections.jsx';
import { BizSections } from './BizSections.jsx';
import { CloseSections } from './CloseSections.jsx';
import logoWhite from '../assets/logo/quadratblick-logo-weiss.png';
import logoBlack from '../assets/logo/quadratblick-logo-schwarz.png';

const NAV_LINKS = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'segmente', label: 'Verkauf/Miete' },
  { id: 'marke', label: 'Markenbildung' },
  { id: 'prozess', label: 'Prozess' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'faq', label: 'FAQ' },
];

export function Arrow({ size = 16 }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function Nav() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 60);
      setHidden(y > 500 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`v2-nav ${solid ? 'is-solid' : ''} ${hidden ? 'is-hidden' : ''}`}>
      <div className="v2-nav-inner">
        <a href="#top" className="v2-nav-logo" onClick={(e) => { e.preventDefault(); scrollToId('top'); }} aria-label="Quadratblick — nach oben">
          <img className="logo-light" src={logoWhite} alt="Quadratblick" />
          <img className="logo-dark" src={logoBlack} alt="Quadratblick" />
        </a>
        <nav className="v2-nav-links" aria-label="Hauptnavigation">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="v2-nav-link" onClick={(e) => { e.preventDefault(); scrollToId(l.id); }}>
              {l.label}
            </a>
          ))}
        </nav>
        <Magnetic strength={0.25}>
          <button type="button" className="v2-btn sm" onClick={() => scrollToId('start')}>
            Termin anfragen <Arrow size={15} />
          </button>
        </Magnetic>
      </div>
    </header>
  );
}

function Hero() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const tween = gsap.fromTo('.v2-hero-media img',
      { scale: 1.14 }, { scale: 1, duration: 2.4, ease: 'power2.out' });
    return () => tween.kill();
  }, []);

  return (
    <section className="v2-hero" id="top">
      <div className="v2-hero-media">
        <img src="/media/hero.jpg" alt="Referenzprojekt: Innenhof eines Mehrgenerationenhauses im warmen Sommerlicht" data-parallax="14" fetchpriority="high" />
      </div>
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        <p className="v2-eyebrow on-dark" data-reveal>Immobilienfotografie &amp; Immobilienvideo · Raum Bühl · Mittelbaden · Ortenau</p>
        <Split as="h1" className="v2-h-display v2-h-xl v2-hero-h" style={{ marginTop: 20 }}>
          Content, der Ihre Objekte heraushebt — und Ihr <span className="accent">Maklerbüro</span>.
        </Split>
        <p className="v2-lead v2-hero-lead" data-reveal data-delay="0.35">
          Professionelle Immobilienfotografie und konzipierte Immobilienvideos für Maklerbüros
          im Raum Bühl, Baden-Baden und Ortenau. Hochwertiger Content, der Ihre Objekte schneller
          vermittelt, qualifiziertere Anfragen bringt und Ihr Büro als Marke sichtbar macht.
          Konzept, Dreh und Schnitt aus einer Hand.
        </p>
        <div className="v2-hero-ctas" data-reveal data-delay="0.5">
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('start')}>
              Paket &amp; Termin anfragen <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('portfolio')}>
              Arbeitsproben ansehen
            </button>
          </Magnetic>
        </div>
        <p className="v2-hero-note" data-reveal data-delay="0.65">
          Für Verkauf &amp; Vermietung · Foto, Video und Drohne · schnelle Lieferung nach Paketumfang
        </p>
      </div>
      <div className="v2-hero-scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}

function Marquee() {
  const items = ['Immobilienfotografie', 'Objektfilme', 'Makler-Filme', 'Drohnenaufnahmen', 'Virtuelles Home Staging', 'Markenbildung'];
  const row = items.map((t) => (
    <span className="v2-marquee-item" key={t}><span className="dot" />{t}</span>
  ));
  return (
    <div className="v2-marquee" aria-hidden="true">
      <div className="v2-marquee-track">
        {row}
        {items.map((t) => (
          <span className="v2-marquee-item" key={`${t}-2`}><span className="dot" />{t}</span>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const stats = [
    { to: 403, prefix: '+', unit: '%', label: 'mehr Anfragen mit Video' },
    { to: 32, prefix: '~', unit: '%', label: 'schnellere Vermittlung mit Profi-Fotos' },
    { to: 73, unit: '%', label: 'der Verkäufer bevorzugen Makler, die Video nutzen' },
    { to: 9, prefix: 'nur ', unit: '%', label: 'der Makler machen objektspezifische Videos' },
  ];
  return (
    <section className="v2-sec tight bg-ink v2-stats">
      <div className="v2-wrap">
        <div className="v2-stats-grid">
          {stats.map((s, i) => (
            <div className="v2-stat" key={s.label} data-reveal data-delay={i * 0.1}>
              <div className="v2-stat-num">
                <CountUp to={s.to} prefix={s.prefix || ''} />
                <span className="unit">{s.unit}</span>
              </div>
              <p className="v2-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="v2-stats-src" data-reveal>
          Quellen: NAR, Redfin/VHT, Branchenstudien (überwiegend international). Die Größenordnung
          ist auf den deutschen Markt übertragbar, in dem Video noch kaum genutzt wird.
        </p>
      </div>
    </section>
  );
}

function InstagramGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-word" aria-hidden="true" data-reveal>QUADRATBLICK</div>
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <img src={logoWhite} alt="Quadratblick" />
            <p>
              Foto- &amp; Videoproduktion für Immobilien · Verkauf &amp; Vermietung ·
              Raum Bühl · Mittelbaden · Ortenau
            </p>
          </div>
          <div className="v2-footer-links">
            <a href="mailto:info@quadratblick.de">info@quadratblick.de</a>
            <a href="tel:+4915904692843">0159 0469 2843</a>
            <a href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <InstagramGlyph /> Instagram
            </a>
          </div>
          <div className="v2-footer-links">
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutz.html">Datenschutz</a>
          </div>
        </div>
        <div className="v2-footer-base">
          <span>© 2026 · Quadratblick</span>
          <span>Bühl · Mittelbaden · Ortenau</span>
        </div>
      </div>
    </footer>
  );
}

export default function AppV2() {
  useSmoothScroll();
  return (
    <>
      <Cursor />
      <div className="v2-grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <StorySections />
        <BizSections />
        <CloseSections />
      </main>
      <Footer />
    </>
  );
}
