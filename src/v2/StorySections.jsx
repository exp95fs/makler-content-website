import { Split, Magnetic, scrollToId } from './fx.jsx';
import { Arrow } from './ui.jsx';

/* ---------- Warum hochwertiger Content (6 Gründe) ---------- */
export function Benefits() {
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
              <div>
                <h3>{it.title}</h3>
                {it.kpi && <span className="kpi">{it.kpi}</span>}
              </div>
              <p>{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Leistungen & Pakete ---------- */
const PKG_GROUPS = [
  {
    key: 'foto',
    label: 'Foto',
    dot: 'sage',
    lead: 'Foto Basis oder Premium?',
    note: ' Foto Basis eignet sich für Wohnungen und klassische Immobilien, Foto Premium für besondere, hochpreisige oder emotional zu vermarktende Objekte.',
    tiers: [
      { name: 'Foto Basis', price: '390 €', desc: 'Ca. 1–2 Aufnahmen pro Raum, professionell bearbeitet, für einen vollständigen, überzeugenden Immobilienauftritt. Ideal für Wohnungen und klassische Verkaufsobjekte.' },
      { name: 'Foto Premium', price: '590 €', desc: '30–40 professionell bearbeitete Aufnahmen inkl. Detail- und Atmosphärenbildern. Ideal für besondere, hochpreisige und emotional zu vermarktende Immobilien.' },
    ],
  },
  {
    key: 'film',
    label: 'Film',
    dot: 'terra',
    lead: 'Objektfilm oder Makler-Film?',
    note: ' Der Objektfilm inszeniert die Immobilie ohne Auftritt vor der Kamera, der Makler-Film zeigt Sie zusätzlich persönlich und stärkt Vertrauen und Marke.',
    tiers: [
      { name: 'Objektfilm', price: '890 €', desc: 'Hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll vermittelt – ganz ohne Personen vor der Kamera. Ideal für eine emotionale Präsentation.' },
      { name: 'Makler-Film', price: '1.290 €', desc: 'Atmosphärische Aufnahmen der Immobilie treffen auf Ihre persönliche Präsentation vor der Kamera – für Vertrauen und Ihre Marke.' },
    ],
  },
];

export function Pakete() {
  return (
    <section className="v2-sec bg-linen-2" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Leistungen &amp; Pakete</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Der passende Auftritt für jede Immobilie.
          </Split>
          <p className="v2-lead" data-reveal>
            Ob hochwertige Fotostrecke oder emotionaler Immobilienfilm: Wählen Sie das Paket, das zu
            Ihrem Objekt, Ihrer Zielgruppe und Ihrem Vermarktungsziel passt. Alle Leistungen lassen
            sich individuell ergänzen und auf Wunsch zu einer abgestimmten Content-Produktion kombinieren.
          </p>
        </div>

        <div className="v2-pkg-groups">
          {PKG_GROUPS.map((g) => (
            <div key={g.key} data-reveal>
              <div className="v2-pkg-group-head">
                <span className={`dot ${g.dot}`} />
                <span>{g.label}</span>
              </div>
              <p className="v2-pkg-note"><strong>{g.lead}</strong>{g.note}</p>
              <div className="v2-pkg-rows">
                {g.tiers.map((t) => (
                  <div className="v2-pkg-row" key={t.name}>
                    <div>
                      <h3>{t.name}</h3>
                      <div className="price">{t.price}<span className="net">netto</span></div>
                    </div>
                    <p>{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="v2-chance" data-reveal>
          <span className="label">Mehrere Objekte, ein Termin: 10 % Rabatt</span>
          <p>
            Beauftragen Sie mehr als ein Objekt bei einem gemeinsamen Termin, erhalten Sie auf die
            Gesamtsumme 10 % Rabatt. Direkt in der Terminanfrage wählbar.
          </p>
        </div>

        <div className="v2-pkg-ctas" data-reveal>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
              Paket &amp; Termin anfragen <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="v2-btn ghost" onClick={() => scrollToId('anfrage')}>
              Nachricht schreiben
            </button>
          </Magnetic>
        </div>
        <p className="v2-fine" data-reveal>Alle Preise netto, zzgl. gesetzl. MwSt.</p>
      </div>
    </section>
  );
}

/* ---------- Segmente: Verkauf / Vermietung ---------- */
export function Segments() {
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
      img: '/media/ref-innen-3.jpg',
      alt: 'Innenaufnahme — großzügiger Wohnraum eines Verkaufsobjekts mit bodentiefen Fenstern',
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
      img: '/media/ref-innen-2.jpg',
      alt: 'Innenaufnahme — offene Wohnküche eines Mietobjekts mit warmem Boden',
    },
  ];
  return (
    <section className="v2-sec bg-linen" id="segmente">
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

