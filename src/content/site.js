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
  // Alt-Texte entsprechen dem, was im Logo selbst steht.
  // Nur Logos mit belegtem Namen. kunde-04.png bleibt als Datei erhalten,
  // wird aber nicht gezeigt, solange der Name nicht bestätigt ist.
  // TODO: Angabe durch Fabian bestätigen (Name zu kunde-04.png).
  logos: [
    { src: '/images/logos/kunde-01.png', alt: 'Sparkasse Bühl ImmobilienCenter' },
    { src: '/images/logos/kunde-02.png', alt: 'Bemmann Immobilien' },
    { src: '/images/logos/kunde-03.png', alt: 'Kasper & Neininger Manufaktur-Haus' },
  ],
  // Bildstrecke für den Teaser in der Leistungssektion: ein Hauptbild und
  // zwei kleinere, versetzt darüber gelegt. Alle drei liegen Richtung
  // Querformat, damit beim Zuschnitt möglichst wenig verloren geht.
  //
  // TODO: Angabe durch Fabian bestätigen - die drei Aufnahmen sind eine
  // Auswahl. Für ein echtes Beispielinserat drei Bilder aus derselben
  // Produktion einsetzen.
  inserat: {
    label: 'Beispiel-Bildstrecke',
    bilder: [
      { src: '/images/inserate/inserat-2-aussen.jpg', alt: 'Außenansicht eines Mehrfamilienhauses mit Stellplätzen' },
      { src: '/images/inserate/inserat-2-wohnen-1.jpg', alt: 'Wohnbereich mit Essplatz und verglaster Zimmertür' },
      { src: '/images/inserate/inserat-2-wohnen-2.jpg', alt: 'Heller Wohnraum im Dachgeschoss mit Fensterreihe' },
    ],
  },
  // Referenzaufnahmen, 3:2, 1800 px. Reihenfolge wie in `referenzGruppen`.
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
  ],
};

/* ------------------------------------------------------------------ *
 * Referenzgruppen
 *
 * Die Aufnahmen stehen nach Objekt gruppiert in einem versetzten Raster.
 * Welche Aufnahme zu welchem Objekt gehört, ist an den Bildern selbst
 * ablesbar; die Zuordnung ist also belegt.
 *
 * Nicht belegt sind Objektart, Ort und Auftraggeber. Deshalb heißen die
 * Gruppen neutral "Objekt 1" bis "Objekt 4", und das Label nennt nur die
 * Räume, die tatsächlich zu sehen sind. Nichts davon ist erfunden.
 *
 * TODO: Angabe durch Fabian bestätigen - sobald Objektart, Ort und die
 * Freigabe der Auftraggeber geklärt sind, können die Gruppen auf echte
 * Bezeichnungen umgestellt werden ("Mehrfamilienhaus, Bühl" o. ä.) und
 * das Label auf die erbrachte Leistung ("Fotografie · Drohne").
 *
 * Die Reihenfolge innerhalb einer Gruppe ist die Reihenfolge im Raster:
 * breit, quadratisch, hochkant, breit - danach wiederholt sich das Muster.
 *
 * `sichtbar: true` markiert die Gruppen, die ohne Klick zu sehen sind.
 * Von ihnen stehen zunächst nur die ersten vier Aufnahmen; alles Weitere
 * liegt hinter "Weitere Aufnahmen anzeigen".
 * ------------------------------------------------------------------ */
export const referenzGruppen = [
  { titel: 'Objekt 1', label: 'Küche, Wohnen, Essen', sichtbar: true,
    bilder: [2, 0, 3, 1, 4] },
  { titel: 'Objekt 2', label: 'Wohnen, Küche, Schlafen, Terrasse', sichtbar: true,
    bilder: [17, 15, 16, 14] },
  { titel: 'Objekt 3', label: 'Dachgeschosswohnung, unmöbliert',
    bilder: [9, 7, 10, 5, 6, 8, 18, 19] },
  { titel: 'Objekt 4', label: 'Wohnen, Schlafen, Bad',
    bilder: [13, 12, 11] },
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
];

/**
 * Freigegebener Ablauf in vier Schritten. Keine Lieferzeit, keine SLA,
 * keine pauschale Eigentümerkoordination beim ersten Auftrag.
 */
export const prozess = [
  { t: 'Projekt anfragen', x: 'Objektklasse, Standort und gewünschten Zeitraum übermitteln.' },
  { t: 'Umfang und Termin abstimmen', x: 'Quadratblick prüft die Angaben und bestätigt Leistungsumfang, Preis und Termin persönlich.' },
  { t: 'Immobilie fotografieren', x: 'Die ersten Projekte werden eng mit dem Makler abgestimmt. Der konkrete Ablauf richtet sich nach Objekt und Zusammenarbeit.' },
  { t: 'Bilder bearbeiten und bereitstellen', x: 'Die Aufnahmen werden professionell bearbeitet und zum vereinbarten Zeitpunkt digital bereitgestellt.' },
];

/**
 * Leistungsumfang je Objektklasse, wie er bisher auf der Seite stand.
 * Nicht erweitern ohne Freigabe.
 */
export const leistungsumfang = [
  'Innen- und Außenaufnahmen',
  '1 bis 2 Bilder je Raum, inklusive Nebenräume',
  'Vollständig bearbeitete Bilder für Exposé und Immobilienportale',
  'Checkliste zur Objektvorbereitung vorab',
];

/** Objekte außerhalb der drei Klassen. Kein Listenpreis, individuelle Prüfung. */
export const sonderobjekt = {
  key: 'sonder',
  name: 'Größere oder besondere Objekte',
  beschreibung: 'Gewerbe, Mischnutzung, mehrere Gebäude oder deutlich überdurchschnittlicher Umfang.',
  preisLabel: 'Festpreis nach Objektprüfung',
  stunden: 4,
};

/* ------------------------------------------------------------------ *
 * Zusatzleistung
 *
 * Einzige fest bepreiste Zusatzleistung: Drohnenaufnahmen, 150 € netto.
 * Kein fest bepreistes Video- oder Reel-Angebot. `note` ist der Text
 * hinter dem Infobutton im Anfrage-Wizard.
 * ------------------------------------------------------------------ */
export const ergaenzungen = [
  {
    key: 'drohne',
    name: 'Drohnenaufnahmen',
    preis: 150,
    stunden: 1,
    note: 'Luftaufnahmen von Immobilie, Grundstück und Umgebung. Möglich, sofern am Objekt '
      + 'rechtlich zulässig und witterungsbedingt durchführbar – das klären wir vor dem Termin.',
  },
];

/**
 * Weitere Formate stehen nachgeordnet und ohne Preis. Keine aktiven
 * Standardangebote, nicht im strukturierten Datenmodell.
 */
export const weitereMedien = 'Weitere Medienformate, etwa Video, sowie individuelle Leistungen '
  + 'wie virtuelles Home Staging auf Anfrage.';

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
 * Alle Beträge sind Nettopreise. Sie werden als "350 € netto" angezeigt.
 * Der vollständige Hinweis steht bei den Preisen, im Wizard und im Footer.
 *
 * Hintergrund: Reine B2B-Angebote dürfen netto ausgezeichnet werden, wenn
 * erkennbar ist, dass sie sich ausschließlich an Unternehmer richten.
 * TODO: Formulierung vor dem Live-Gang fachlich prüfen lassen.
 * ------------------------------------------------------------------ */

/** Betrag formatieren, ohne Zusatz. */
export const preis = (n) => n.toLocaleString('de-DE') + '\u00A0€';

/** Betrag mit Nettozusatz, überall dort wo ein Preis genannt wird. */
export const preisNetto = (n) => preis(n) + '\u00A0netto';

/** Kleinste Objektklasse, für "ab"-Angaben. */
export const abPreis = () => Math.min(...fotoklassen.map((k) => k.foto));

export const preishinweis = 'Alle Preise sind Nettopreise in Euro zuzüglich der gesetzlichen '
  + 'Umsatzsteuer. Das Angebot richtet sich ausschließlich an Unternehmer im Sinne des § 14 BGB.';
