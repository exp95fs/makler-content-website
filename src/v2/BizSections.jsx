import { useEffect, useRef } from 'react';
import { Split, Magnetic, scrollToId, gsap, ScrollTrigger, prefersReducedMotion } from './fx.jsx';
import { Arrow } from './AppV2.jsx';

/* ---------- Markenbildung ---------- */
function Branding() {
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
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Markenbildung besprechen <Arrow />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ---------- USP ---------- */
function Usp() {
  const usps = [
    { title: 'Alles aus einer Hand', text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff. alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.' },
    { title: 'Bewusst auf wenige Kunden begrenzt', text: 'Wir arbeiten gezielt mit wenigen Kunden gleichzeitig. So bleiben die Wege kurz und die Lieferung schnell. Jedes Objekt bekommt die volle Aufmerksamkeit.' },
    { title: 'Konsistenter, hochwertiger Look', text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht. Objekt für Objekt wiedererkennbar.' },
    { title: 'Gedacht aus Sicht der Zielgruppe', text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.' },
  ];
  return (
    <section className="v2-sec bg-linen">
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
function Process() {
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
    <section className="v2-sec bg-linen-2" id="prozess" ref={rootRef}>
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

/* ---------- Angebot: Gratis-Pilot ---------- */
function Offer() {
  const list = [
    { b: 'Was Sie bekommen:', t: ' komplette Produktion, konzipiertes Objektvideo (60–90 s) + vertikales Reel + bearbeitete Objektfotos. Für Verkauf oder Vermietung.' },
    { b: 'Was wir dafür möchten:', t: ' Ihr Einverständnis, das Ergebnis als Referenz zeigen zu dürfen.' },
    { b: 'Was nicht dahintersteckt:', t: ' kein Abo, keine versteckten Kosten, keine Verpflichtung.' },
  ];
  return (
    <section className="v2-sec v2-offer bg-ink" id="angebot">
      <div className="v2-offer-bg" aria-hidden="true">
        <img src="/media/aussen-1-web.jpg" alt="" data-parallax="16" loading="lazy" />
      </div>
      <div className="v2-wrap">
        <div className="v2-offer-inner">
          <span className="v2-offer-badge" data-reveal><span className="rec" />Nur 3 Pilotplätze in der Region</span>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Eine ehrliche Sache: Wir suchen 3 Objekte für unser Portfolio.
          </Split>
          <p className="v2-lead" data-reveal>
            Wir sind neu am Markt im Raum Bühl / Mittelbaden und bauen unser Referenz-Portfolio auf.
            Statt Versprechen zu machen, zeigen wir Ihnen lieber das Ergebnis, an einem Ihrer Objekte.
          </p>
          <div className="v2-offer-price" data-reveal>
            <span className="was">1.490 €</span>
            <span className="now">0 €</span>
            <span className="for">für die ersten 3 Pilot-Objekte</span>
          </div>
          <div className="v2-offer-list" data-reveal>
            {list.map((l) => (
              <div className="row" key={l.b}>
                <span className="tick">✓</span>
                <p><strong>{l.b}</strong>{l.t}</p>
              </div>
            ))}
          </div>
          <div className="v2-offer-cta" data-reveal>
            <Magnetic>
              <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
                Pilotplatz sichern <Arrow />
              </button>
            </Magnetic>
          </div>
          <p className="v2-offer-sub" data-reveal>Bewusst begrenzt, damit jedes Objekt die volle Aufmerksamkeit bekommt.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Über ---------- */
function About() {
  return (
    <section className="v2-sec bg-linen">
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
          </div>
        </div>
      </div>
    </section>
  );
}

export function BizSections() {
  return (
    <>
      <Branding />
      <Usp />
      <Process />
      <Offer />
      <About />
    </>
  );
}
