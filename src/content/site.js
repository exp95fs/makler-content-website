/**
 * Zentrale Inhalts- und Preisdatei für die Quadratblick-Website.
 *
 * Hier wird gepflegt: Preise, Leistungsnamen, Beschreibungen, Bildpfade.
 * Keine Preise oder Leistungstexte direkt in Komponenten schreiben.
 *
 * Alle Beträge sind NETTO-Preise in Euro, zzgl. gesetzlicher USt.
 */

/* ------------------------------------------------------------------ *
 * Basis-URL der Produktionsdomain
 *
 * Canonicals, Open Graph, Sitemap und JSON-LD bauen hierauf auf.
 * Die Produktion läuft auf der Domain OHNE www: https://quadratblick.de/
 * liefert 200, https://www.quadratblick.de/ leitet per 301 dorthin um.
 * Canonicals müssen auf die tatsächlich ausgelieferte 200-URL zeigen.
 * Wird die primäre Domain in Netlify auf www umgestellt, hier ändern.
 * ------------------------------------------------------------------ */
export const SITE_URL = 'https://quadratblick.de';

/* ------------------------------------------------------------------ *
 * Bilder
 * Jeder Platzhalter mit erwartetem Format. Beim Austausch das
 * Seitenverhältnis einhalten, sonst springt das Layout.
 * ------------------------------------------------------------------ */
export const images = {
  // 16:9, 2400 px. Außenaufnahme aus einer Objektproduktion.
  hero: '/images/hero/hero.jpg',
  // 4:5 Hochformat, min. 1200 px. PLATZHALTER: Porträt Fabian.
  portrait: '/images/portrait/portrait.jpg',
  // Logos regionaler Immobilienanbieter, für die Aufnahmen entstanden sind.
  // Alt-Texte entsprechen dem, was im Logo selbst steht. Alle vier Logos
  // von Fabian zur Anzeige freigegeben.
  logos: [
    { src: '/images/logos/kunde-01.png', alt: 'Sparkasse Bühl ImmobilienCenter' },
    { src: '/images/logos/kunde-02.png', alt: 'Bemmann Immobilien' },
    { src: '/images/logos/kunde-03.png', alt: 'Kasper & Neininger Manufaktur-Haus' },
    { src: '/images/logos/kunde-04.png', alt: 'Arkade-Immobilien Baden-Baden' },
  ],
  // Bildstrecke im Leistungsversprechen: ein Hauptbild und zwei kleinere,
  // versetzt darüber gelegt. Indizes in `referenzen`, von Fabian gewählt
  // (Bild 1 groß, Bild 2 rechts, Bild 3 unten), alle aus Objekt 2.
  strecke: {
    label: 'Beispiel-Bildstrecke',
    bilder: [22, 16, 15],
  },
  // Referenzaufnahmen, 3:2, 1800 px. Auswahl und Reihenfolge der Startseite
  // stehen in `referenzAuswahl`.
  referenzen: [
    { src: '/images/referenzen/ref-01.jpg', alt: 'Wohnküche mit Kochinsel und dunkler Küchenfront' },
    { src: '/images/referenzen/ref-02.jpg', alt: 'Küchenzeile mit Barhockern und Blick in den Wohnbereich' },
    { src: '/images/referenzen/ref-03.jpg', alt: 'Offener Wohn- und Essbereich mit angrenzender Küche' },
    { src: '/images/referenzen/ref-04.jpg', alt: 'Küche im Obergeschoss mit Dachfenstern' },
    { src: '/images/referenzen/ref-05.jpg', alt: 'Essbereich im Obergeschoss mit Holzbalkendecke' },
    { src: '/images/referenzen/ref-06.jpg', alt: 'Leerer Wohnraum im Dachgeschoss mit offener Küchenzeile' },
    { src: '/images/referenzen/ref-07.jpg', alt: 'Essplatz vor einer verglasten Zimmertür' },
    { src: '/images/referenzen/ref-08.jpg', alt: 'Badezimmer mit Doppelwaschtisch und Badewanne' },
    { src: '/images/referenzen/ref-09.jpg', alt: 'Küchenzeile in einem leeren Dachgeschossraum' },
    { src: '/images/referenzen/ref-10.jpg', alt: 'Leerer Dachgeschossraum mit freigelegtem Dachstuhl' },
    { src: '/images/referenzen/ref-11.jpg', alt: 'Dachgeschossraum mit Sprossenfenster und weißem Dachstuhl' },
    { src: '/images/referenzen/ref-12.jpg', alt: 'Schlafzimmer mit Fenster, Gardinen und Schreibtisch' },
    { src: '/images/referenzen/ref-13.jpg', alt: 'Badezimmer mit Badewanne und Dachfenster' },
    { src: '/images/referenzen/ref-14.jpg', alt: 'Zimmer mit Bett, Essplatz und Dachschräge' },
    { src: '/images/referenzen/ref-15.jpg', alt: 'Überdachte Terrasse mit Sitzbank und Blick ins Grüne' },
    { src: '/images/referenzen/ref-16.jpg', alt: 'Küche mit grünen Fronten und Holzverkleidung' },
    { src: '/images/referenzen/ref-17.jpg', alt: 'Schlafzimmer mit Einbauschrank und Holzwand' },
    { src: '/images/referenzen/ref-18.jpg', alt: 'Wohnbereich mit Sofa, Essplatz und Terrassenzugang' },
    { src: '/images/referenzen/ref-19.jpg', alt: 'Badezimmer mit Dusche, WC und dunklem Fliesenboden' },
    { src: '/images/referenzen/ref-20.jpg', alt: 'Leerer Wohnraum mit Küchenblock und Fenster' },
    { src: '/images/referenzen/ref-21.jpg', alt: 'Mehrfamilienhaus mit Carport und begrüntem Außenbereich' },
    { src: '/images/referenzen/ref-22.jpg', alt: 'Wohn- und Essbereich in einem Holzhaus mit Galerie und Fensterfront' },
    { src: '/images/referenzen/ref-23.jpg', alt: 'Essplatz mit Eckbank, Wurzelholzkonsole und Balkontür' },
  ],
};

/**
 * Auswahl für die Arbeitsproben auf der Startseite: nicht nach Objekt
 * gruppiert, sondern abwechselnd aus verschiedenen Objekten, damit schon die
 * ersten Aufnahmen unterschiedliche Räume und Stile zeigen. Indizes in
 * `images.referenzen`; die erste Aufnahme steht im Mosaik groß.
 */
export const referenzAuswahl = [
  // Erste Ansicht, von Fabian gewählt: groß die Außenansicht, dazu vier klein
  20, 11, 21, 6, 3,
  17, 4, 10, 13,
  15, 0, 12, 9,
  2, 14, 22, 5,
  16, 8, 1, 19,
  18, 7,
];

/* ------------------------------------------------------------------ *
 * Foto-Objektklassen
 *
 * Jede Klasse erhält dieselbe professionelle Qualitätszusage. Die Klasse
 * schützt den Produktionsaufwand, nicht die Bildqualität. Keine Trennung
 * in Basis- und Premiumqualität.
 *
 * `stunden` steuert nur die Terminplanung im Buchungsworkflow.
 * ------------------------------------------------------------------ */
export const fotoklassen = [
  {
    key: 'wohnung',
    name: 'Wohnung',
    beschreibung: 'Eine Wohnung innerhalb eines Mehrparteiengebäudes.',
    bilder: 'ca. 15 bis 20 Bilder',
    foto: 350,
    stunden: 2,
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    bilder: 'ca. 20 bis 30 Bilder',
    foto: 450,
    stunden: 3,
  },
  {
    key: 'mehrfamilienhaus',
    name: 'Mehrfamilienhaus',
    kurz: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    bilder: 'ca. 30 bis 45 Bilder',
    foto: 550,
    stunden: 4,
  },
  {
    // Kein Festpreis ab Werk: nach kurzer Prüfung nennen wir vorab einen
    // Festpreis. Ohne `foto` gibt es keine Summe; ohne `stunden` springt
    // die Terminwahl auf die persönliche Abstimmung.
    key: 'individuell',
    name: 'Größeres oder besonderes Objekt',
    beschreibung: 'Zum Beispiel ab vier Wohneinheiten, Gewerbe, mehrere Gebäude oder sehr große Grundstücke.',
    foto: null,
    aufAnfrage: true,
  },
];

/**
 * Was der Festpreis umfasst und was nach Absprache dazukommt. Steht unter
 * den Preiskacheln und (Zusatz) als FAQ-Antwort.
 */
export const festpreisUmfang = {
  enthalten: {
    t: 'Im Festpreis enthalten',
    x: 'Termin vor Ort mit Innen- und Außenaufnahmen, Bildauswahl, Standardbearbeitung und digitale Bereitstellung.',
  },
  zusaetzlich: {
    t: 'Nach Absprache zusätzlich',
    x: 'Wünsche, die über die Standardbearbeitung hinausgehen, etwa virtuelles Home Staging, das Entfernen von Gegenständen oder aufwendigere Retuschen, sowie Mehraufwand vor Ort, wenn ein Objekt nicht vorbereitet ist. Diesen Aufwand stimmen wir vorher mit Ihnen ab und berechnen ihn nach Zeit.',
  },
};

/** Texte für die Klasse ohne Festpreis ab Werk. */
export const aufAnfrage = {
  preis: 'auf Anfrage',
  summe: 'Preis nach Prüfung',
  zeile: 'Preis auf Anfrage – nach kurzer Prüfung erhalten Sie vorab einen Festpreis.',
};

/**
 * Der Ablauf einer Produktion in sechs Schritten, wie im bisherigen
 * Onepager. Alle Texte bewusst gleich lang (Überschrift und zwei Zeilen
 * auf dem Desktop), damit die Abstände gleich bleiben. Eigentümerkontakt
 * überall mit demselben Satz: nur auf Wunsch, kein Standard. Kein
 * zugesagter Liefertermin.
 *
 * TODO: Angabe durch Fabian bestätigen - die technischen Angaben in 04
 * und 05 (Belichtungsreihen, manuelles Blending, Ausblicksoptimierung)
 * beschreiben den dokumentierten HDR-Workflow. Bitte gegenprüfen, damit
 * nichts zugesagt wird, was nicht immer gilt.
 */
export const ablauf = [
  { t: 'Anfrage', x: 'Sie nennen uns Objekt, Objektklasse und Ihren Wunschtermin. Wir bestätigen Umfang, Preis und Termin persönlich.' },
  { t: 'Terminabstimmung', x: 'Den Aufnahmetermin legen wir gemeinsam mit Ihnen fest. Auf Wunsch stimmen wir den Termin direkt mit dem Eigentümer ab.' },
  { t: 'Checkliste zur Vorbereitung', x: 'Vorab erhalten Sie eine verständliche Anleitung, auf Wunsch auch für den Eigentümer. So hält vor Ort nichts auf.' },
  { t: 'Aufnahmen vor Ort', x: 'Innen, außen und Nebenräume. Belichtungsreihen je Raum, abgestimmt auf Tageslicht, Raumtiefe und Fensterausblick.' },
  { t: 'High-End-Postproduktion', x: 'Manuelles Blending der Belichtungsreihen, Optimierung der Fensterausblicke, Farb- und Kontrastabstimmung je Bild.' },
  { t: 'Digitale Bereitstellung', x: 'Die fertigen Aufnahmen erhalten Sie zum vereinbarten Zeitpunkt, einsatzfertig für Exposé, Portale und Ihre Kanäle.' },
];

/* ------------------------------------------------------------------ *
 * Zusatzleistungen
 *
 * Im Anfrage-Wizard direkt wählbar: Drohnenaufnahmen (130 € netto) und
 * das Objekt-Kurzvideo (390 € netto), Preise nach Vorgabe von Fabian.
 * `note` ist der Text hinter dem Infobutton. Das Video heißt überall
 * "Objekt-Kurzvideo" (keine anderen Bezeichnungen).
 *
 * KONFLIKT zur Knowledge Base: dort steht der Arbeitspreis für
 * Drohnenfotos bei +170 €. Hier 130 € nach ausdrücklicher Vorgabe.
 * ------------------------------------------------------------------ */
export const ergaenzungen = [
  {
    key: 'drohne',
    name: 'Drohnenaufnahmen',
    preis: 130,
    stunden: 1,
    kurz: 'Luftaufnahmen von Objekt, Grundstück und Umgebung, sofern am Objekt zulässig und witterungsbedingt möglich.',
    note: 'Luftaufnahmen von Immobilie, Grundstück und Umgebung. Möglich, sofern am Objekt '
      + 'rechtlich zulässig und witterungsbedingt durchführbar – das klären wir vor dem Termin.',
  },
  {
    key: 'kurzvideo',
    name: 'Objekt-Kurzvideo',
    preis: 390,
    stunden: 2,
    kurz: 'Walk-through durch die Immobilie in 4K, im Hoch- oder Querformat, für Exposé, Website und Social Media.',
    note: 'Ein professionell produzierter Walk-through durch die Immobilie, der Raumgefühl und '
      + 'Atmosphäre authentisch vermittelt. In 4K, im Hoch- oder Querformat, für Exposé, Website '
      + 'und Social Media.',
  },
];

/* ------------------------------------------------------------------ *
 * Die zwei Wege zur Anfrage. Überall dieselben Bezeichnungen:
 * "Termin anfragen" führt zum Konfigurator (#booking), "Unverbindlich
 * anfragen" zum Kontaktformular (#kontakt).
 * ------------------------------------------------------------------ */
export const CTA = {
  termin: 'Termin anfragen',
  kontakt: 'Unverbindlich anfragen',
};

/**
 * Pflichtauswahl "Anliegen" im Kontaktformular. Übertragen wird das Label
 * im Feld `anliegen` (gleicher Feldname im statischen Formular in
 * index.html). `regelmaessig` wird aus #zusammenarbeit vorausgewählt.
 */
export const anliegenOptionen = [
  { key: 'einzeln', label: 'Einzelnes Objekt' },
  { key: 'regelmaessig', label: 'Regelmäßig mehrere Objekte' },
  { key: 'sonstiges', label: 'Sonstiges' },
];

/* ------------------------------------------------------------------ *
 * Regelmäßige Zusammenarbeit (Sektion #zusammenarbeit)
 *
 * Bewusst ohne Prozentzahlen, Rabattversprechen, Kundennamen und ohne
 * Begriffe wie Retainer, Kontingent oder Paketpreis. Konditionen werden
 * persönlich besprochen.
 * ------------------------------------------------------------------ */
export const zusammenarbeit = {
  eyebrow: 'Für Maklerbüros und Immobilienabteilungen',
  titel: 'Mehrere Objekte im Jahr? Ein Ablauf für alle.',
  lead: 'Wenn Ihr Büro regelmäßig Objekte vermarktet, stimmen wir Ablauf, Ansprechpartner, '
    + 'Vorbereitung und Freigaben einmal gemeinsam ab. Danach läuft jedes neue Objekt nach '
    + 'demselben Muster.',
  punkte: [
    { t: 'Einmal abgestimmt', x: 'Checkliste, Bildstil und Freigabeweg legen wir zu Beginn fest. Jedes weitere Objekt braucht nur noch Adresse und Wunschtermin.' },
    { t: 'Ein fester Ansprechpartner', x: 'Sie sprechen immer mit derselben Person, die Ihre Objekte und Abläufe kennt.' },
    { t: 'Termine bündeln', x: 'Mehrere Objekte in der Nähe fotografieren wir auf Wunsch am selben Tag.' },
    { t: 'Einheitlicher Auftritt', x: 'Alle Objekte erscheinen in derselben Bildsprache, im Portal wie auf Ihrer Website.' },
  ],
  startTitel: 'So starten wir',
  start: [
    'Kurzes Gespräch über Objektzahl und Objektarten',
    'Erstes Objekt zum regulären Festpreis',
    'Ablauf festhalten und Konditionen für die regelmäßige Zusammenarbeit besprechen',
  ],
  // Vorauswahl im Kontaktformular (Schlüssel aus `anliegen`)
  anliegen: 'regelmaessig',
};

/* ------------------------------------------------------------------ *
 * Kontakt
 * ------------------------------------------------------------------ */
export const kontakt = {
  email: 'info@quadratblick.de',
  telefon: '0159 0469 2843',
  telefonHref: 'tel:+4915904692843',
  instagram: 'https://www.instagram.com/quadratblick_de',
  instagramHandle: '@quadratblick_de',
  region: 'Bühl · Baden-Baden · Achern und Umgebung',
};

/* ------------------------------------------------------------------ *
 * Preisangaben
 *
 * Kalkuliert wird netto; "350 € netto" ist die Hauptangabe. Weil sich das
 * Angebot nicht mehr ausschließlich an Unternehmer richtet, sondern auch
 * an Privatpersonen (etwa beim Verkauf ohne Makler), steht zu jedem Preis
 * auch der Bruttopreis inkl. 19 % USt. (Preisangabenverordnung: gegenüber
 * Verbrauchern ist der Gesamtpreis anzugeben).
 * TODO: Darstellung vor dem Live-Gang rechtlich prüfen lassen.
 * ------------------------------------------------------------------ */

/** Umsatzsteuersatz, derzeit 19 %. */
export const UST = 0.19;

/*
 * Alle Helfer sind null-sicher: ohne Betrag (Klasse "auf Anfrage") liefern
 * sie "auf Anfrage" bzw. null statt einer Summe oder "NaN".
 */
const ohneBetrag = (n) => n === null || n === undefined || Number.isNaN(n);

/** Betrag formatieren, ohne Zusatz. Cent nur, wenn nötig. */
export const preis = (n) => (ohneBetrag(n) ? aufAnfrage.preis : n.toLocaleString('de-DE', {
  minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2,
}) + '\u00A0€');

/** Bruttobetrag, auf den Cent gerundet. */
export const brutto = (n) => (ohneBetrag(n) ? null : Math.round(n * (1 + UST) * 100) / 100);

/** Betrag mit Nettozusatz, überall dort wo ein Preis genannt wird. */
export const preisNetto = (n) => (ohneBetrag(n) ? aufAnfrage.preis : preis(n) + '\u00A0netto');

/** Bruttoangabe als Text: "416,50 € inkl. USt." */
export const preisBrutto = (n) => (ohneBetrag(n) ? '' : preis(brutto(n)) + '\u00A0inkl.\u00A0USt.');

/** Netto mit Brutto in Klammern, für Fließtext. */
export const preisVoll = (n) => (ohneBetrag(n) ? aufAnfrage.preis : `${preisNetto(n)} (${preisBrutto(n)})`);

/** Kleinster Festpreis der Objektklassen (ohne "auf Anfrage"), für "ab"-Angaben. */
export const abPreis = () => Math.min(...fotoklassen.filter((k) => !k.aufAnfrage).map((k) => k.foto));

/** Vollständiger Hinweis, steht im Footer. */
export const preishinweisVoll = 'Alle Preise sind Nettopreise in Euro und verstehen sich zuzüglich '
  + 'der gesetzlichen Umsatzsteuer von derzeit 19 %. Die Bruttopreise inklusive Umsatzsteuer '
  + 'sind jeweils mit angegeben.';

/* ------------------------------------------------------------------ *
 * Kennzahlen unter dem Hero
 *
 * Werbung mit Statistiken muss belegbar und die Quelle konkret auffindbar
 * sein (§ 5 UWG). Deshalb nur noch ein Studienwert mit exakter Quelle,
 * die übrigen Zellen sind eigene, überprüfbare Angaben.
 *
 * Quelle der 32 %: VHT Studios, Pressemitteilung "Professional Real
 * Estate Photography Sells Homes 32% Faster" vom 2. September 2014 (PR
 * Newswire, prnewswire.com/news-releases/professional-real-estate-
 * photography-sells-homes-32-faster-273534171.html): Auswertung der 2013
 * im Raum Chicago verkauften Häuser, 89 statt 123 Tage am Markt.
 *
 * `wert` (Zahl) zählt beim ersten Sichtkontakt hoch, `text` steht fest.
 * Beide Varianten stehen mit dem Zielwert im vorgerenderten HTML.
 * ------------------------------------------------------------------ */
export const kennzahlen = [
  { wert: 32, suffix: '\u00A0%*', label: 'schneller verkauft mit Profi-Fotos' },
  { text: `ab ${preis(abPreis())}`, label: 'netto, Festpreis nach Objektklasse' },
  { text: '1 Termin', label: 'für Fotos, Drohne und Kurzvideo' },
  { text: '3–5 Werktage', label: 'bis zur Bereitstellung, in der Regel' },
];

/** Quellenangabe zum Sternchen, steht im Kennzahlenband und im Leistungsversprechen. */
export const kennzahlenQuelle = '* VHT Studios (Pressemitteilung vom 2. September 2014), Auswertung der '
  + '2013 im Raum Chicago (USA) verkauften Häuser: professionell fotografierte Objekte waren im '
  + 'Schnitt 89 statt 123 Tage am Markt.';
