import { Split, Magnetic } from '../fx.jsx';
import { PageShell, SubHero } from '../Shell.jsx';
import { Arrow, InstagramGlyph } from '../ui.jsx';
import { Contact } from '../CloseSections.jsx';

/* Referenzprojekt 01 — vollständige Galerie */
function Projekt01() {
  const shots = [
    { src: '/media/ref-aussen-1.jpg', cap: 'Außen · Zufahrt & Architektur', alt: 'Mehrgenerationenhaus — Außenaufnahme mit Carport und Zufahrt', cls: 'v2-show-a' },
    { src: '/media/ref-luft.jpg', cap: 'Drohne · Objekt & Lage', alt: 'Drohnenaufnahme — das Referenzobjekt und seine Lage aus der Luft', cls: 'v2-show-air' },
    { src: '/media/ref-innen-1.jpg', cap: 'Innen · Wohnraum & Licht', alt: 'Wohnung im Referenzobjekt — lichtdurchfluteter Wohnraum mit Parkett', cls: 'v2-show-b' },
    { src: '/media/ref-aussen-2.jpg', cap: 'Außen · Lage & Ausblick', alt: 'Referenzobjekt — Balkonperspektive mit Blick über die Felder', cls: 'v2-show-c' },
    { src: '/media/ref-innen-2.jpg', cap: 'Innen · Wohnküche', alt: 'Offene Wohnküche mit warmem Boden im Referenzobjekt', cls: 'v2-show-a' },
    { src: '/media/ref-detail.jpg', cap: 'Detail · Eingangsbereich', alt: 'Architektur-Detail — Eingangsbereich mit Briefkastenanlage', cls: 'v2-show-air' },
    { src: '/media/ref-innen-3.jpg', cap: 'Innen · Raumgefühl', alt: 'Großzügiger Wohnraum mit bodentiefen Fenstern', cls: 'v2-show-b' },
  ];
  return (
    <section className="v2-sec bg-ink v2-show" id="projekt-01">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Referenzprojekt 01 · Mehrgenerationenhaus · Mittelbaden</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Ein Objekt. Außen, innen und aus der Luft.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Vollständige Objektdokumentation eines Mehrgenerationenhauses in Mittelbaden:
            Architektur und Zufahrt, Wohnräume mit Licht und Raumgefühl, Lage und Umgebung
            per Drohne — produziert an einem gebündelten Termin.
          </p>
        </div>
        <div className="v2-show-grid">
          {shots.map((s, i) => (
            <figure className={`v2-show-item ${s.cls}`} style={{ margin: 0 }} key={s.src} data-cursor="view" data-cursor-label="Referenz">
              <div className="frame" data-clip-reveal>
                <img src={s.src} alt={s.alt} loading={i < 2 ? 'eager' : 'lazy'} />
              </div>
              <figcaption className="v2-show-cap"><span>{s.cap}</span><span>0{i + 1}</span></figcaption>
            </figure>
          ))}
        </div>
        <div className="v2-show-foot" data-reveal>
          <a className="v2-link-inline" href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer">
            <InstagramGlyph size={15} />&nbsp;Mehr Arbeitsproben auf Instagram
          </a>
          <span className="v2-idx" style={{ color: 'rgba(243,238,229,0.4)' }}>Mehrgenerationenhaus · Mittelbaden · 2026</span>
        </div>
      </div>
    </section>
  );
}

/* Kommende Projekte — klar gekennzeichnete Platzhalter */
function Kommend() {
  const slots = [
    'Weiteres Referenzprojekt · in Produktion',
    'Weiteres Referenzprojekt · in Planung',
  ];
  return (
    <section className="v2-sec bg-linen" id="kommend">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Diese Seite wächst</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Weitere Projekte entstehen laufend.
          </Split>
          <p className="v2-lead" data-reveal>
            Wir bauen unser regionales Portfolio Projekt für Projekt auf. Wenn Sie ein passendes
            Objekt haben — zum Verkauf oder zur Vermietung — kann Ihres eines der nächsten sein.
          </p>
        </div>
        <div className="v2-slots-grid" data-reveal>
          {slots.map((s) => (
            <div className="v2-slot-tile" key={s}>
              <span className="mono-q" aria-hidden="true">Q</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="v2-hero-ctas" style={{ marginTop: 40 }} data-reveal>
          <Magnetic>
            <a className="v2-btn" href="/objektcontent/">
              Objektproduktion anfragen <Arrow />
            </a>
          </Magnetic>
          <Magnetic>
            <a className="v2-btn ghost" href="/marke-und-social/">
              Marke &amp; Social entdecken
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

export default function ReferenzenPage() {
  return (
    <PageShell active="referenzen" dark>
      <SubHero
        eyebrow="Referenzen · Arbeitsproben"
        title="Unsere Arbeit, an echten Objekten gezeigt."
        lead="Keine Symbolbilder, keine Stockfotos: Alles auf dieser Seite ist in echten Projekten in der Region entstanden — und zeigt, wie Ihre Objekte aussehen könnten."
        image="/media/ref-luft.jpg"
        imageAlt="Drohnenaufnahme des ersten Referenzprojekts mit Umgebung"
      />
      <Projekt01 />
      <Kommend />
      <Contact />
    </PageShell>
  );
}
