import { Split } from './fx.jsx';

/* ---------- Warum hochwertiger Content (6 Gründe) ---------- */
function Benefits() {
  const items = [
    { title: 'Objekte heben sich ab', text: 'Im Portal entscheidet das erste Bild. Profi-Fotos bringen spürbar mehr Aufmerksamkeit.', kpi: '+61 % mehr Aufrufe' },
    { title: 'Bleiben im Kopf', text: 'Video vermittelt Raumgefühl, Licht und Laufwege. Interessenten erinnern sich an Ihr Objekt, nicht an das nächste in der Liste.' },
    { title: 'Schneller vermittelt', text: 'Bessere Darstellung verkürzt die Zeit am Markt nachweislich, bei Fotos wie bei Video.', kpi: 'bis zu ~32 % schneller' },
    { title: 'Qualifiziertere Anfragen', text: 'Wer das Objekt im Video gesehen hat, meldet sich gezielter. Weniger Besichtigungstourismus, weniger vergeudete Termine.' },
    { title: 'Repräsentiert Ihr Büro', text: 'Konsistenter, hochwertiger Content zeigt Ihren Qualitätsanspruch. Bei Eigentümern wie bei Käufern.' },
    { title: 'Baut Ihre Marke', text: 'Reels und Maklerpräsenz arbeiten auch für Sie, nicht nur fürs Objekt.', kpi: '71 % wählen Makler mit starker Online-Präsenz' },
  ];
  return (
    <section className="v2-sec bg-linen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Warum hochwertiger Content</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Sechs Gründe, warum sich der Invest in guten Content rechnet.
          </Split>
          <p className="v2-lead" data-reveal>
            Hochwertige Fotos und Videos sind kein Schmuck fürs Inserat. Sie sind ein messbarer
            Hebel auf Anfragen, Vermittlungsdauer und das Bild, das Ihr Büro abgibt.
          </p>
        </div>
        <div className="v2-benefits">
          {items.map((it, i) => (
            <article className="v2-benefit" key={it.title} data-reveal data-delay={Math.min(i * 0.06, 0.3)}>
              <span className="num">0{i + 1}</span>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              {it.kpi ? <span className="kpi">{it.kpi}</span> : <span />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Referenzprojekt / Arbeitsproben ---------- */
function Showcase() {
  return (
    <section className="v2-sec bg-ink v2-show" id="portfolio">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Arbeitsproben · Referenzprojekt 01</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Die ersten Referenzobjekte entstehen gerade.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wir bauen unser regionales Portfolio auf — hier ein Einblick in ein aktuelles Projekt:
            ein Mehrgenerationenhaus in Mittelbaden, außen wie innen. Wenn Sie ein passendes Objekt
            haben, zum Verkauf oder zur Vermietung, kann Ihr Objekt eines der nächsten sein.
            Kostenlos. Wie das funktioniert, lesen Sie gleich.
          </p>
        </div>

        <div className="v2-show-grid">
          <figure className="v2-show-item v2-show-a" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/aussen-1-web.jpg" alt="Mehrgenerationenhaus — Außenaufnahme mit Carport und Zufahrt" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Außen · Zufahrt &amp; Architektur</span><span>01</span></figcaption>
          </figure>

          <figure className="v2-show-item v2-show-reel" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Reel">
            <div className="v2-reel-frame" data-reveal>
              <span className="v2-reel-badge"><span className="rec" />Drohne · Reel</span>
              <video src="/media/drohne-web.mp4" poster="/media/drohne-poster.jpg" autoPlay muted loop playsInline />
            </div>
            <figcaption className="v2-show-cap"><span>Drohnensequenz · 9:16</span><span>02</span></figcaption>
          </figure>

          <figure className="v2-show-item v2-show-b" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/innen-1-web.jpg" alt="Wohnung im Referenzobjekt — offener Wohnraum mit Parkett und bodentiefen Fenstern" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Innen · Wohnraum &amp; Licht</span><span>03</span></figcaption>
          </figure>

          <figure className="v2-show-item v2-show-c" style={{ margin: 0 }} data-cursor="view" data-cursor-label="Referenz">
            <div className="frame" data-clip-reveal>
              <img src="/media/innen-2-web.jpg" alt="Wohnung im Referenzobjekt — lichtdurchfluteter Raum mit Gartenblick" loading="lazy" />
            </div>
            <figcaption className="v2-show-cap"><span>Innen · Raumgefühl</span><span>04</span></figcaption>
          </figure>
        </div>

        <div className="v2-show-foot" data-reveal>
          <a className="v2-link-inline" href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer">
            Mehr Arbeitsproben auf Instagram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
          </a>
          <span className="v2-idx" style={{ color: 'rgba(243,238,229,0.4)' }}>Mehrgenerationenhaus · Mittelbaden · 2026</span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Segmente: Verkauf / Vermietung ---------- */
function Segments() {
  const segs = [
    {
      tag: 'Verkaufen', tone: 'terra',
      title: 'Wohnungen · Häuser · Anwesen',
      text: 'Content, der den Wert eines Kaufobjekts vermittelt und den richtigen Käufer schneller anzieht.',
      points: [
        'Schnellere Vermittlung, höhere Wahrnehmung des Objekts',
        'Vorqualifizierte Käufer durch realistisches Raumgefühl',
        'Stärkere Position im Akquisegespräch mit Eigentümern',
      ],
      img: '/media/innen-1-web.jpg',
      alt: 'Innenaufnahme — offener Wohnraum eines Verkaufsobjekts',
    },
    {
      tag: 'Vermieten & Ferienwohnung', tone: 'sage', flip: true,
      title: 'Miet- & Kurzzeit-/Ferienobjekte',
      text: 'Content, der Buchungen und Mietanfragen steigert, bis hin zu Ferienwohnung und Airbnb.',
      points: [
        'Bis zu +40 % mehr Buchungen mit Profi-Fotos',
        '~26 % höhere erzielbare Preise, weniger Leerstand',
        'Wiederverwendbarer Content für Portale & Social Media',
      ],
      img: '/media/innen-2-web.jpg',
      alt: 'Innenaufnahme — lichtdurchfluteter Raum eines Mietobjekts',
    },
  ];
  return (
    <section className="v2-sec bg-linen-2" id="segmente">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Für welches Ziel?</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Ob Verkauf oder Vermietung: Der richtige Content für Ihr Objekt.
          </Split>
        </div>
        {segs.map((s) => (
          <div className={`v2-seg ${s.flip ? 'flip' : ''}`} key={s.tag}>
            <div className="media" data-cursor="view" data-cursor-label={s.tag.split(' ')[0]}>
              <div className="frame" data-clip-reveal>
                <img src={s.img} alt={s.alt} loading="lazy" data-parallax="14" />
              </div>
            </div>
            <div className="body" data-reveal>
              <span className={`v2-seg-tag ${s.tone}`}>{s.tag}</span>
              <h3 className="v2-h-display v2-h-md">{s.title}</h3>
              <p>{s.text}</p>
              <ul>
                {s.points.map((p) => (
                  <li key={p}><span className="tick">→</span>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        <p className="v2-fine" data-reveal>
          Vermietungs-/Ferienwohnungs-Zahlen: Airbnb- und Branchen-Zusammenstellungen. Richtwerte, keine Garantie.
        </p>
      </div>
    </section>
  );
}

export function StorySections() {
  return (
    <>
      <Benefits />
      <Showcase />
      <Segments />
    </>
  );
}
