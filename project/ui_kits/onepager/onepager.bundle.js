/* Precompiled from ui.jsx, NavHero.jsx, Value.jsx, Branding.jsx, Flow.jsx, FaqContact.jsx (+ App/mount glue) via build.js.
   Do not edit directly — edit the .jsx sources and rerun `node build.js`. */

/* Shared helpers for the Makler-Content one-pager.
   Exposes: Icon, Container, Section, SectionHead. */

function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) {
      window.lucide.createIcons();
      const svg = host.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.strokeWidth = strokeWidth;
      }
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color,
      ...style
    }
  });
}
function Container({
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)',
      ...style
    }
  }, children);
}
function Section({
  id,
  bg = 'page',
  divider = false,
  children,
  style = {}
}) {
  const bgs = {
    page: 'var(--bg-page)',
    surface: 'var(--surface-card)',
    sage: 'var(--color-primary)'
  };
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      background: bgs[bg],
      padding: 'clamp(56px, 8vw, 96px) 0',
      borderTop: divider ? '1px solid var(--border-hair)' : 'none',
      borderBottom: divider ? '1px solid var(--border-hair)' : 'none',
      ...style
    }
  }, children);
}
function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  onDark = false,
  maxWidth = '54ch'
}) {
  const {
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const titleColor = onDark ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const leadColor = onDark ? 'var(--color-secondary)' : 'var(--text-muted)';
  const centered = align === 'center';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      maxWidth: centered ? maxWidth : 'none',
      margin: centered ? '0 auto' : '0'
    }
  }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    color: onDark ? 'onDark' : 'accent'
  }, eyebrow), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
      lineHeight: 1.14,
      letterSpacing: 'var(--ls-heading)',
      color: titleColor,
      margin: '14px 0 0',
      maxWidth,
      textWrap: 'balance',
      marginLeft: centered ? 'auto' : 0,
      marginRight: centered ? 'auto' : 0
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: leadColor,
      margin: '16px 0 0',
      maxWidth,
      marginLeft: centered ? 'auto' : 0,
      marginRight: centered ? 'auto' : 0
    }
  }, lead));
}
Object.assign(window, {
  Icon,
  Container,
  Section,
  SectionHead
});

/* Nav + Hero + StatBar for the Makler-Content one-pager. */

/* ---------------- Nav ---------------- */
/* PLATZHALTER: Markenname & Logo — der Logo-Baustein des Design-Systems rendert
   „Makler·Content" als Platzhalter. Später durch das finale Logo ersetzen. */
function Nav({
  onNav
}) {
  const {
    Logo,
    Button
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon
  } = window;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(243,238,229,0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '13px var(--container-pad)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      textDecoration: 'none',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "sm"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNav('anfrage')
  }, "Gratis-Pilot anfragen")));
}

/* ---------------- Hero ---------------- */
function Hero({
  onNav
}) {
  const {
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      padding: 'clamp(44px, 6vw, 80px) var(--container-pad) clamp(40px, 5vw, 64px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '68ch'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Foto & Video f\xFCr Makler \xB7 Raum B\xFChl \xB7 Mittelbaden \xB7 Ortenau"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(2.3rem, 4.8vw, 3.5rem)',
      lineHeight: 1.06,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 0',
      textWrap: 'balance'
    }
  }, "Content, der Ihre Objekte heraushebt - und Ihr", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-accent)'
    }
  }, "Maklerb\xFCro"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '22px 0 0',
      maxWidth: '52ch'
    }
  }, "Professionelle Fotos und konzipierte Videos f\xFCr Maklerb\xFCros. Hochwertiger Content, der Ihre Objekte schneller vermittelt, qualifiziertere Anfragen bringt und Ihr B\xFCro als Marke sichtbar macht \u2014 Konzept, Dreh und Schnitt aus einer Hand."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      margin: '30px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNav('anfrage')
  }, "Gratis-Pilot anfragen"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: () => onNav('portfolio')
  }, "Arbeitsproben ansehen")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--text-muted)',
      margin: '20px 0 0',
      lineHeight: 1.6
    }
  }, "F\xFCr Verkauf & Vermietung \xB7 Foto, Video, Drohne und 360\xB0 \xB7 schnelle Lieferung nach Paketumfang."))));
}

/* ---------------- StatBar ---------------- */
function StatBar() {
  const {
    Container
  } = window;
  const stats = [{
    big: '+403 %',
    lbl: 'mehr Anfragen mit Video'
  }, {
    big: '~32 %',
    lbl: 'schnellere Vermittlung mit Profi-Fotos'
  }, {
    big: '73 %',
    lbl: 'der Verkäufer bevorzugen Makler, die Video nutzen'
  }, {
    big: 'nur 9 %',
    lbl: 'der Makler machen objektspezifische Videos'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hair)',
      borderBottom: '1px solid var(--border-hair)',
      padding: 'clamp(36px, 5vw, 52px) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      textAlign: 'center'
    },
    className: "mc-stats"
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.lbl
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-accent)'
    }
  }, s.big), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13.5px',
      lineHeight: 1.45,
      color: 'var(--text-muted)',
      margin: '10px auto 0',
      maxWidth: '22ch'
    }
  }, s.lbl)))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      opacity: 0.85,
      textAlign: 'center',
      margin: '26px auto 0',
      maxWidth: '78ch',
      lineHeight: 1.55
    }
  }, "Quellen: NAR, Redfin/VHT, Branchenstudien (\xFCberwiegend international) \u2014 die Gr\xF6\xDFenordnung ist auf den deutschen Markt \xFCbertragbar, in dem Video noch kaum genutzt wird.")));
}
Object.assign(window, {
  Nav,
  Hero,
  StatBar
});

/* Benefits (6 reasons) + Segments (sell / rent). */

function Benefits() {
  const {
    Card
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container,
    SectionHead
  } = window;
  const items = [{
    icon: 'trending-up',
    title: 'Objekte heben sich ab',
    text: 'Im Portal entscheidet das erste Bild. Profi-Fotos bringen spürbar mehr Aufmerksamkeit.',
    kpi: '+61 % mehr Aufrufe'
  }, {
    icon: 'eye',
    title: 'Bleiben im Kopf',
    text: 'Video vermittelt Raumgefühl, Licht und Laufwege. Interessenten erinnern sich an Ihr Objekt, nicht an das nächste in der Liste.'
  }, {
    icon: 'timer',
    title: 'Schneller vermittelt',
    text: 'Bessere Darstellung verkürzt die Zeit am Markt nachweislich, bei Fotos wie bei Video.',
    kpi: 'bis zu ~32 % schneller'
  }, {
    icon: 'target',
    title: 'Qualifiziertere Anfragen',
    text: 'Wer das Objekt im Video gesehen hat, meldet sich gezielter. Weniger Besichtigungstourismus, weniger vergeudete Termine.'
  }, {
    icon: 'building-2',
    title: 'Repräsentiert Ihr Büro',
    text: 'Konsistenter, hochwertiger Content zeigt Ihren Qualitätsanspruch. Bei Eigentümern wie bei Käufern.'
  }, {
    icon: 'sparkles',
    title: 'Baut Ihre Marke',
    text: 'Reels und Maklerpräsenz arbeiten auch für Sie, nicht nur fürs Objekt.',
    kpi: '71 % wählen Makler mit starker Online-Präsenz'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Warum hochwertiger Content",
    title: "Sechs Gr\xFCnde, warum sich der Invest in guten Content rechnet.",
    lead: "Hochwertige Fotos und Videos sind kein Schmuck f\xFCrs Inserat. Sie sind ein messbarer Hebel auf Anfragen, Vermittlungsdauer und das Bild, das Ihr B\xFCro abgibt."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.title,
    interactive: true,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '46px',
      height: '46px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '19px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 8px'
    }
  }, it.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, it.text), it.kpi && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginTop: '12px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-bold)',
      fontSize: '13px',
      color: 'var(--color-accent-deep)'
    }
  }, it.kpi))))));
}
function Segments() {
  const {
    Card,
    Badge,
    MediaFrame
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container,
    SectionHead
  } = window;
  const segs = [{
    tag: 'Verkaufen',
    tagTone: 'accent',
    accent: 'var(--color-accent)',
    title: 'Wohnungen · Häuser · Anwesen',
    text: 'Content, der den Wert eines Kaufobjekts vermittelt und den richtigen Käufer schneller anzieht.',
    points: ['Schnellere Vermittlung, höhere Wahrnehmung des Objekts', 'Vorqualifizierte Käufer durch realistisches Raumgefühl', 'Stärkere Position im Akquisegespräch mit Eigentümern'],
    ph: 'Beispiel · Verkaufsobjekt'
  }, {
    tag: 'Vermieten & Ferienwohnung',
    tagTone: 'sage',
    accent: 'var(--color-primary)',
    title: 'Miet- & Kurzzeit-/Ferienobjekte',
    text: 'Content, der Buchungen und Mietanfragen steigert — bis hin zu Ferienwohnung und Airbnb.',
    points: ['Bis zu +40 % mehr Buchungen mit Profi-Fotos', '~26 % höhere erzielbare Preise, weniger Leerstand', 'Wiederverwendbarer Content für Portale & Social Media'],
    ph: 'Beispiel · Ferienwohnung'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "F\xFCr welches Ziel?",
    title: "Ob Verkauf oder Vermietung: Der richtige Content f\xFCr Ihr Objekt."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(28px, 4vw, 40px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
    }
  }, segs.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.tag,
    padding: "lg",
    style: {
      borderColor: 'var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: s.tagTone
  }, s.tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '21px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.text), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '16px 0 0',
      padding: 0,
      display: 'grid',
      gap: '11px'
    }
  }, s.points.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: '2px',
      flex: 'none',
      color: s.accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: s.accent
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '18px'
    }
  }, /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "16 / 9",
    radius: "md",
    placeholderLabel: s.ph,
    style: {
      boxShadow: 'var(--shadow-sm)'
    }
  }))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      opacity: 0.85,
      margin: '22px 0 0',
      lineHeight: 1.55
    }
  }, "Vermietungs-/Ferienwohnungs-Zahlen: Airbnb- und Branchen-Zusammenstellungen. Richtwerte, keine Garantie.")));
}
Object.assign(window, {
  Benefits,
  Segments
});

/* NEW — Personal Branding / Markenbildung (sage full-bleed) + USP. */

function Branding({
  onNav
}) {
  const {
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const pillars = [{
    icon: 'layers',
    title: 'Konsistente Bildsprache',
    text: 'Eine durchgängige Handschrift über alle Objekte hinweg. Ihr Büro wird auf den ersten Blick wiedererkannt.'
  }, {
    icon: 'megaphone',
    title: 'Sie als Gesicht der Region',
    text: 'Makler-Reels, Porträt- und Experten-Content, der Vertrauen aufbaut, bevor das erste Gespräch beginnt.'
  }, {
    icon: 'badge-check',
    title: 'Strategie statt Einzelclips',
    text: 'Ein roter Faden für Portale, Social Media und Website. Strategisch geplant, nicht zufällig zusammengestellt.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "sage"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '60ch'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "onDark"
  }, "Markenbildung"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
      lineHeight: 1.14,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Nicht nur das Objekt \u2014 Ihr Maklerb\xFCro als Marke."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: '16px 0 0'
    }
  }, "Einzelne Objekte zu vermarkten ist der Anfang. Der eigentliche Hebel liegt darin, Sie und Ihr B\xFCro als feste Gr\xF6\xDFe in der Region sichtbar zu machen \u2014 ob etabliertes Maklerb\xFCro oder eigenst\xE4ndiger Makler.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '18px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))'
    }
  }, pillars.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.title,
    style: {
      background: 'rgba(243,238,229,0.07)',
      border: '1px solid rgba(243,238,229,0.16)',
      borderRadius: 'var(--radius-lg)',
      padding: '26px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-accent)',
      color: 'var(--color-on-accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    size: 21
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)',
      margin: '16px 0 8px'
    }
  }, p.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: 0
    }
  }, p.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: 'clamp(28px, 4vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '15px',
      color: 'var(--color-on-primary)',
      margin: 0,
      maxWidth: '46ch',
      lineHeight: 1.55
    }
  }, "Wir starten beim einzelnen Objekt \u2014 und bauen daraus Schritt f\xFCr Schritt Ihre Marke."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNav('anfrage')
  }, "Markenbildung besprechen"))));
}
function Usp() {
  const {
    Container,
    SectionHead
  } = window;
  const usps = [{
    n: '1',
    title: 'Alles aus einer Hand',
    text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff. alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.'
  }, {
    n: '2',
    title: 'Bewusst auf wenige Kunden begrenzt',
    text: 'Wir arbeiten gezielt mit wenigen Kunden gleichzeitig. So bleiben die Wege kurz und die Lieferung schnell. Jedes Objekt bekommt die volle Aufmerksamkeit.'
  }, {
    n: '3',
    title: 'Konsistenter, hochwertiger Look',
    text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht. Objekt für Objekt wiedererkennbar.'
  }, {
    n: '4',
    title: 'Gedacht aus Sicht der Zielgruppe',
    text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Was uns von anderen Anbietern unterscheidet",
    title: 'Alles aus einer Hand. Gedacht aus Sicht Ihrer Zielgruppe.'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))'
    }
  }, usps.map(u => /*#__PURE__*/React.createElement("div", {
    key: u.n,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-accent-tint)',
      color: 'var(--color-accent-deep)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px'
    }
  }, u.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '19px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '16px 0 8px'
    }
  }, u.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, u.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '26px',
      background: 'var(--color-accent-tint)',
      border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 1.6,
      color: 'var(--text-body)',
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--color-accent-deep)',
      fontWeight: 'var(--fw-body-bold)'
    }
  }, "Die Chance:"), ' ', "Nur rund 9 % der Makler produzieren objektspezifische Videos - in unserer Region noch weniger. Wer jetzt in gutes Bewegtbild investiert, hebt sich sichtbar vom Markt ab."))));
}
Object.assign(window, {
  Branding,
  Usp
});

/* Process (4 steps) + Portfolio (placeholders) + Offer (pilot) + About (Fabian). */

function Process() {
  const {
    Container,
    SectionHead
  } = window;
  const steps = [{
    n: '01',
    title: 'Kurzes Briefing',
    text: '10 Minuten am Telefon: Objekt, Ziel (Verkauf/Vermietung), Termin.'
  }, {
    n: '02',
    title: 'Ein Termin vor Ort',
    text: 'Fotos und Video in einem Durchgang. Sie müssen nicht dabei sein.'
  }, {
    n: '03',
    title: 'Konzipierter Schnitt',
    text: 'Geschnitten nach Konzept, nicht nach Schema.'
  }, {
    n: '04',
    title: 'Schnelle Lieferung',
    text: 'Sie erhalten Ihre finalen Fotos, Videos und Reels einsatzbereit für Portale, Exposé und Social Media.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "So l\xE4uft's ab",
    title: "In vier Schritten zum fertigen Objekt-Content."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
    }
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '34px',
      color: 'var(--color-accent)',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.text))))));
}
function Portfolio() {
  const {
    MediaFrame
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container,
    SectionHead
  } = window;
  const slots = ['Referenzobjekt 1 · Verkauf', 'Referenzobjekt 2 · Vermietung', 'Referenzobjekt 3 · Video + Bildstrecke'];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page",
    id: "portfolio"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Arbeitsproben",
    title: "Die ersten Referenzobjekte entstehen gerade.",
    lead: "Wir bauen unser regionales Portfolio auf. Wenn Sie ein passendes Objekt haben \u2014 zum Verkauf oder zur Vermietung \u2014 kann Ihr Objekt eines davon sein. Kostenlos. Wie das funktioniert, lesen Sie gleich."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '18px',
      marginTop: 'clamp(28px, 4vw, 40px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
    }
  }, slots.map(s => /*#__PURE__*/React.createElement(MediaFrame, {
    key: s,
    ratio: "16 / 10",
    radius: "lg",
    placeholderLabel: s
  })))));
}
function Offer({
  onNav
}) {
  const {
    Button
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const list = [{
    b: 'Was Sie bekommen:',
    t: ' komplette Produktion, konzipiertes Objektvideo (60–90 s) + vertikales Reel + bearbeitete Objektfotos. Für Verkauf oder Vermietung.'
  }, {
    b: 'Was wir dafür möchten:',
    t: ' Ihr Einverständnis, das Ergebnis als Referenz zeigen zu dürfen.'
  }, {
    b: 'Was nicht dahintersteckt:',
    t: ' kein Abo, keine versteckten Kosten, keine Verpflichtung.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '780px',
      margin: '0 auto',
      textAlign: 'center',
      background: 'var(--surface-card)',
      border: '1.5px solid var(--color-accent)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(32px, 5vw, 56px)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginBottom: '14px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      letterSpacing: '0.04em',
      color: 'var(--color-accent-deep)',
      background: 'var(--color-accent-tint)',
      border: '1px solid var(--color-accent)',
      padding: '7px 16px',
      borderRadius: 'var(--radius-pill)'
    }
  }, "Nur 3 Pilotpl\xE4tze in der Region"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: 0,
      textWrap: 'balance'
    }
  }, "Eine ehrliche Sache: Ich suche 3 Objekte f\xFCr mein Portfolio."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '16px auto 0',
      maxWidth: '60ch'
    }
  }, "Ich bin neu am Markt im Raum B\xFChl / Mittelbaden und baue mein Referenz-Portfolio auf. Statt Versprechen zu machen, zeige ich Ihnen lieber das Ergebnis \u2014 an einem Ihrer Objekte."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '24px 0',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Regul\xE4rer Wert: ", /*#__PURE__*/React.createElement("span", {
    style: {
      textDecoration: 'line-through'
    }
  }, "840 \u20AC")), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '26px',
      color: 'var(--status-success)'
    }
  }, "0 \u20AC"), /*#__PURE__*/React.createElement("span", null, "f\xFCr die ersten 3 Pilot-Objekte")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '12px',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'left'
    }
  }, list.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.b,
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: '2px',
      flex: 'none',
      color: 'var(--status-success)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: "var(--status-success)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 1.55,
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 'var(--fw-body-bold)',
      color: 'var(--text-strong)'
    }
  }, l.b), l.t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '28px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNav('anfrage')
  }, "Pilotplatz sichern (3 frei)")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--text-muted)',
      margin: '18px 0 0'
    }
  }, "Bewusst begrenzt \u2014 damit jedes Objekt die volle Aufmerksamkeit bekommt."))));
}
function About() {
  const {
    MediaFrame,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container
  } = window;
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'clamp(28px, 5vw, 48px)',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 0.82fr) minmax(0, 1.18fr)'
    },
    className: "mc-about-grid"
  }, /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "1 / 1",
    radius: "lg",
    placeholderLabel: "Portr\xE4tfoto \xB7 Platzhalter"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Dein Content-Partner"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Fabian [Nachname] \u2014 Foto, Video & strategischer Blick in einer Person."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-body)',
      margin: '18px 0 0'
    }
  }, "Ich verbinde zwei Dinge, die selten zusammenkommen: jahrelange Leidenschaft f\xFCr Foto und Video \u2014 und einen Hintergrund in E-Commerce, Marketing und strategischer Content-Planung."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '14px 0 0'
    }
  }, "Hei\xDFt f\xFCr Sie: Content mit Plan \u2014 abgestimmt auf Ihr Ziel, ob Verkauf, Vermietung oder der Aufbau Ihrer Marke. Ans\xE4ssig im Raum B\xFChl / Mittelbaden, mit kurzen Wegen zu Ihren Objekten.")))));
}
Object.assign(window, {
  Process,
  Portfolio,
  Offer,
  About
});

/* FAQ (accordion) + Contact form (success state) + Footer. */

function Faq() {
  const {
    Container,
    SectionHead,
    Icon
  } = window;
  const items = [{
    q: 'Lohnt sich das wirtschaftlich?',
    a: 'Die Zahlen sprechen dafür: Objekte mit Profi-Fotos verkaufen rund 32 % schneller, Inserate mit Video erhalten ein Vielfaches an Anfragen, und Ferienobjekte mit guten Fotos werden deutlich öfter gebucht. Schnellere Vermittlung und qualifiziertere Anfragen sparen Ihnen Zeit und Folgekosten. Der Content amortisiert sich meist über ein einziges Objekt.'
  }, {
    q: 'Erstellen Sie auch Content für Objekte zur Vermietung?',
    a: 'Ja. Neben Verkaufsobjekten produzieren wir gezielt Content für Miet- und Ferienobjekte (z. B. Airbnb/Booking). Dort wirkt guter Content auf Buchungsrate und erzielbaren Preis besonders stark.'
  }, {
    q: 'Warum gratis, wo ist der Haken?',
    a: 'Keiner. Ich baue mein Portfolio auf und brauche dafür echte Objekte in Top-Qualität. Sie bekommen das fertige Ergebnis, ich bekomme eine Referenz. Fairer Tausch.'
  }, {
    q: 'Was kostet es danach?',
    a: 'Nichts, solange Sie nichts weiter beauftragen. Möchten Sie weitere Objekte, liegt eine Einzelproduktion bei 320–1.590 € je nach Umfang; für regelmäßigen Objektfluss gibt es planbare Monatspakete. Völlig unverbindlich.'
  }, {
    q: 'Wie viel Zeit kostet mich das?',
    a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest mache ich.'
  }, {
    q: 'Wem gehören die Aufnahmen?',
    a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Ich darf das Ergebnis als Arbeitsprobe zeigen.'
  }];
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    align: "center",
    eyebrow: "H\xE4ufige Fragen",
    title: "Bevor Sie anfragen."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '820px',
      margin: 'clamp(28px, 4vw, 40px) auto 0',
      display: 'grid',
      gap: '12px'
    }
  }, items.map((it, i) => {
    const isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'var(--surface-card)',
        border: '1px solid',
        borderColor: isOpen ? 'var(--color-accent)' : 'var(--border-hair)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'border-color var(--dur-fast) var(--ease-soft)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '18px 22px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-bold)',
        fontSize: '16px',
        color: 'var(--text-strong)'
      }
    }, /*#__PURE__*/React.createElement("span", null, it.q), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        color: 'var(--color-accent)',
        transform: isOpen ? 'rotate(45deg)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 20,
      color: "var(--color-accent)"
    }))), isOpen && /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: '14.5px',
        lineHeight: 'var(--lh-normal)',
        color: 'var(--text-muted)',
        margin: 0,
        padding: '0 22px 20px'
      }
    }, it.a));
  }))));
}
function encodeFormData(data) {
  return Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
}
function ContactForm() {
  const {
    Input,
    Textarea,
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const [sent, setSent] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    const data = Object.fromEntries(new FormData(e.target).entries());
    fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: encodeFormData(data)
    }).then(res => {
      if (!res.ok) throw new Error('submit failed');
      setSent(true);
    }).catch(() => setSubmitError(true)).finally(() => setSubmitting(false));
  };
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    id: "anfrage",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: '60ch',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Jetzt anfragen"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Sichern Sie sich einen der 3 Pilotpl\xE4tze."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '14px auto 0'
    }
  }, "Kurz Ihre Eckdaten \u2014 ich melde mich innerhalb von 24 Stunden mit einem Terminvorschlag.")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '580px',
      margin: 'clamp(28px, 4vw, 40px) auto 0',
      background: 'var(--bg-page)',
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(28px, 4vw, 38px)',
      boxShadow: 'var(--shadow-md)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '14px',
      padding: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '54px',
      height: '54px',
      borderRadius: '50%',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 28,
    color: "var(--color-primary)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '23px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Danke \u2014 ich melde mich."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0,
      maxWidth: '44ch'
    }
  }, "Ihre Anfrage ist angekommen. Sie h\xF6ren innerhalb von 24 Stunden von mir \u2014 mit einem Terminvorschlag f\xFCr Ihr Pilot-Objekt."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    onClick: () => setSent(false)
  }, "Weitere Anfrage")) : /*#__PURE__*/React.createElement("form", {
    name: "kontakt",
    onSubmit: handleSubmit,
    "data-netlify-honeypot": "bot-field",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "form-name",
    value: "kontakt"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "bot-field",
    tabIndex: "-1",
    autoComplete: "off",
    style: {
      position: 'absolute',
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0
    },
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Ihr Name",
    name: "name",
    placeholder: "Vor- und Nachname",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "E-Mail",
    name: "email",
    type: "email",
    placeholder: "ihre@email.de",
    required: true
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Nachricht",
    name: "nachricht",
    rows: 4,
    placeholder: "Kurz zu Ihrem Objekt und Anliegen",
    required: true
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    disabled: submitting,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    style: {
      width: '100%'
    }
  }, submitting ? 'Wird gesendet …' : 'Gratis-Pilot anfragen'), submitError && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--status-danger)',
      textAlign: 'center',
      margin: 0
    }
  }, "Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie direkt an", ' ', /*#__PURE__*/React.createElement("a", {
    href: "mailto:fabian.schneebiegl@gmail.com",
    style: {
      color: 'var(--status-danger)'
    }
  }, "fabian.schneebiegl@gmail.com"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      margin: '4px 0 0',
      lineHeight: 1.5
    }
  }, "Ihre Angaben werden ausschlie\xDFlich zur Kontaktaufnahme genutzt. Mehr dazu in der", ' ', /*#__PURE__*/React.createElement("a", {
    href: "/ui_kits/onepager/datenschutz.html",
    style: {
      color: 'var(--text-muted)',
      textDecoration: 'underline'
    }
  }, "Datenschutzerkl\xE4rung"), ".")))));
}
function SiteFooter({
  onNav
}) {
  const {
    Logo,
    Divider
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container
  } = window;
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      padding: 'clamp(44px, 6vw, 64px) var(--container-pad) 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '24px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '42ch'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "md",
    onDark: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: '16px 0 0'
    }
  }, "Fabian Schneebiegl \xB7 Foto- & Videoproduktion f\xFCr Immobilien \xB7 Verkauf & Vermietung \xB7 Raum B\xFChl \xB7 Mittelbaden \xB7 Ortenau")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--color-on-primary)',
      lineHeight: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: 0.86
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "mailto:fabian.schneebiegl@gmail.com",
    style: {
      color: 'inherit',
      textDecoration: 'none'
    }
  }, "fabian.schneebiegl@gmail.com")), /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: 0.86
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "tel:+4915904692843",
    style: {
      color: 'inherit',
      textDecoration: 'none'
    }
  }, "0159 0469 2843")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/ui_kits/onepager/impressum.html",
    style: {
      color: 'var(--color-secondary)',
      textDecoration: 'none'
    }
  }, "Impressum"), /*#__PURE__*/React.createElement("a", {
    href: "/ui_kits/onepager/datenschutz.html",
    style: {
      color: 'var(--color-secondary)',
      textDecoration: 'none'
    }
  }, "Datenschutz")))), /*#__PURE__*/React.createElement(Divider, {
    style: {
      background: 'rgba(243,238,229,0.16)',
      margin: '28px 0 0'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--color-secondary)',
      margin: '20px 0 0'
    }
  }, "\xA9 2026 \xB7 Markenname & Logo sind Platzhalter und werden sp\xE4ter ersetzt.")));
}
Object.assign(window, {
  Faq,
  ContactForm,
  SiteFooter
});
function App() {
  const onNav = id => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 64,
      behavior: 'smooth'
    });
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement("main", null, /*#__PURE__*/React.createElement(Hero, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(StatBar, null), /*#__PURE__*/React.createElement(Benefits, null), /*#__PURE__*/React.createElement(Segments, null), /*#__PURE__*/React.createElement(Branding, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(Usp, null), /*#__PURE__*/React.createElement(Process, null), /*#__PURE__*/React.createElement(Portfolio, null), /*#__PURE__*/React.createElement(Offer, {
    onNav: onNav
  }), /*#__PURE__*/React.createElement(About, null), /*#__PURE__*/React.createElement(Faq, null), /*#__PURE__*/React.createElement(ContactForm, null)), /*#__PURE__*/React.createElement(SiteFooter, {
    onNav: onNav
  }));
}
function mountOnePager() {
  if (!window.MaklerContentDesignSystem_a211b6) {
    setTimeout(mountOnePager, 30);
    return;
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
  if (window.lucide) window.lucide.createIcons();
}
mountOnePager();
