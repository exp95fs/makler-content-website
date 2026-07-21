import { useEffect, useRef } from 'react';
import { Split, Magnetic, scrollToId, gsap, ScrollTrigger, prefersReducedMotion } from './fx.jsx';
import { Arrow } from './ui.jsx';

/* ---------- Markenbildung ---------- */
export function Branding() {
  const pillars = [
    { title: 'Konsistente Bildsprache', text: 'Eine durchgängige Handschrift über alle Objekte hinweg. Ihr Büro wird auf den ersten Blick wiedererkannt.' },
    { title: 'Sie als Gesicht der Region', text: 'Makler-Reels, Porträt- und Experten-Content, der Vertrauen aufbaut, bevor das erste Gespräch beginnt.' },
    { title: 'Strategie statt Einzelclips', text: 'Ein roter Faden für Portale, Social Media und Website. Strategisch geplant, nicht zufällig zusammengestellt.' },
  ];
  return (
    <section className="v2-sec bg-sage" id="marke">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Markenbildung</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Nicht nur das Objekt — Ihr Maklerbüro als Marke.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Einzelne Objekte zu vermarkten ist der Anfang. Der eigentliche Hebel liegt darin, Sie und
            Ihr Büro als feste Größe in der Region sichtbar zu machen, ob etabliertes Maklerbüro oder
            eigenständiger Makler.
          </p>
        </div>
        <div className="v2-brand-grid">
          {pillars.map((p, i) => (
            <div className="v2-brand-cell" key={p.title} data-reveal data-delay={i * 0.12}>
              <span className="num">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <div className="v2-brand-foot" data-reveal>
          <p>Wir starten beim einzelnen Objekt und bauen daraus Schritt für Schritt Ihre Marke.</p>
          <Magnetic>
            <a className="v2-btn" href="/marke-und-social/">
              Marke &amp; Social entdecken <Arrow />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ---------- USP ---------- */
export function Usp() {
  const usps = [
    { title: 'Alles aus einer Hand', text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff. alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.' },
    { title: 'Bewusst auf wenige Kunden begrenzt', text: 'Wir arbeiten gezielt mit wenigen Kunden gleichzeitig. So bleiben die Wege kurz und die Lieferung schnell. Jedes Objekt bekommt die volle Aufmerksamkeit.' },
    { title: 'Konsistenter, hochwertiger Look', text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht. Objekt für Objekt wiedererkennbar.' },
    { title: 'Gedacht aus Sicht der Zielgruppe', text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.' },
  ];
  return (
    <section className="v2-sec bg-linen-2">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Was uns von anderen Anbietern unterscheidet</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Alles aus einer Hand. Gedacht aus Sicht Ihrer Zielgruppe.
          </Split>
        </div>
        <div className="v2-usps">
          {usps.map((u, i) => (
            <article className="v2-usp" key={u.title} data-reveal data-delay={(i % 2) * 0.12}>
              <span className="big-num">0{i + 1}</span>
              <h3>{u.title}</h3>
              <p>{u.text}</p>
            </article>
          ))}
        </div>
        <div className="v2-chance" data-reveal>
          <span className="label">Die Chance</span>
          <p>
            Nur rund 9 % der Makler produzieren objektspezifische Videos - in unserer Region noch weniger.
            Wer jetzt in gutes Bewegtbild investiert, hebt sich sichtbar vom Markt ab.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Prozess mit Scroll-Fortschrittslinie ---------- */
export function Process() {
  const rootRef = useRef(null);
  const steps = [
    { title: 'Kurzes Briefing', text: '10 Minuten am Telefon: Objekt, Ziel (Verkauf/Vermietung), Termin.' },
    { title: 'Ein Termin vor Ort', text: 'Fotos und Video in einem Durchgang. Sie müssen nicht dabei sein.' },
    { title: 'Konzipierter Schnitt', text: 'Geschnitten nach Konzept, nicht nach Schema.' },
    { title: 'Schnelle Lieferung', text: 'Sie erhalten Ihre finalen Fotos, Videos und Reels einsatzbereit für Portale, Exposé und Social Media.' },
  ];

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      gsap.to('.v2-proc-line .fill', {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: '.v2-proc-steps', start: 'top 72%', end: 'bottom 55%', scrub: 0.4,
        },
      });
      gsap.utils.toArray('.v2-proc-step').forEach((el) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 68%',
          onEnter: () => el.classList.add('is-active'),
          onLeaveBack: () => el.classList.remove('is-active'),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="v2-sec bg-linen" id="prozess" ref={rootRef}>
      <div className="v2-wrap">
        <div className="v2-proc">
          <div className="v2-proc-left">
            <p className="v2-eyebrow" data-reveal>So läuft's ab</p>
            <Split as="h2" className="v2-h-display v2-h-lg" style={{ marginTop: 22 }}>
              In vier Schritten zum fertigen Objekt-Content.
            </Split>
          </div>
          <div className="v2-proc-steps">
            <div className="v2-proc-line"><div className="fill" /></div>
            {steps.map((s, i) => (
              <div className="v2-proc-step" key={s.title} data-reveal>
                <span className="num">Schritt 0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Referenzprojekt / Arbeitsproben ---------- */
export function Showcase({ compact = false }) {
  return (
    <section className="v2-sec bg-ink v2-show" id="portfolio">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Arbeitsproben · Referenzprojekt 01</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Die ersten Referenzobjekte entstehen gerade.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wir bauen unser regionales Portfolio auf. Erste Projekte sind bereits abgeschlossen —
            wie dieses Mehrgenerationenhaus in Mittelbaden, außen wie innen. Weitere entstehen
            laufend, diese Seite wächst mit jedem neuen Objekt.
          </p>
        </div>

        <div className="v2-show-grid">
          <figure className="v2-show-item v2-show-a" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/ref-aussen-1.jpg" alt="Mehrgenerationenhaus — Außenaufnahme mit Carport und Zufahrt" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Außen · Zufahrt &amp; Architektur</span><span>01</span></figcaption>
          </figure>

          <figure className="v2-show-item v2-show-air" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Drohne">
            <div className="frame" data-clip-reveal>
              <img src="/media/ref-luft.jpg" alt="Drohnenaufnahme — das Referenzobjekt und seine Lage aus der Luft" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Drohne · Objekt &amp; Lage</span><span>02</span></figcaption>
          </figure>

          {!compact && (
          <figure className="v2-show-item v2-show-b" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/ref-innen-1.jpg" alt="Wohnung im Referenzobjekt — lichtdurchfluteter Wohnraum mit Parkett" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Innen · Wohnraum &amp; Licht</span><span>03</span></figcaption>
          </figure>
          )}

          {!compact && (
          <figure className="v2-show-item v2-show-c" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/ref-aussen-2.jpg" alt="Referenzobjekt — Balkonperspektive mit Blick über die Felder" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Außen · Lage &amp; Ausblick</span><span>04</span></figcaption>
          </figure>
          )}
        </div>

        <div className="v2-show-foot" data-reveal>
          {compact ? (
            <a className="v2-link-inline" href="/referenzen/">
              Alle Referenzen ansehen
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </a>
          ) : (
          <a className="v2-link-inline" href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer">
            Mehr Arbeitsproben auf Instagram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
          </a>
          )}
          <span className="v2-idx" style={{ color: 'rgba(243,238,229,0.4)' }}>Mehrgenerationenhaus · Mittelbaden · 2026</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Über ---------- */
export function About({ teaser = false }) {
  return (
    <section className="v2-sec bg-linen-2">
      <div className="v2-wrap">
        <div className="v2-about">
          <div className="v2-about-visual" data-reveal>
            <div className="frame">
              <span className="mono" aria-hidden="true">Q</span>
              <span className="cap">Fabian · Gründer &amp; Produktion</span>
            </div>
          </div>
          <div className="v2-about-body">
            <p className="v2-eyebrow" data-reveal>Wer das macht</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Fabian — Foto, Video und strategischer Blick für Immobilienmarken.
            </Split>
            <p data-reveal>
              Ich komme aus der professionellen Foto- und Videoproduktion und habe über viele Jahre
              visuelle Projekte für namhafte Unternehmen umgesetzt. Dabei ging es nie nur um schöne Bilder,
              sondern immer um die Frage: Welche Botschaft soll ankommen und wie muss sie aussehen, damit
              sie bei der richtigen Zielgruppe wirkt?
            </p>
            <p data-reveal>
              Genau diesen Anspruch übertrage ich auf Immobilien. Ich produziere Fotos, Videos und
              Markencontent, die Objekte hochwertig zeigen, Maklerbüros professionell positionieren und aus
              einem einzelnen Auftrag ein stimmiges Gesamtbild machen.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl · unterwegs in Mittelbaden &amp; der Ortenau</p>
            {teaser && (
              <div style={{ marginTop: 28 }} data-reveal>
                <Magnetic>
                  <a className="v2-btn ghost" href="/ueber-uns/">
                    Mehr über den Hintergrund <Arrow />
                  </a>
                </Magnetic>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

