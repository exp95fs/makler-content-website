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
  // Referenzaufnahmen, 3:2, 1800 px.
  // Das Mosaik läuft in Bändern aus je einer großen (2x2 Zellen) und vier
  // kleinen Kacheln. Ein Band füllt bei vier Spalten genau zwei Zeilen,
  // deshalb steht `gross` auf jeder fünften Position und die Liste umfasst
  // ein Vielfaches von fünf Aufnahmen.
  referenzen: [
    { src: '/images/referenzen/ref-01.jpg', alt: 'Küche im Erdgeschoss mit Kochinsel', gross: true },
    { src: '/images/referenzen/ref-02.jpg', alt: 'Küchenzeile mit Blick in den angrenzenden Raum' },
    { src: '/images/referenzen/ref-03.jpg', alt: 'Wohnbereich im Erdgeschoss mit Sitzgruppe' },
    { src: '/images/referenzen/ref-04.jpg', alt: 'Küche im Obergeschoss' },
    { src: '/images/referenzen/ref-05.jpg', alt: 'Essbereich im Obergeschoss' },
    { src: '/images/referenzen/ref-06.jpg', alt: 'Wohnbereich mit Blick zum Fenster', gross: true },
    { src: '/images/referenzen/ref-07.jpg', alt: 'Essbereich mit Esstisch und Tageslicht' },
    { src: '/images/referenzen/ref-08.jpg', alt: 'Badezimmer mit Waschtisch' },
    { src: '/images/referenzen/ref-09.jpg', alt: 'Wohnbereich mit Sofa und Tageslicht' },
    { src: '/images/referenzen/ref-10.jpg', alt: 'Wohnbereich aus einer zweiten Perspektive' },
    { src: '/images/referenzen/ref-11.jpg', alt: 'Schlafzimmer mit Bett und Fensterfront', gross: true },
    { src: '/images/referenzen/ref-12.jpg', alt: 'Gästezimmer im Haus' },
    { src: '/images/referenzen/ref-13.jpg', alt: 'Badezimmer im Dachgeschoss' },
    { src: '/images/referenzen/ref-14.jpg', alt: 'Wohnbereich im Dachgeschoss mit Dachschräge' },
    { src: '/images/referenzen/ref-15.jpg', alt: 'Balkon mit Ausblick' },
    { src: '/images/referenzen/ref-16.jpg', alt: 'Küche mit Arbeitsfläche und Oberschränken', gross: true },
    { src: '/images/referenzen/ref-17.jpg', alt: 'Schlafzimmer mit Kleiderschrank' },
    { src: '/images/referenzen/ref-18.jpg', alt: 'Wohnbereich mit offener Raumaufteilung' },
    { src: '/images/referenzen/ref-19.jpg', alt: 'Badezimmer im Obergeschoss mit Dusche' },
    { src: '/images/referenzen/ref-20.jpg', alt: 'Wohnzimmer mit Sitzecke' },
  ],
};

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
 * Objektklassen
 *
 * Eine Klasse trägt alle drei Preise: Foto, Objektfilm und Maklerfilm.
 * Dadurch gibt es genau eine Quelle für Vorschau, Preistabellen und
 * Buchungsworkflow. Die Qualität ist in jeder Klasse dieselbe, der Preis
 * folgt allein dem typischen Produktionsumfang.
 * `stunden` steuert nur die Terminplanung im Buchungsworkflow.
 * ------------------------------------------------------------------ */
export const objektklassen = [
  {
    key: 'wohnung',
    name: 'Wohnung',
    beschreibung: 'Eine Wohnung innerhalb eines Mehrparteiengebäudes.',
    foto: 350,
    video: 650,
    maklerfilm: 950,
    stunden: { foto: 2, video: 4, maklerfilm: 5 },
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    foto: 450,
    video: 800,
    maklerfilm: 1150,
    stunden: { foto: 3, video: 5, maklerfilm: 6 },
  },
  {
    key: 'mehrfamilienhaus',
    name: 'Mehrfamilienhaus / mehrere Wohneinheiten',
    kurz: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    foto: 550,
    video: 1050,
    maklerfilm: 1350,
    stunden: { foto: 4, video: 6, maklerfilm: 7 },
  },
];

/** Objekte außerhalb der drei Klassen. Fließt nicht in die Summe ein. */
export const sonderobjekt = {
  key: 'sonder',
  name: 'Außergewöhnliche Objekte',
  beschreibung: 'Gewerbe, Mischnutzung, mehrere Gebäude, deutlich überdurchschnittlicher Umfang.',
  preisLabel: 'individuelle Prüfung',
  stunden: { foto: 4, video: 6, maklerfilm: 7 },
};

/** Die beiden Filmarten. `feld` verweist auf den Preis in der Objektklasse. */
export const filmarten = [
  {
    key: 'objektfilm',
    feld: 'video',
    name: 'Objektfilm',
    beschreibung: 'Ein Film, der Räume, Details und Atmosphäre des Objekts vermittelt, ohne Personen vor der Kamera.',
  },
  {
    key: 'maklerfilm',
    feld: 'maklerfilm',
    name: 'Maklerfilm',
    beschreibung: 'Der Objektfilm, erweitert um Ihre persönliche Präsentation vor der Kamera.',
  },
];

/** Preisangaben für die kompakte Leistungs-Vorschau. */
export const abPreise = {
  foto: Math.min(...objektklassen.map((k) => k.foto)),
  video: Math.min(...objektklassen.map((k) => k.video)),
};

/** Vorteil je weiterem Objekt am selben Produktionstag, nur auf den Fotopreis. */
export const buendelVorteil = {
  betrag: 50,
  bedingungen: 'Gilt für den fotografischen Grundpreis, nicht für Video, Maklerfilm oder sonstige Optionen. '
    + 'Voraussetzung sind derselbe Kunde, eine gemeinsame Rechnung, eine sinnvolle Route und ein vorbereitetes Objekt.',
};

/* ------------------------------------------------------------------ *
 * Erweiterungen
 * `preis`      – fester Betrag
 * `jeEinheit`  – Mengenpreis, ab `staffelAb` gilt `jeEinheitAb`
 * `zuschlag`   – prozentualer Aufschlag mit Mindestbetrag
 * ------------------------------------------------------------------ */
export const optionen = [
  {
    key: 'drohnenfotos', name: 'Drohnenfotos', preis: 170, preisLabel: '170 €', stunden: 1,
    note: 'Immobilie, Grundstück und Umgebung aus der Luft. Besonders bei Häusern, großen Grundstücken und attraktiven Lagen.',
  },
  {
    key: 'drohnenmedia', name: 'Drohnen-Media', zusatz: 'Fotos plus bewegtes Material',
    preis: 260, preisLabel: '260 €', stunden: 1,
    note: 'Drohnenfotos und zusätzlich bewegte Aufnahmen, die im Reel oder im Film verwendet werden.',
  },
  {
    key: 'launchreel', name: 'Launch-Reel', zusatz: 'vertikal, ca. 30 bis 45 Sekunden',
    preis: 390, preisLabel: '390 €', stunden: 2,
    note: 'Vertikaler Clip für die Ankündigung des Objekts auf Instagram, Facebook und Ihrer Website.',
  },
  {
    key: 'voiceover', name: 'Voice-over des Maklers', preis: 190, preisLabel: '190 €',
    nurMitFilm: true,
    note: 'Ihre Stimme führt durch den Film, ohne Auftritt vor der Kamera.',
  },
  {
    key: 'zusatzschnitt', name: 'Zusätzlicher Schnitt', zusatz: 'aus vorhandenem Material',
    preis: 180, preisLabel: '180 €', nurMitFilm: true,
    note: 'Ein weiterer Schnitt aus dem Material des Termins, etwa kürzer oder für einen anderen Kanal.',
  },
  {
    key: 'aktivierungen', name: 'Drei Content-Aktivierungen', preis: 450, preisLabel: '450 €',
    note: 'Drei Ausleitungen für benannte Anlässe im Vermarktungsverlauf, etwa Ankündigung, Highlight und Abschluss.',
  },
  {
    key: 'homestaging', name: 'Virtuelles Home Staging',
    jeEinheit: 89, jeEinheitAb: 69, staffelAb: 3,
    preisLabel: '89 € je Bild, ab drei Bildern 69 € je Bild',
    nurMitFoto: true,
    note: 'Leere Räume werden digital möbliert, passend zum Objekt und zur gewünschten Zielgruppe.',
  },
  {
    key: 'express', name: 'Express', zuschlag: 0.30, zuschlagMin: 120,
    preisLabel: 'Aufschlag 30 %, mindestens 120 €', preisLabelKurz: '+30 %, mind. 120 €',
    note: 'Vorgezogene Bearbeitung, wenn das Inserat kurzfristig online gehen muss. Der Aufschlag gilt für die Positionen dieses Objekts.',
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
  region: 'Bühl · Mittelbaden · Ortenau',
};

/** Preis für die Anzeige formatieren. */
export const preis = (n) => n.toLocaleString('de-DE') + ' €';
