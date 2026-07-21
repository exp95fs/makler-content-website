import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll, scrollToId, Split, Cursor, Magnetic } from './fx.jsx';
import { Arrow } from './ui.jsx';
import logoWhite from '../assets/logo/quadratblick-logo-weiss.png';
import logoBlack from '../assets/logo/quadratblick-logo-schwarz.png';

export const PAGES = [
  { path: '/objektcontent/', key: 'objektcontent', label: 'Objektcontent' },
  { path: '/marke-und-social/', key: 'marke', label: 'Marke & Social' },
  { path: '/referenzen/', key: 'referenzen', label: 'Referenzen' },
  { path: '/ueber-uns/', key: 'ueber', label: 'Über uns' },
];

/* ---------- Navigation (seitenübergreifend) ---------- */
function Nav({ active, dark }) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 60);
      setHidden(y > 500 && y > lastY.current && !open);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  const onLight = solid || !dark;

  return (
    <>
      <header className={`v2-nav ${solid ? 'is-solid' : ''} ${hidden ? 'is-hidden' : ''} ${!dark ? 'on-light' : ''} ${open ? 'menu-open' : ''}`}>
        <div className="v2-nav-inner">
          <a href="/" className="v2-nav-logo" aria-label="Quadratblick — zur Startseite">
            <img src={onLight && !open ? logoBlack : logoWhite} alt="Quadratblick" />
          </a>
          <nav className="v2-nav-links" aria-label="Hauptnavigation">
            {PAGES.map((p) => (
              <a key={p.key} href={p.path} className={`v2-nav-link ${active === p.key ? 'is-active' : ''}`} aria-current={active === p.key ? 'page' : undefined}>
                {p.label}
              </a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Magnetic strength={0.25}>
              <button type="button" className="v2-btn sm v2-nav-cta" onClick={() => { setOpen(false); scrollToId('anfrage'); }}>
                Kontakt <Arrow size={15} />
              </button>
            </Magnetic>
            <button
              type="button"
              className={`v2-burger ${open ? 'is-open' : ''}`}
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`v2-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav className="v2-menu-links" aria-label="Mobiles Menü">
          <a href="/" className={active === 'start' ? 'is-active' : ''}>Startseite</a>
          {PAGES.map((p) => (
            <a key={p.key} href={p.path} className={active === p.key ? 'is-active' : ''}>{p.label}</a>
          ))}
        </nav>
        <div className="v2-menu-foot">
          <button type="button" className="v2-btn" onClick={() => { setOpen(false); setTimeout(() => scrollToId('anfrage'), 50); }}>
            Kontakt aufnehmen <Arrow />
          </button>
          <p>Bühl · Mittelbaden · Ortenau</p>
        </div>
      </div>
    </>
  );
}

/* ---------- Footer (seitenübergreifend) ---------- */
function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-word" aria-hidden="true" data-reveal>QUADRATBLICK</div>
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <img src={logoWhite} alt="Quadratblick" />
            <p>
              Foto- &amp; Videoproduktion für Immobilien · Objektcontent &amp; Markenaufbau ·
              Raum Bühl · Mittelbaden · Ortenau
            </p>
          </div>
          <div className="v2-footer-links">
            <a href="/">Startseite</a>
            {PAGES.map((p) => (
              <a key={p.key} href={p.path}>{p.label}</a>
            ))}
          </div>
          <div className="v2-footer-links">
            <a href="mailto:info@quadratblick.de">info@quadratblick.de</a>
            <a href="tel:+4915904692843">0159 0469 2843</a>
            <a href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer">Instagram</a>
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

/* ---------- Seiten-Hülle ---------- */
/**
 * PageShell — gemeinsame Hülle aller Seiten: Cursor, Grain, Nav, Footer,
 * Smooth Scrolling und Hash-Scroll nach Seitenwechsel.
 * `dark`: true, wenn die Seite mit einer dunklen Hero-Fläche beginnt
 * (steuert die Logo-/Linkfarbe der transparenten Nav).
 */
export function PageShell({ active, dark = true, children }) {
  useSmoothScroll();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const hash = window.location.hash;
    if (hash) {
      const t = setTimeout(() => scrollToId(hash.slice(1)), 350);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  return (
    <>
      <Cursor />
      <div className="v2-grain" aria-hidden="true" />
      <Nav active={active} dark={dark} />
      <main>{children}</main>
      <Footer />
    </>
  );
}

/* ---------- Unterseiten-Hero ---------- */
export function SubHero({ eyebrow, title, lead, image, imageAlt = '', ctas = null, trust = null }) {
  return (
    <section className={`v2-hero sub ${image ? '' : 'no-img'}`} id="top">
      {image && (
        <div className="v2-hero-media">
          <img src={image} alt={imageAlt} data-parallax="12" fetchpriority="high" />
        </div>
      )}
      <div className="v2-hero-scrim" />
      <div className="v2-hero-content">
        <p className="v2-eyebrow on-dark" data-reveal>{eyebrow}</p>
        <Split as="h1" className="v2-h-display v2-h-sub v2-hero-h" style={{ marginTop: 18 }}>
          {title}
        </Split>
        {lead && (
          <p className="v2-lead v2-hero-lead" data-reveal data-delay="0.3">{lead}</p>
        )}
        {ctas && <div className="v2-hero-ctas" data-reveal data-delay="0.45">{ctas}</div>}
        {trust && <p className="v2-hero-note" data-reveal data-delay="0.6">{trust}</p>}
      </div>
    </section>
  );
}

/* ---------- Querverweis-Kachel auf die jeweils andere Leistungs-Seite ---------- */
export function CrossLink({ eyebrow, title, text, href, cta }) {
  return (
    <section className="v2-sec tight bg-linen-2">
      <div className="v2-wrap">
        <div className="v2-crosslink" data-reveal>
          <div>
            <p className="v2-eyebrow">{eyebrow}</p>
            <h3>{title}</h3>
            <p className="txt">{text}</p>
          </div>
          <Magnetic>
            <a className="v2-btn" href={href}>{cta} <Arrow /></a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
