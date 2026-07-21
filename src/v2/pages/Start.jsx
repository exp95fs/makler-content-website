import { useEffect } from 'react';
import { Split, Magnetic, scrollToId, CountUp, gsap, prefersReducedMotion } from '../fx.jsx';
import { PageShell } from '../Shell.jsx';
import { Arrow } from '../ui.jsx';
import { Benefits } from '../StorySections.jsx';
import { Branding, Showcase, About } from '../BizSections.jsx';
import { Contact } from '../CloseSections.jsx';

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
          im Raum Bühl, Baden-Baden und Ortenau. Vom einzelnen Objekt bis zur regelmäßig
          sichtbaren Maklermarke — Konzept, Dreh und Schnitt aus einer Hand.
        </p>
        <div className="v2-hero-ctas" data-reveal data-delay="0.5">
          <Magnetic>
            <a className="v2-btn" href="/objektcontent/">
              Objektcontent ansehen <Arrow />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href="/marke-und-social/">
              Marke &amp; Social entdecken
            </a>
          </Magnetic>
        </div>
        <p className="v2-hero-note" data-reveal data-delay="0.65">
          Für Verkauf &amp; Vermietung · Foto, Video und Drohne · Objektauftrag oder Content-Partnerschaft
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
  const items = ['Immobilienfotografie', 'Objektfilme', 'Makler-Filme', 'Drohnenaufnahmen', 'Content-Partnerschaften', 'Markenbildung'];
  return (
    <div className="v2-marquee" aria-hidden="true">
      <div className="v2-marquee-track">
        {items.map((t) => (
          <span className="v2-marquee-item" key={t}><span className="dot" />{t}</span>
        ))}
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

/* Zwei Wege: der zentrale Verteiler der Startseite */
function Wege() {
  return (
    <section className="v2-sec bg-linen" id="wege">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Was brauchen Sie gerade?</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Zwei Wege zu besserem Immobilien-Content.
          </Split>
          <p className="v2-lead" data-reveal>
            Ein einzelnes Objekt professionell vermarkten — oder Ihre Maklermarke regelmäßig
            sichtbar machen. Beides aus einer Hand, klar getrennt und klar kalkuliert.
          </p>
        </div>
        <div className="v2-fork-grid">
          <div className="v2-fork-card" data-reveal>
            <span className="v2-fork-badge">Einzelauftrag · pro Objekt</span>
            <h3>Objektcontent</h3>
            <p>
              Fotos, Objektfilme, Drohnenaufnahmen und vertikale Reels für Ihr Inserat —
              gebucht pro Objekt, geliefert einsatzbereit für Exposé, Portale und Social Media.
              Pakete ab 390 € netto, Wunschtermin direkt online anfragbar.
            </p>
            <Magnetic>
              <a className="v2-btn ghost" href="/objektcontent/">
                Objektcontent ansehen <Arrow />
              </a>
            </Magnetic>
            <span className="v2-fork-meta"><span className="dot" />Für Verkauf, Vermietung &amp; Ferienobjekte</span>
          </div>
          <div className="v2-fork-card dark" data-reveal data-delay="0.12">
            <span className="v2-fork-badge">Content-Partnerschaft · monatlich</span>
            <h3>Marke &amp; Social</h3>
            <p>
              Strategie, Foto, Video und Veröffentlichung für Ihre Maklermarke — gebündelt an
              wenigen Produktionsterminen, aufbereitet für mehrere Wochen regelmäßiger Präsenz.
              Drei Pakete vom einmaligen Content Day bis zur ausgelagerten Content-Redaktion.
            </p>
            <Magnetic>
              <a className="v2-btn" href="/marke-und-social/">
                Marke &amp; Social entdecken <Arrow />
              </a>
            </Magnetic>
            <span className="v2-fork-meta"><span className="dot" />Für Makler, Maklerbüros &amp; Immobilienunternehmen</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StartPage() {
  return (
    <PageShell active="start" dark>
      <Hero />
      <Marquee />
      <Stats />
      <Wege />
      <Benefits />
      <Showcase compact />
      <Branding />
      <About teaser />
      <Contact />
    </PageShell>
  );
}
