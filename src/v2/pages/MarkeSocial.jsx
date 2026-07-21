import { useEffect, useRef, useState } from 'react';
import { Split, Magnetic, scrollToId, gsap, ScrollTrigger, prefersReducedMotion } from '../fx.jsx';
import { PageShell, SubHero, CrossLink } from '../Shell.jsx';
import { Arrow } from '../ui.jsx';
import { Contact } from '../CloseSections.jsx';

/* ============================ Paketdaten (VORLÄUFIG — finale Abstimmung offen) ============================ */
const MS_PAKETE = [
  {
    key: 'day',
    name: 'Makler Content Day',
    claim: 'Der professionelle Einstieg',
    price: '2.190 €',
    priceNote: 'netto · einmalig',
    setup: 'Setup inklusive',
    laufzeit: 'Keine Vertragsbindung',
    promise: 'Ein gebündelter Produktionstermin liefert Ihnen professionellen Content für sechs bis acht Wochen – ohne langfristige Vertragsbindung.',
    groups: [
      {
        label: 'Enthalten',
        items: [
          '60-minütiges Auftaktgespräch',
          'Kompakter Check des bisherigen Online-Auftritts',
          'Betrachtung von bis zu drei regionalen Wettbewerbern',
          'Definition von drei Content-Säulen',
          'Acht individuelle Themenideen',
          'Sechs Gesprächsleitfäden / Skripte',
          'Halber Produktionstag (bis zu 4 Std.)',
          'Eine Location · bis zu zwei Personen vor der Kamera',
          'Professionelle Kamera-, Licht- und Tonproduktion',
          'Sechs vollständig bearbeitete Kurzvideos',
          '15–20 bearbeitete Business-/Markenfotos',
          'Untertitel, Farb- und Soundoptimierung',
          'Sechs Caption-Entwürfe',
          'Veröffentlichungsplan für 6–8 Wochen',
          'Eine gebündelte Korrekturrunde',
        ],
      },
    ],
    hinweis: 'Kein laufendes Posting, keine langfristige Vertragsbindung.',
    cta: 'Content Day anfragen',
  },
  {
    key: 'partner',
    name: 'Content Partner',
    claim: 'Für planbare wöchentliche Sichtbarkeit',
    featured: true,
    price: '2.990 €',
    priceNote: 'netto / Monat',
    setup: '+ 990 € Setup (einmalig)',
    laufzeit: 'Empfohlene Mindestlaufzeit: 6 Monate',
    promise: 'Ihre Maklermarke ist jede Woche professionell sichtbar, obwohl Sie selbst nur einen gebündelten halben Produktionstag pro Monat investieren.',
    groups: [
      {
        label: 'Setup (einmalig)',
        items: [
          'Positionierungs- und Content-Workshop',
          'Analyse von Marke, Zielgruppen und Leistungsangebot',
          'Vier Content-Säulen',
          'Themen- und Messaging-Matrix',
          'Freigabe- und Content-Prozess',
          'Optimierungsempfehlungen für Ihre Social-Media-Profile',
        ],
      },
      {
        label: 'Monatlich enthalten',
        items: [
          'Strategie- und Redaktionsgespräch',
          'Laufender Themen- und Content-Plan',
          'Gesprächsleitfäden / Skripte',
          'Halber Produktionstag (bis zu 4 Std.)',
          'Eine Location · bis zu zwei Personen vor der Kamera',
          'Acht bearbeitete Kurzvideos',
          'Zwei Carousel-/Grafikbeiträge',
          'Bis zu 20 bearbeitete Fotos',
          'Captions inkl. Handlungsaufforderungen',
          'Thumbnails / Titelgrafiken',
          'Planung & Veröffentlichung auf Instagram und Facebook',
          'Organisierte Content-Bibliothek',
          'Kompakte monatliche Auswertung',
          'Optimierungsempfehlungen',
          'Eine gebündelte Korrekturrunde',
        ],
      },
    ],
    cta: 'Content-Partnerschaft prüfen',
  },
  {
    key: 'leader',
    name: 'Market Leader',
    claim: 'Die ausgelagerte Content-Redaktion',
    price: '4.990 €',
    priceNote: 'netto / Monat',
    setup: '+ 1.490 € Setup (einmalig)',
    laufzeit: 'Empfohlene Mindestlaufzeit: 6 Monate',
    promise: 'Wir positionieren Unternehmen, Führungskräfte und Team systematisch als sichtbare regionale Autorität.',
    groups: [
      {
        label: 'Setup (einmalig)',
        items: [
          'Umfassender Strategie- und Positionierungsworkshop',
          'Regionale Wettbewerbs- und Kommunikationsanalyse',
          'Analyse der Eigentümer-, Käufer- und Bewerberzielgruppen',
          'Marken- und Messaging-Architektur',
          '5–6 Content-Säulen',
          'Rollenverteilung Geschäftsführung / Makler / Team',
          'Wiederkehrende Formate und visuelle Templates',
          'Freigabe-, Produktions- und Archivprozess',
          'KPI-Baseline und strategische Roadmap',
        ],
      },
      {
        label: 'Monatlich enthalten',
        items: [
          'Monatliches Strategie- und Redaktionsgespräch',
          'Rollierende Themen- und Kampagnenplanung',
          'Ganzer Produktionstag (bis zu 7 Std.)',
          'Hauptlocation + nahe Zusatzlocation',
          'Bis zu vier Personen vor der Kamera',
          '14 bearbeitete Kurzvideos',
          'Vier Carousel-/Grafik-/Dokumentenbeiträge',
          '40–50 bearbeitete Fotos',
          'Ein längerer Fachinhalt (z. B. LinkedIn-Artikel, Newsletter, Marktkommentar)',
          'Vollständige Captions inkl. Handlungsaufforderungen',
          'Titelgrafiken / Thumbnails',
          'Veröffentlichung auf Instagram und Facebook',
          'Angepasste Veröffentlichung auf LinkedIn',
          'Optionales Crossposting als YouTube Shorts',
          'Monatliches KPI-Dashboard',
          'Monatliche Handlungsempfehlungen',
          'Vierteljährliches Kampagnenkonzept',
          'Priorisierte Produktions- und Bearbeitungsslots',
          'Eine gebündelte Korrekturrunde',
        ],
      },
    ],
    cta: 'Strategische Zusammenarbeit anfragen',
  },
];

/* Vergleichstabelle */
const MS_TABLE = [
  ['Abrechnung', 'einmalig', 'monatlich', 'monatlich'],
  ['Hauptversprechen', 'Content für 6–8 Wochen', 'Wöchentliche Sichtbarkeit', 'Sichtbare regionale Autorität'],
  ['Produktion', '½ Produktionstag (einmalig, bis 4 Std.)', '½ Produktionstag / Monat (bis 4 Std.)', '1 Produktionstag / Monat (bis 7 Std.)'],
  ['Personen vor der Kamera', 'bis 2', 'bis 2', 'bis 4'],
  ['Locations', '1', '1', 'Hauptlocation + nahe Zusatzlocation'],
  ['Kurzvideos', '6 (einmalig)', '8 / Monat', '14 / Monat'],
  ['Carousel-/Grafikbeiträge', '—', '2 / Monat', '4 / Monat'],
  ['Fotos', '15–20 (einmalig)', 'bis 20 / Monat', '40–50 / Monat'],
  ['Themenentwicklung', 'einmalig (3 Säulen, 8 Themen)', 'laufend (4 Säulen)', 'laufend (5–6 Säulen + Kampagnen)'],
  ['Captions', '6 Entwürfe', 'vollständig, inkl. Handlungsaufforderungen', 'vollständig, inkl. Handlungsaufforderungen'],
  ['Veröffentlichungsplan', 'für 6–8 Wochen', 'laufend', 'laufend + Kampagnen'],
  ['Posting', '—', 'Instagram & Facebook', 'Instagram, Facebook & LinkedIn (optional YouTube Shorts)'],
  ['Reporting', '—', 'kompakte monatliche Auswertung', 'monatliches KPI-Dashboard + Handlungsempfehlungen'],
  ['Kampagnenplanung', '—', '—', 'vierteljährliches Kampagnenkonzept'],
  ['Priorisierte Termine', '—', '—', 'enthalten'],
  ['Preis', '2.190 € netto einmalig', '2.990 € netto / Monat', '4.990 € netto / Monat'],
  ['Setup', 'inklusive', '990 € einmalig', '1.490 € einmalig'],
];

/* ============================ Sections ============================ */

function Problem() {
  const points = [
    { title: 'Gebündelte Produktion', text: 'Statt wöchentlicher Einzeltermine produzieren wir an einem gebündelten Termin Material für mehrere Wochen — vorbereitet, strukturiert und effizient.' },
    { title: 'Relevante Themen', text: 'Die Inhalte entstehen nicht spontan, sondern aus definierten Content-Säulen: Themen, die Eigentümer, Käufer und Ihre Region wirklich interessieren.' },
    { title: 'Professionelle Umsetzung', text: 'Kamera, Licht, Ton, Schnitt, Untertitel und Grafik aus einer Hand — in einer Qualität, die zur Wertigkeit Ihres Unternehmens passt.' },
    { title: 'Weniger interner Aufwand', text: 'Sie investieren wenige, planbare Stunden pro Monat. Themenentwicklung, Vorbereitung, Bearbeitung und Veröffentlichung übernehmen wir.' },
  ];
  return (
    <section className="v2-sec bg-linen" id="system">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Das Problem — und unser System</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Regelmäßiger Content scheitert selten an guten Absichten.
          </Split>
          <p className="v2-lead" data-reveal>
            Er scheitert am Alltag: keine Zeit für Themenfindung, kein Ablauf für Dreh und Schnitt,
            zu viele Beteiligte für einen einzelnen Beitrag. Deshalb bündeln wir Strategie, Produktion
            und Veröffentlichung in einem verlässlichen Content-Prozess: Aus einem gebündelten
            Produktionstermin entsteht Content für mehrere Wochen — ohne dass Sie jede Woche neue
            Themen entwickeln oder mehrere Dienstleister koordinieren müssen.
          </p>
        </div>
        <div className="v2-usps">
          {points.map((p, i) => (
            <article className="v2-usp" key={p.title} data-reveal data-delay={(i % 2) * 0.12}>
              <span className="big-num">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaketCard({ p }) {
  const [openAll, setOpenAll] = useState(false);
  const LIMIT = 8;
  return (
    <article className={`v2-ms-card ${p.featured ? 'featured' : ''}`} data-reveal>
      {p.featured && <span className="flag">Empfohlen</span>}
      <span className="tname">{p.name}</span>
      <p className="claim">{p.claim}</p>
      <div className="price">{p.price}<span className="net">{p.priceNote}</span></div>
      <p className="cond">{p.setup} · {p.laufzeit}</p>
      <p className="promise">{p.promise}</p>
      <div className="lists">
        {p.groups.map((g) => {
          const items = openAll ? g.items : g.items.slice(0, p.groups.length > 1 ? LIMIT : 99);
          const hidden = g.items.length - items.length;
          return (
            <div key={g.label}>
              <div className="glabel">{g.label}</div>
              <ul>
                {items.map((it) => (
                  <li key={it}><span className="tick">✓</span>{it}</li>
                ))}
              </ul>
              {hidden > 0 && (
                <button type="button" className="more" onClick={() => setOpenAll(true)}>
                  + {hidden} weitere Leistungen anzeigen
                </button>
              )}
            </div>
          );
        })}
      </div>
      {p.hinweis && <p className="note">{p.hinweis}</p>}
      <div className="cta">
        <button type="button" className={`v2-btn ${p.featured ? '' : 'ghost'} ${p.featured ? '' : ''}`} onClick={() => scrollToId('anfrage')} style={{ width: '100%', justifyContent: 'center' }}>
          {p.cta} <Arrow size={15} />
        </button>
      </div>
    </article>
  );
}

function MSPakete() {
  return (
    <section className="v2-sec bg-linen-2" id="pakete">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Drei Modelle der Zusammenarbeit</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Vom einmaligen Content Day bis zur ausgelagerten Content-Redaktion.
          </Split>
          <p className="v2-lead" data-reveal>
            Die Modelle unterscheiden sich nicht nur im Produktionsumfang, sondern vor allem in
            strategischer Verantwortung, organisatorischer Entlastung, Personenanzahl, Plattformen
            und dem Umfang von Veröffentlichung, Auswertung und Kampagnenplanung.
          </p>
        </div>
        <div className="v2-prelim" data-reveal>
          <span className="tag">Vorläufige Angebotsstruktur</span>
          Preise und Leistungsumfänge befinden sich in finaler Abstimmung und können sich bis zur
          Veröffentlichung noch ändern.
        </div>
        <div className="v2-ms-cards">
          {MS_PAKETE.map((p) => <PaketCard key={p.key} p={p} />)}
        </div>
        <p className="v2-fine" data-reveal>Alle Preise netto, zzgl. gesetzl. MwSt. — Angebote für Geschäftskunden.</p>
      </div>
    </section>
  );
}

function MSVergleich() {
  return (
    <section className="v2-sec bg-linen" id="vergleich">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Direkter Vergleich</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Die drei Modelle im Überblick.
          </Split>
        </div>
        <div className="v2-table-wrap" data-reveal>
          <table className="v2-table">
            <thead>
              <tr>
                <th scope="col">Leistung</th>
                <th scope="col">Content Day</th>
                <th scope="col" className="hl">Content Partner</th>
                <th scope="col">Market Leader</th>
              </tr>
            </thead>
            <tbody>
              {MS_TABLE.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  <td>{row[1]}</td>
                  <td className="hl">{row[2]}</td>
                  <td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="v2-fine" data-reveal>Vorläufige Angebotsstruktur · Alle Preise netto, zzgl. gesetzl. MwSt.</p>
      </div>
    </section>
  );
}

function MSAblauf() {
  const rootRef = useRef(null);
  const steps = [
    { title: 'Strategie und Themen', text: 'Wir klären Positionierung, Zielgruppen und Content-Säulen — und entwickeln daraus konkrete Themen und Formate für die kommenden Wochen.' },
    { title: 'Vorbereitung', text: 'Sie erhalten Gesprächsleitfäden und einen klaren Drehplan. Sie wissen vorab genau, was aufgenommen wird — ohne selbst Themen entwickeln zu müssen.' },
    { title: 'Gebündelte Produktion', text: 'An einem gebündelten Produktionstermin nehmen wir alle Inhalte auf: Video, Foto und Material für Grafikbeiträge — effizient und professionell begleitet.' },
    { title: 'Bearbeitung und Veröffentlichung', text: 'Wir schneiden, gestalten und texten die Beiträge, stimmen sie mit Ihnen ab und veröffentlichen sie nach Plan. Sie sehen jede Woche Ergebnisse.' },
  ];

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const root = rootRef.current;
    const ctx = gsap.context(() => {
      gsap.to('.v2-proc-line .fill', {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.v2-proc-steps', start: 'top 72%', end: 'bottom 55%', scrub: 0.4 },
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
    <section className="v2-sec bg-linen-2" id="ablauf" ref={rootRef}>
      <div className="v2-wrap">
        <div className="v2-proc">
          <div className="v2-proc-left">
            <p className="v2-eyebrow" data-reveal>Ablauf der Zusammenarbeit</p>
            <Split as="h2" className="v2-h-display v2-h-lg" style={{ marginTop: 22 }}>
              Vier Schritte. Ein verlässlicher Content-Prozess.
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

function MSBereiche() {
  const chips = [
    'Wissen für Immobilieneigentümer',
    'Regionale Marktinformationen',
    'Typische Fehler bei Verkauf und Vermietung',
    'Persönliche Arbeitsweise des Maklers',
    'Objektvorstellungen',
    'Referenzen und Erfolgsgeschichten',
    'Einblicke hinter die Kulissen',
    'Team und Recruiting',
    'Unternehmenswerte',
    'Häufige Fragen von Käufern und Verkäufern',
  ];
  return (
    <section className="v2-sec bg-linen" id="bereiche">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Mögliche Content-Bereiche</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Woraus Ihr Content entstehen kann.
          </Split>
          <p className="v2-lead" data-reveal>
            Welche Bereiche für Sie relevant sind, legen wir gemeinsam in den Content-Säulen fest —
            passend zu Ihrer Positionierung und Ihren Zielgruppen.
          </p>
        </div>
        <div className="v2-chips" data-reveal>
          {chips.map((c) => <span className="v2-chip" key={c}>{c}</span>)}
        </div>
      </div>
    </section>
  );
}

function MSAnders() {
  const diffs = [
    { title: 'Strategie vor Produktion', text: 'Der Hintergrund unseres Gründers liegt in der strategischen Unternehmensentwicklung, nicht nur hinter der Kamera. Jeder Inhalt zahlt auf Positionierung und Geschäftsziele ein — nicht nur auf den Feed.' },
    { title: 'Gebündelte Termine statt Dauerbegleitung', text: 'Wir arbeiten mit wenigen, planbaren Produktionsterminen und standardisierten Leistungsumfängen. Das hält Ihren internen Aufwand minimal und die Qualität konstant.' },
    { title: 'Ein Partner für den gesamten Prozess', text: 'Strategie, Themen, Dreh, Schnitt, Grafik und Veröffentlichung kommen aus einer Hand. Keine Koordination mehrerer Dienstleister, keine Reibungsverluste.' },
  ];
  return (
    <section className="v2-sec bg-sage" id="anders">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Warum diese Zusammenarbeit anders ist</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Kein austauschbarer Fotograf. Kein Reel-Fließband.
          </Split>
        </div>
        <div className="v2-brand-grid">
          {diffs.map((d, i) => (
            <div className="v2-brand-cell" key={d.title} data-reveal data-delay={i * 0.12}>
              <span className="num">0{i + 1}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
          ))}
        </div>
        <div className="v2-notincluded" data-reveal>
          <span className="label">Transparenz: standardmäßig nicht enthalten</span>
          <p>
            Tägliches Community Management und die permanente Beantwortung von Kommentaren oder
            Direktnachrichten · unbegrenzte Änderungswünsche · tägliche spontane Vor-Ort-Begleitung ·
            garantierte Reichweite, Leads oder Verkaufsmandate · Werbebudget und umfangreiches
            Performance-Marketing · unbegrenzte zusätzliche Objekttermine. Was darüber hinaus
            gewünscht ist, besprechen und kalkulieren wir individuell.
          </p>
        </div>
      </div>
    </section>
  );
}

function MSFaq() {
  const items = [
    { q: 'Wie viel Zeit muss ich selbst investieren?', a: 'Deutlich weniger, als Sie vermutlich erwarten: das Auftakt- bzw. monatliche Strategiegespräch und den gebündelten Produktionstermin (je nach Paket ein halber oder ganzer Tag). Themenentwicklung, Vorbereitung, Bearbeitung und Veröffentlichung übernehmen wir.' },
    { q: 'Ich habe keine Erfahrung vor der Kamera. Funktioniert das trotzdem?', a: 'Ja. Sie erhalten vorab Gesprächsleitfäden und Skripte, und wir führen Sie beim Dreh Schritt für Schritt. Es sind beliebig viele Anläufe möglich — verwendet wird nur, was Sie überzeugt und authentisch zeigt.' },
    { q: 'Können mehrere Personen aus dem Unternehmen eingebunden werden?', a: 'Ja. Beim Content Day und beim Content Partner sind bis zu zwei Personen vor der Kamera vorgesehen, beim Market Leader bis zu vier — zum Beispiel Geschäftsführung, Makler und Team.' },
    { q: 'Was unterscheidet den Content Day von einer Content-Partnerschaft?', a: 'Der Content Day ist ein einmaliger, gebündelter Produktionstermin mit Material für sechs bis acht Wochen — ideal zum Kennenlernen. Die Partnerschaften laufen monatlich: Themenplanung, Produktion, Veröffentlichung und Auswertung werden fortlaufend übernommen.' },
    { q: 'Ist die Veröffentlichung der Beiträge inklusive?', a: 'Beim Content Day erhalten Sie einen fertigen Veröffentlichungsplan, posten aber selbst. Bei Content Partner und Market Leader übernehmen wir Planung und Veröffentlichung auf Instagram und Facebook, beim Market Leader zusätzlich angepasst auf LinkedIn.' },
    { q: 'Können Objektaufnahmen integriert werden?', a: 'Ja, in Absprache lassen sich Objektvorstellungen in den Produktionstermin integrieren. Unbegrenzte zusätzliche Objekttermine sind nicht enthalten — dafür gibt es unsere Objektcontent-Pakete, die sich mit jedem Modell kombinieren lassen.' },
    { q: 'Was ist ausdrücklich nicht enthalten?', a: 'Tägliches Community Management, die permanente Beantwortung von Kommentaren und Direktnachrichten, unbegrenzte Änderungswünsche, Werbebudget und Performance-Marketing sowie garantierte Reichweite, Leads oder Verkaufsmandate. Seriös lässt sich Sichtbarkeit planen — Ergebnisse im Einzelfall nicht versprechen.' },
    { q: 'Wie schnell ist der Content nach dem Produktionstermin fertig?', a: 'Die Bearbeitung erfolgt gebündelt nach dem Produktionstermin, sodass der Veröffentlichungsplan nahtlos anschließt. [PLATZHALTER: konkrete Lieferfrist wird final abgestimmt]' },
    { q: 'Wie lange laufen die Verträge?', a: 'Der Content Day ist ein einmaliger Auftrag ohne Vertragsbindung. Für Content Partner und Market Leader empfehlen wir eine Mindestlaufzeit von sechs Monaten — Markenaufbau braucht Kontinuität, danach monatlich verlängerbar.' },
    { q: 'Sind die Preise Netto-Preise?', a: 'Ja. Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt. und richten sich an Geschäftskunden.' },
    { q: 'Sind zusätzliche Drehtage buchbar?', a: 'Ja, nach Verfügbarkeit — zum Beispiel für Kampagnen, Events oder zusätzliche Objekte. [PLATZHALTER: Konditionen für Zusatz-Drehtage werden final abgestimmt]' },
    { q: 'Arbeiten Sie nur regional?', a: 'Unser Schwerpunkt liegt im Raum Bühl, Mittelbaden und der Ortenau. Zusammenarbeit darüber hinaus ist nach Absprache möglich. [PLATZHALTER: Radius und Reisekosten-Regelung werden final abgestimmt]' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="v2-sec bg-linen-2" id="faq">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Häufige Fragen</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Damit keine Fragen offen bleiben.
          </Split>
        </div>
        <div className="v2-faq" data-reveal>
          {items.map((it, i) => (
            <MSFaqItem key={it.q} q={it.q} a={it.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MSFaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = open ? `${el.scrollHeight}px` : '0px';
  }, [open]);
  return (
    <div className={`v2-faq-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="v2-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="ico" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
        </span>
      </button>
      <div className="v2-faq-a" ref={bodyRef} aria-hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
}

function MSFinalCta() {
  return (
    <section className="v2-sec bg-ink" id="cta">
      <div className="v2-wrap" style={{ textAlign: 'center' }}>
        <div className="v2-sec-head center">
          <p className="v2-eyebrow on-dark" data-reveal>Der nächste Schritt</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Lassen Sie uns prüfen, welches Content-Modell zu Ihrem Unternehmen passt.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            In einem unverbindlichen Strategiegespräch klären wir Ausgangslage, Ziele und den
            sinnvollen Einstieg — ob Content Day oder laufende Partnerschaft.
          </p>
        </div>
        <div className="v2-hero-ctas" style={{ justifyContent: 'center', marginTop: 36 }} data-reveal>
          <Magnetic>
            <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
              Strategiegespräch vereinbaren <Arrow />
            </button>
          </Magnetic>
          <Magnetic>
            <a className="v2-btn ghost on-dark" href="/objektcontent/">
              Objektproduktion anfragen
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

export default function MarkeSocialPage() {
  return (
    <PageShell active="marke" dark>
      <SubHero
        eyebrow="Marke & Social · Content-Partnerschaften für Makler"
        title="Ein Produktionstag. Wochenlang relevanter Content für Ihre Maklermarke."
        lead="Strategie, Foto, Video und Content-Produktion für Immobilienmakler – gebündelt an wenigen Terminen und professionell für mehrere Wochen aufbereitet."
        image="/media/ref-detail.jpg"
        imageAlt="Architektur-Detail eines Referenzobjekts — Eingangsbereich mit Briefkastenanlage"
        ctas={(
          <>
            <Magnetic>
              <button type="button" className="v2-btn" onClick={() => scrollToId('anfrage')}>
                Strategiegespräch vereinbaren <Arrow />
              </button>
            </Magnetic>
            <Magnetic>
              <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('pakete')}>
                Content Day ansehen
              </button>
            </Magnetic>
          </>
        )}
        trust="Für Immobilienmakler, Maklerbüros und regionale Immobilienunternehmen."
      />
      <Problem />
      <MSPakete />
      <MSVergleich />
      <MSAblauf />
      <MSBereiche />
      <MSAnders />
      <CrossLink
        eyebrow="Erst einmal ein konkretes Objekt?"
        title="Sie benötigen zunächst Content für ein konkretes Objekt?"
        text="Unsere Objektcontent-Pakete liefern Fotos, Film und Drohnenaufnahmen für einzelne Immobilien — pro Objekt gebucht, mit direkt anfragbarem Wunschtermin. Der ideale erste Berührungspunkt."
        href="/objektcontent/"
        cta="Zum Objektcontent"
      />
      <MSFaq />
      <MSFinalCta />
      <Contact />
    </PageShell>
  );
}
