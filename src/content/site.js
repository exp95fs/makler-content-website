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
  hero: '/images/hero/hero-wohnbereich.jpg',
  // Hero im Hochformat (Handy): die Innenaufnahme zeigt dort nur Decke und Vorhang
  heroHochformat: '/images/hero/hero.jpg',
  // 4:5 Hochformat, min. 1200 px. PLATZHALTER: Porträt Fabian.
  portrait: '/images/portrait/portrait.jpg',
  // Logos von Kunden aus der Region, für die Aufnahmen entstanden sind.
  // Alt-Texte entsprechen dem, was im Logo selbst steht. Alle Logos von
  // Fabian zur Anzeige freigegeben. Gleicher 7:3-Canvas, gleiche sichtbare
  // Fläche. kunde-05 liegt auf 553 x 237 statt 420 x 180, damit das
  // Original (Header-PNG der Website, 474 px Logobreite) ohne Skalierung
  // übernommen ist. Nicht mit den Beispiel-Inseraten verknüpfen.
  logos: [
    { src: '/images/logos/kunde-01.png', alt: 'Sparkasse Bühl ImmobilienCenter' },
    { src: '/images/logos/kunde-02.png', alt: 'Bemmann Immobilien' },
    { src: '/images/logos/kunde-03.png', alt: 'Kasper & Neininger Manufaktur-Haus' },
    { src: '/images/logos/kunde-04.png', alt: 'Arkade-Immobilien Baden-Baden' },
    { src: '/images/logos/kunde-05.png', alt: 'Schwarzwaldschick' },
  ],
  // Bildstrecke im Leistungsversprechen: ein Hauptbild und zwei kleinere,
  // versetzt darüber gelegt, von Fabian gewählt (Bild 1 groß, Bild 2
  // rechts, Bild 3 unten). 3:2, 1800 px.
  strecke: {
    label: 'Beispiel-Bildstrecke',
    bilder: [
      { src: '/images/referenzen/ref-23.jpg', alt: 'Essplatz mit Eckbank, Wurzelholzkonsole und Balkontür' },
      { src: '/images/referenzen/ref-17.jpg', alt: 'Schlafzimmer mit Einbauschrank und Holzwand' },
      { src: '/images/referenzen/ref-16.jpg', alt: 'Küche mit grünen Fronten und Holzverkleidung' },
    ],
  },
};

// Die Beispiel-Inserate (Referenz-Sektion) kommen nicht von hier, sondern
// aus src/content/beispiele.json, erzeugt von scripts/referenzen.py.

/* ------------------------------------------------------------------ *
 * Kennzahlen unter dem Hero
 * Werte und Quellenhinweis wörtlich wie im bisherigen Onepager, auf
 * ausdrücklichen Wunsch von Fabian wieder eingesetzt. Das kurze erste
 * Label ist bewusst zweizeilig (\n), damit alle vier Zellen gleich
 * gefüllt sind und Zahl und Label in jeder Zelle mittig sitzen.
 * TODO: Angabe durch Fabian bestätigen - Primärquellen der Werte
 * dokumentieren (KB: keine Wirkungsclaims ohne verifizierbare Quelle).
 * ------------------------------------------------------------------ */
export const kennzahlen = [
  { wert: 403, prefix: '+', suffix: ' %', label: 'mehr Anfragen\nmit Video' },
  { wert: 32, prefix: '~', suffix: ' %', label: 'schnellere Vermittlung mit Profi-Fotos' },
  { wert: 73, prefix: '', suffix: ' %', label: 'der Verkäufer bevorzugen Makler, die Video nutzen' },
  { wert: 9, prefix: 'nur ', suffix: ' %', label: 'der Makler machen objektspezifische Videos' },
];

export const kennzahlenQuelle = 'Quellen: NAR, Redfin/VHT, Branchenstudien (überwiegend international). '
  + 'Die Größenordnung ist auf den deutschen Markt übertragbar, in dem Video noch kaum genutzt wird.';

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
    // Listing, das "Beispiel ansehen" auf der Preiskachel öffnet
    beispiel: 'wohnung-lauf',
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    bilder: 'ca. 20 bis 30 Bilder',
    foto: 450,
    stunden: 3,
    beispiel: 'einfamilienhaus-huegelsheim',
  },
  {
    key: 'mehrfamilienhaus',
    // Schlüssel dieser Klasse im Referenz-Manifest (Beispiel-Inserate)
    manifestKlasse: 'mehrparteienhaus',
    name: 'Mehrfamilienhaus',
    kurz: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    bilder: 'ca. 30 bis 45 Bilder',
    foto: 550,
    stunden: 4,
    beispiel: 'mehrparteienhaus-buehlertal',
  },
];

/**
 * Der Ablauf einer Produktion in sechs Schritten, wie im bisherigen
 * Onepager. Alle Texte bewusst gleich lang (Überschrift und zwei Zeilen
 * auf dem Desktop), damit die Abstände gleich bleiben. Korrigiert: keine
 * Eigentümerkoordination als Standard (erst bei eingespielter
 * Zusammenarbeit und auf Wunsch), kein zugesagter Liefertermin.
 *
 * TODO: Angabe durch Fabian bestätigen - die technischen Angaben in 04
 * und 05 (Belichtungsreihen, manuelles Blending, Ausblicksoptimierung)
 * beschreiben den dokumentierten HDR-Workflow. Bitte gegenprüfen, damit
 * nichts zugesagt wird, was nicht immer gilt.
 */
export const ablauf = [
  { t: 'Anfrage', x: 'Sie nennen uns Objekt, Objektklasse und Ihren Wunschtermin. Wir bestätigen Umfang, Preis und Termin persönlich.' },
  { t: 'Terminabstimmung', x: 'Den Aufnahmetermin stimmen wir mit Ihnen ab. Optional übernehmen wir die Abstimmung direkt mit dem Eigentümer.' },
  { t: 'Checkliste zur Vorbereitung', x: 'Vorab erhalten Sie eine verständliche Anleitung, auf Wunsch auch für den Eigentümer. So hält vor Ort nichts auf.' },
  { t: 'Aufnahmen vor Ort', x: 'Alle Räume inkl. Keller, Nebenräume und Außenanlagen. Belichtungsreihen je Raum, abgestimmt auf Licht und Ausblick.' },
  { t: 'High-End-Postproduktion', x: 'Manuelles Blending der Belichtungsreihen, Optimierung der Fensterausblicke, Farb- und Kontrastabstimmung je Bild.' },
  { t: 'Digitale Bereitstellung', x: 'Die fertigen Aufnahmen erhalten Sie zum vereinbarten Zeitpunkt, einsatzfertig für Exposé, Portale und Ihre Kanäle.' },
];

/* ------------------------------------------------------------------ *
 * Zusatzleistungen
 *
 * Im Anfrage-Wizard direkt wählbar: Drohnenaufnahmen (130 € netto) und
 * das Objekt-Kurzvideo (390 € netto), Preise nach Vorgabe von Fabian.
 * `note` ist der Text hinter dem Infobutton.
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
    kurz: 'Rundgang in 4K, im Hoch- oder Querformat, für Exposé, Website und Social Media.',
    note: 'Ein professionell produzierter Rundgang, der Raumgefühl und Atmosphäre authentisch '
      + 'vermittelt. Ideal für Exposé, Website und Social Media – in 4K sowie im Hoch- oder Querformat.',
  },
];

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

/** Betrag formatieren, ohne Zusatz. Cent nur, wenn nötig. */
export const preis = (n) => n.toLocaleString('de-DE', {
  minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2,
}) + '\u00A0€';

/** Bruttobetrag, auf den Cent gerundet. */
export const brutto = (n) => Math.round(n * (1 + UST) * 100) / 100;

/** Betrag mit Nettozusatz, überall dort wo ein Preis genannt wird. */
export const preisNetto = (n) => preis(n) + '\u00A0netto';

/** Bruttoangabe als Text: "416,50 € inkl. USt." */
export const preisBrutto = (n) => preis(brutto(n)) + '\u00A0inkl.\u00A0USt.';

/** Netto mit Brutto in Klammern, für Fließtext. */
export const preisVoll = (n) => `${preisNetto(n)} (${preisBrutto(n)})`;

/** Vollständiger Hinweis, steht im Footer. */
export const preishinweisVoll = 'Alle Preise sind Nettopreise in Euro und verstehen sich zuzüglich '
  + 'der gesetzlichen Umsatzsteuer von derzeit 19 %. Die Bruttopreise inklusive Umsatzsteuer '
  + 'sind jeweils mit angegeben.';
