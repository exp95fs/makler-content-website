import { useEffect, useRef, useState } from 'react';
import { useSmoothScroll, springeZu, scrollToId, Cursor, Magnetic } from './fx.jsx';
import { Arrow } from './ui.jsx';
import { useKlickTracking } from './tracking.js';
import { SEITEN } from './seiten.js';
import logoWhite from '../assets/logo/quadratblick-logo-weiss-400.png';
import logoBlack from '../assets/logo/quadratblick-logo-schwarz-400.png';
import { kontakt, preishinweisVoll } from '../content/site.js';

const ANFRAGE = SEITEN.anfrage.pfad;
const REGION = 'Bühl · Baden-Baden · Achern';

/**
 * Navigation des Onepagers, wie im bisherigen Onepager: alle Ziele sind
 * Sektionen der Startseite. Auf der Startseite sind es Anker (#preise),
 * auf den Unterseiten Links auf die Startseite mit Anker (/#preise).
 */
export const ANKER = [
  { id: 'leistungen', label: 'Leistungen' },
  { id: 'referenzen', label: 'Referenzen' },
  { id: 'warum', label: 'Warum wir' },
  { id: 'preise', label: 'Preise & Buchung' },
  { id: 'faq', label: 'FAQ' },
];

/**
 * Vertiefende Unterseiten, dezent im Footer verlinkt. Eigene Linktexte,
 * damit sie sich von den gleichnamigen Ankern unterscheiden.
 */
const UNTERSEITEN = [
  ['immobilienfotografie', 'Immobilienfotografie'],
  ['referenzen', 'Alle Referenzen'],
  ['preise', 'Preisübersicht'],
  ['ueber', 'Über Quadratblick'],
  ['anfrage', 'Projekt anfragen'],
];

const ankerHref = (start, id) => (start ? `#${id}` : `/#${id}`);

/* ---------- Navigation ---------- */
/**
 * Das Mobilmenü ist ein modaler Bereich: beim Öffnen liegt der Fokus auf
 * dem ersten Link, Tab bleibt im Menü, Escape schließt und gibt den Fokus
 * an den Menübutton zurück. Geschlossen ist das Menü `inert` und damit
 * nicht fokussierbar.
 */
function Nav({ start }) {
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
  const cta = start ? '#preise' : ANFRAGE;

  return (
    <>
      <header className={`v2-nav ${solid ? 'is-solid' : ''} ${hidden ? 'is-hidden' : ''} ${open ? 'menu-open' : ''}`}>
        <div className="v2-nav-inner">
          <a href={start ? '#top' : '/'} className="v2-nav-logo"
             aria-label={start ? 'Quadratblick, zum Seitenanfang' : 'Quadratblick, zur Startseite'}>
            <img src={logo} alt="" width="400" height="94" />
          </a>
          <nav className="v2-nav-links" aria-label="Hauptnavigation">
            {ANKER.map((p) => (
              <a key={p.id} href={ankerHref(start, p.id)} className="v2-nav-link">{p.label}</a>
            ))}
          </nav>
          <div className="v2-nav-aktionen">
            <Magnetic strength={0.25}>
              <a className="v2-btn sm v2-nav-cta" href={cta} data-event="cta_primary">
                Termin anfragen <Arrow size={15} />
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
        <nav className="v2-menu-links" aria-label="Mobiles Menü">
          {ANKER.map((p) => (
            <a key={p.id} href={ankerHref(start, p.id)} onClick={() => setOpen(false)}>{p.label}</a>
          ))}
        </nav>
        <div className="v2-menu-foot">
          <a className="v2-btn" href={cta} data-event="cta_primary" onClick={() => setOpen(false)}>
            Termin anfragen <Arrow />
          </a>
          <p>{REGION}</p>
        </div>
      </div>
    </>
  );
}

/* ---------- Footer ---------- */
function Footer({ start }) {
  return (
    <footer className="v2-footer">
      <div className="v2-wrap">
        <div className="v2-footer-grid">
          <div className="v2-footer-brand">
            <img src={logoWhite} alt="Quadratblick" width="400" height="94" loading="lazy" />
            <p>
              Immobilienfotografie für Maklerbüros · Verkauf &amp; Vermietung ·
              Raum Bühl · Baden-Baden · Achern
            </p>
          </div>
          <nav className="v2-footer-links" aria-label="Sektionen der Startseite">
            {ANKER.map((p) => <a key={p.id} href={ankerHref(start, p.id)}>{p.label}</a>)}
          </nav>
          <nav className="v2-footer-links" aria-label="Mehr erfahren">
            {UNTERSEITEN.map(([key, text]) => <a key={key} href={SEITEN[key].pfad}>{text}</a>)}
          </nav>
          <div className="v2-footer-links">
            <a href={`mailto:${kontakt.email}`}>{kontakt.email}</a>
            <a href={kontakt.telefonHref}>{kontakt.telefon}</a>
            <a href={kontakt.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
          <nav className="v2-footer-links" aria-label="Rechtliches">
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutz.html">Datenschutz</a>
          </nav>
        </div>
        <p className="v2-footer-preis">{preishinweisVoll}</p>
        <div className="v2-footer-base">
          <span>© {new Date().getFullYear()} · Quadratblick</span>
          <span>{REGION}</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Seiten-Hülle ---------- */
/**
 * Gemeinsame Hülle aller Seiten: Skiplink, Cursor, Grain, Navigation,
 * Footer, Smooth Scrolling und Klick-Tracking.
 *
 * Auf der Startseite werden Ankerlinks (#preise, auch /#preise) weich
 * angescrollt; der Fokus springt in die Zielsektion. Kommt man mit Anker
 * von einer Unterseite, wird nach dem Laden noch einmal sauber positioniert.
 * Ohne JavaScript und bei reduzierter Bewegung springt der Browser selbst,
 * `scroll-margin-top` hält das Ziel unter der Navigation frei.
 */
export function PageShell({ seite, children }) {
  const start = seite === 'start';
  useSmoothScroll();
  useKlickTracking();

  useEffect(() => {
    if (!start) return undefined;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest('a[href^="#"], a[href^="/#"]');
      if (!a || a.classList.contains('v2-skip')) return;
      const id = a.getAttribute('href').split('#')[1];
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      // Ist das Mobilmenü offen, erst schließen lassen: solange es offen
      // ist, steht das Dokument auf overflow: hidden.
      const menuOffen = !!document.querySelector('.v2-menu.is-open');
      setTimeout(() => springeZu(id), menuOffen ? 60 : 0);
    };
    document.addEventListener('click', onClick);

    const hash = window.location.hash.slice(1);
    const t = hash && document.getElementById(hash) ? setTimeout(() => scrollToId(hash), 350) : null;
    return () => { document.removeEventListener('click', onClick); if (t) clearTimeout(t); };
  }, [start]);

  return (
    <>
      <a className="v2-skip" href="#inhalt">Zum Inhalt springen</a>
      <Cursor />
      <div className="v2-grain" aria-hidden="true" />
      <Nav start={start} />
      <main id="inhalt" tabIndex={-1}>{children}</main>
      <Footer start={start} />
    </>
  );
}
