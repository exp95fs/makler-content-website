import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { PageShell, SubHero } from '../Shell.jsx';
import { Arrow } from '../ui.jsx';
import { Contact } from '../CloseSections.jsx';

/* Positionierung: zwei Welten */
function Story() {
  return (
    <section className="v2-sec bg-linen" id="story">
      <div className="v2-wrap">
        <div className="v2-about">
          <div className="v2-about-visual" data-reveal>
            <div className="frame">
              <span className="mono" aria-hidden="true">Q</span>
              <span className="cap">Fabian · Gründer &amp; Produktion — [Platzhalter: Porträtfoto folgt]</span>
            </div>
          </div>
          <div className="v2-about-body">
            <p className="v2-eyebrow" data-reveal>Wer hinter Quadratblick steht</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Zwei Welten, die bei Content-Projekten selten zusammenkommen.
            </Split>
            <p data-reveal>
              Mein Hintergrund verbindet zwei Welten, die bei Content-Projekten häufig getrennt
              betrachtet werden: strategische Unternehmensentwicklung und professionelle visuelle
              Produktion. Ich komme nicht aus der klassischen Immobilienfotografie — sondern aus
              der Frage, wie Unternehmen wachsen, Prozesse funktionieren und Kommunikation auf
              Geschäftsziele einzahlt.
            </p>
            <p data-reveal>
              Deshalb beginnt jedes Projekt bei Quadratblick nicht mit der Kamera, sondern mit
              Positionierung, Zielgruppen und Themen. Erst dann wird produziert — mit dem Anspruch
              an Bild, Ton und Schnitt, den hochwertige Immobilien und professionelle
              Unternehmen verdienen.
            </p>
            <p className="loc" data-reveal>Ansässig in Bühl · unterwegs in Mittelbaden &amp; der Ortenau</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Stationen / Hintergrund — ohne erfundene Details */
function Stationen() {
  const rows = [
    { t: 'Bachelor Betriebswirtschaftslehre', d: 'Betriebswirtschaftliches Fundament: Strategie, Organisation, Zahlen.' },
    { t: 'Master Business Consulting & Digital Management', d: 'Schwerpunkt auf Beratung, digitalen Geschäftsmodellen und Transformation.' },
    { t: 'Mehrjährige Erfahrung in Unternehmensentwicklung, Projektmanagement und E-Commerce', d: 'Projekte an der Schnittstelle von Strategie, Prozessen und digitalem Vertrieb — inklusive Führungsverantwortung.' },
    { t: 'Selbstständige Foto- und Videoproduktion für Marken und Produkte', d: 'Professionelle visuelle Produktion: Konzept, Dreh, Schnitt, Grafik — für Unternehmen, die Wert auf Qualität legen.' },
    { t: 'Schwerpunkte: KI, Digitalisierung, Grafikdesign, Prozessentwicklung', d: 'Moderne Werkzeuge und effiziente Abläufe, damit hochwertiger Content planbar und wirtschaftlich entsteht.' },
  ];
  return (
    <section className="v2-sec bg-linen-2" id="hintergrund">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Hintergrund</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Strategie im Kopf. Kamera in der Hand.
          </Split>
        </div>
        <div className="v2-benefits">
          {rows.map((r, i) => (
            <article className="v2-benefit" key={r.t} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <div><h3 style={{ fontSize: 'clamp(1.1rem, 1.7vw, 1.45rem)' }}>{r.t}</h3></div>
              <p>{r.d}</p>
            </article>
          ))}
        </div>
        <p className="v2-fine" data-reveal>
          [Platzhalter: konkrete Stationen, Unternehmensnamen und Projektbeispiele werden nach
          Freigabe ergänzt — es werden keine unbelegten Angaben veröffentlicht.]
        </p>
      </div>
    </section>
  );
}

/* Arbeitsweise */
function Arbeitsweise() {
  const points = [
    { title: 'Wenige Kunden, volle Aufmerksamkeit', text: 'Quadratblick arbeitet bewusst mit einer begrenzten Zahl von B2B-Kunden gleichzeitig. Das hält die Wege kurz, die Qualität konstant und die Zusammenarbeit persönlich.' },
    { title: 'Gebündelte Produktionstage', text: 'Statt vieler ungeplanter Einzeltermine bündeln wir Aufnahmen an klar definierten Produktionstagen mit standardisierten Leistungsumfängen — planbar für beide Seiten.' },
    { title: 'Beratung gehört dazu', text: 'Strategische Einordnung ist Teil jeder Zusammenarbeit: Positionierung, Themen und Prozesse werden mitgedacht — nicht nur Bilder geliefert.' },
  ];
  return (
    <section className="v2-sec bg-sage" id="arbeitsweise">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Wie wir arbeiten</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Planbar. Gebündelt. Strategisch.
          </Split>
        </div>
        <div className="v2-brand-grid">
          {points.map((p, i) => (
            <div className="v2-brand-cell" key={p.title} data-reveal data-delay={i * 0.12}>
              <span className="num">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
        <div className="v2-brand-foot" data-reveal>
          <p>Vom einzelnen Objektauftrag bis zur laufenden Content-Partnerschaft — der Einstieg ist bewusst einfach.</p>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Kennenlernen anfragen <Arrow />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

function WegeCta() {
  return (
    <section className="v2-sec tight bg-linen-2">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Der passende Einstieg</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Zwei Wege, ein Anspruch.
          </Split>
        </div>
        <div className="v2-hero-ctas" style={{ justifyContent: 'center', marginTop: 36 }} data-reveal>
          <Magnetic>
            <a className="v2-btn" href="/objektcontent/">
              Objektcontent ansehen <Arrow />
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

export default function UeberUnsPage() {
  return (
    <PageShell active="ueber" dark>
      <SubHero
        eyebrow="Über uns · Quadratblick"
        title="Strategischer Content-Partner. Nicht der nächste Fotograf."
        lead="Quadratblick verbindet strategische Unternehmensentwicklung mit professioneller Foto- und Videoproduktion — für Immobilienmakler und Immobilienunternehmen, die Content als Teil ihrer Geschäftsentwicklung verstehen."
        image="/media/ref-aussen-2.jpg"
        imageAlt="Referenzobjekt mit Blick über die Felder der Region"
      />
      <Story />
      <Stationen />
      <Arbeitsweise />
      <WegeCta />
      <Contact />
    </PageShell>
  );
}
