import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll, Cursor, Magnetic } from './fx.jsx';
import { Arrow } from './ui.jsx';
import { useKlickTracking } from './tracking.js';
import { SEITEN, NAVIGATION } from './seiten.js';
import logoWhite from '../assets/logo/quadratblick-logo-weiss-400.png';
import logoBlack from '../assets/logo/quadratblick-logo-schwarz-400.png';
import { kontakt, preishinweis } from '../content/site.js';

const ANFRAGE = SEITEN.anfrage.pfad;

/* ---------- Navigation ---------- */
/**
 * Echte Links auf eigene Seiten, keine JavaScript-Sprünge. Das Mobilmenü
 * ist ein modaler Bereich: beim Öffnen liegt der Fokus auf dem ersten Link,
 * Tab bleibt im Menü, Escape schließt und gibt den Fokus an den Menübutton
 * zurück. Geschlossen ist das Menü `inert` und damit nicht fokussierbar.
 */
function Nav({ aktiv }) {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const burger = useRef(null);
  const menu = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 60);
      setHidden(y > 500 && y > lastY.current && !open);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    document.documentElement.style.overflow = 'hidden';
    const erster = menu.current?.querySelector('a, button');
    erster?.focus();
    const taste = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        burger.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const ziele = [burger.current, ...menu.current.querySelectorAll('a, button')].filter(Boolean);
      const idx = ziele.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); ziele[ziele.length - 1].focus(); }
      else if (!e.shiftKey && idx === ziele.length - 1) { e.preventDefault(); ziele[0].focus(); }
    };
    document.addEventListener('keydown', taste);
    return () => {
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', taste);
    };
  }, [open]);

  const logo = solid && !open ? logoBlack : logoWhite;

  return (
    <>
      <header className={`v2-nav ${solid ? 'is-solid' : ''} ${hidden ? 'is-hidden' : ''} ${open ? 'menu-open' : ''}`}>
        <div className="v2-nav-inner">
          <a href="/" className="v2-nav-logo" aria-label="Quadratblick, zur Startseite">
            <img src={logo} alt="" width="400" height="94" />
          </a>
          <nav className="v2-nav-links" aria-label="Hauptnavigation">
            {NAVIGATION.map((key) => (
              <a key={key} href={SEITEN[key].pfad}
                 className={`v2-nav-link ${aktiv === key ? 'is-active' : ''}`}
                 aria-current={aktiv === key ? 'page' : undefined}>
                {SEITEN[key].name}
              </a>
            ))}
          </nav>
          <div className="v2-nav-aktionen">
            <Magnetic strength={0.25}>
              <a className="v2-btn sm v2-nav-cta" href={ANFRAGE} data-event="cta_primary">
                Verfügbarkeit prüfen <Arrow size={15} />
              </a>
            </Magnetic>
            <button
              ref={burger}
              type="button"
              className={`v2-burger ${open ? 'is-open' : ''}`}
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              aria-controls="mobilmenue"
              onClick={() => setOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="mobilmenue" ref={menu} className={`v2-menu ${open ? 'is-open' : ''}`}
           role="dialog" aria-modal="true" aria-label="Menü"
           {...(open ? {} : { inert: '', 'aria-hidden': 'true' })}>
        <nav className="v2-menu-links" aria-label="Mobile Navigation">
          {NAVIGATION.map((key) => (
            <a key={key} href={SEITEN[key].pfad}
               className={aktiv === key ? 'is-active' : ''}
               aria-current={aktiv === key ? 'page' : undefined}
               onClick={() => setOpen(false)}>
              {SEITEN[key].name}
            </a>
          ))}
        </nav>
        <div className="v2-menu-foot">
          <a className="v2-btn" href={ANFRAGE} data-event="cta_primary" onClick={() => setOpen(false)}>
            Verfügbarkeit prüfen <Arrow />
          </a>
          <p>
            <a href={kontakt.telefonHref}>{kontakt.telefon}</a>
            {' · '}
            <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
          </p>
        </div>
      </div>
    </>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <img src={logoWhite} alt="Quadratblick" width="400" height="94" loading="lazy" />
            <p>Immobilienfotografie für Makler in Bühl, Baden-Baden, Achern und Mittelbaden.</p>
          </div>
          <nav className="v2-footer-links" aria-label="Seiten">
            {NAVIGATION.map((key) => <a key={key} href={SEITEN[key].pfad}>{SEITEN[key].name}</a>)}
            <a href={ANFRAGE}>Verfügbarkeit prüfen</a>
          </nav>
          <nav className="v2-footer-links" aria-label="Service und Rechtliches">
            <a href="/#faq">FAQ</a>
            <a href={`${ANFRAGE}#kontakt`}>Kontakt</a>
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutz.html">Datenschutz</a>
          </nav>
          <div className="v2-footer-links">
            <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
            <a href={kontakt.telefonHref}>{kontakt.telefon}</a>
            <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <p className="v2-footer-preis">{preishinweis}</p>
        <div className="v2-footer-base">
          <span>© {new Date().getFullYear()} Quadratblick · Fabian Schneebiegl</span>
          <span>Bühl · Mittelbaden</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Seiten-Hülle ---------- */
/**
 * Gemeinsame Hülle aller Seiten: Skiplink, Cursor, Grain, Navigation,
 * Footer, Smooth Scrolling und Klick-Tracking.
 * `seite`: Schlüssel aus seiten.js, markiert den aktiven Navigationspunkt.
 */
export function PageShell({ seite, children }) {
  useSmoothScroll();
  useKlickTracking();

  return (
    <>
      <a className="v2-skip" href="#inhalt">Zum Inhalt springen</a>
      <Cursor />
      <div className="v2-grain" aria-hidden="true" />
      <Nav aktiv={seite} />
      <main id="inhalt" tabIndex={-1}>{children}</main>
      <Footer />
    </>
  );
}
