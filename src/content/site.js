/**
 * Zentrale Inhalts- und Preisdatei für die Quadratblick-Website.
 *
 * Hier wird gepflegt: Preise, Leistungsnamen, Beschreibungen, Bildpfade.
 * Keine Preise oder Leistungstexte direkt in Komponenten schreiben.
 *
 * Alle Beträge sind NETTO-Preise in Euro, zzgl. gesetzlicher USt.
 */

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
  // Kundenlogos, PNG mit Transparenz, einheitlich 160 px hoch.
  logos: [
    { src: '/images/logos/kunde-01.png', alt: 'Sparkasse ImmoCenter' },
    { src: '/images/logos/kunde-02.png', alt: 'Bemmann Immobilien' },
    { src: '/images/logos/kunde-03.png', alt: 'Manufakturhaus Kasbad' },
    { src: '/images/logos/kunde-04.png', alt: 'Kundenlogo' },
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
 * Kennzahlen unter dem Hero
 * Werte und Quellenhinweis wörtlich von der Live-Seite.
 * ------------------------------------------------------------------ */
export const kennzahlen = [
  { wert: 403, prefix: '+', suffix: ' %', label: 'mehr Anfragen mit Video' },
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
 * Der Ablauf einer Produktion, von der Beauftragung bis zur Lieferung.
 * Steht als eigene Sektion, nicht bei den Paketen: dort machte die
 * Aufzählung die Preisübersicht unübersichtlich.
 *
 * Die Schritte benennen konkret, was passiert - das ist der Unterschied
 * zwischen "Bearbeitung" und einer Leistung, deren Wert erkennbar ist.
 *
 * TODO: Angabe durch Fabian bestätigen - die technischen Angaben in 04
 * und 05 (Belichtungsreihen, manuelles Blending, Ausblicksoptimierung)
 * beschreiben den dokumentierten HDR-Workflow. Bitte gegenprüfen, bevor
 * sie live gehen, damit nichts zugesagt wird, was nicht immer gilt.
 */
export const ablauf = [
  {
    t: 'Beauftragung',
    x: 'Sie nennen uns das Objekt und den Kontakt zum Eigentümer. Das ist Ihr einziger Aufwand im gesamten Ablauf.',
  },
  {
    t: 'Terminabstimmung mit dem Eigentümer',
    x: 'Wir melden uns direkt beim Eigentümer, klären den Zugang und legen den Aufnahmetermin fest.',
  },
  {
    t: 'Checkliste zur Objektvorbereitung',
    x: 'Der Eigentümer erhält vorab eine verständliche Anleitung, worauf es ankommt. So hält vor Ort nichts auf.',
  },
  {
    t: 'Aufnahmen vor Ort',
    x: 'Innen, außen und Nebenräume. Belichtungsreihen je Raum, abgestimmt auf Tageslicht, Raumtiefe und Fensterausblick.',
  },
  {
    t: 'High-End-Postproduktion',
    x: 'Manuelles Blending der Belichtungsreihen, Optimierung der Fensterausblicke, Farb- und Kontrastabstimmung Bild für Bild.',
  },
  {
    t: 'Bereitstellung zum vereinbarten Termin',
    x: 'Die fertigen Aufnahmen liegen zum zugesagten Termin bei Ihnen, einsatzfertig für Exposé, Portale und Ihre Kanäle.',
  },
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
 * Ergänzungen
 *
 * Im Buchungsworkflow direkt wählbar sind Drohnenaufnahmen und das kurze
 * Objektreel. `note` ist der Text hinter dem Infobutton.
 *
 * KONFLIKT zur Knowledge Base: dort steht der Arbeitspreis für
 * Drohnenfotos bei +170 € (von historisch +140 € angehoben). Hier stehen
 * 130 € nach ausdrücklicher Vorgabe. Vor Live-Gang entscheiden.
 *
 * Alles Weitere unten steht nur als Aufzählung auf der Seite und wird im
 * Abstimmungstermin auf das Objekt zugeschnitten.
 * ------------------------------------------------------------------ */
export const ergaenzungen = [
  {
    key: 'drohne',
    name: 'Drohnenaufnahmen',
    preis: 130,
    preisLabel: '+ 130\u202F€\u202F*',
    stunden: 1,
    note: 'Präsentieren Sie Immobilie, Grundstück und Umgebung aus einer eindrucksvollen '
      + 'Perspektive. Besonders empfehlenswert bei Häusern, großzügigen Grundstücken und '
      + 'attraktiven Lagen. Möglich, sofern am Objekt rechtlich zulässig und witterungsbedingt '
      + 'durchführbar - das klären wir vor dem Termin.',
  },
  {
    key: 'reel',
    name: 'Kurzes Objektreel',
    preis: 390,
    preisLabel: '+ 390\u202F€\u202F*',
    stunden: 2,
    note: 'Ein vertikaler Rundgang durch das Objekt, ca. 30 bis 45 Sekunden, für Instagram, '
      + 'Facebook und Ihre Website. Entsteht im selben Termin, ohne zweiten Vor-Ort-Besuch.',
  },
];

/** Nur als Aufzählung auf der Seite, ohne Preise. */
export const weitereErgaenzungen = [
  'Objektfilm mit geführtem Rundgang',
  'Ihr Auftritt vor der Kamera oder als Stimme im Film',
  'Virtuelles Home Staging für leer stehende Räume',
  'Vorgezogene Bearbeitung, wenn das Inserat kurzfristig online gehen muss',
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
  region: 'Bühl · Mittelbaden · Ortenau',
};

/* ------------------------------------------------------------------ *
 * Preisangaben
 *
 * Alle Beträge auf der Seite sind Nettopreise. Statt hinter jeden Betrag
 * "netto" zu schreiben, steht ein Sternchen am Preis und einmal je
 * Sektion der vollständige Hinweis.
 *
 * Rechtlicher Hintergrund: die Preisangabenverordnung verlangt
 * Endpreise inklusive Umsatzsteuer nur gegenüber Verbrauchern. Reine
 * B2B-Angebote dürfen netto ausgezeichnet werden, wenn erkennbar ist,
 * dass sich das Angebot ausschließlich an Unternehmer richtet und diese
 * Eingrenzung auch durchgesetzt wird. Deshalb nennt der Hinweis beides,
 * und im Buchungsworkflow bestätigt der Anfragende seine
 * Unternehmereigenschaft.
 *
 * TODO: Angabe durch Fabian bestätigen - Formulierung vor dem Live-Gang
 * anwaltlich oder über die IHK gegenprüfen lassen.
 * ------------------------------------------------------------------ */

/** Preis für die Anzeige formatieren. Ohne Sternchen. */
export const preis = (n) => n.toLocaleString('de-DE') + ' €';

/** Preis mit Sternchen, überall dort wo ein konkreter Betrag steht. */
export const preisStern = (n) => preis(n) + '\u202F*';

/** Der vollständige Hinweis. Steht in jeder Sektion, die Preise zeigt. */
export const preishinweis = '* Alle Preise sind Nettopreise in Euro und verstehen sich zuzüglich '
  + 'der gesetzlichen Umsatzsteuer von derzeit 19 %. Unsere Leistungen richten sich '
  + 'ausschließlich an Unternehmer im Sinne des § 14 BGB, nicht an Verbraucher.';

/** Kurzform für enge Stellen, etwa unter dem Hero. */
export const preishinweisKurz = 'Alle Preise netto zzgl. USt. · Angebot ausschließlich für Unternehmer';
