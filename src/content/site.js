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
    umfang: 'Innenräume, Gemeinschaftsbereiche und die Außenansicht des Gebäudes.',
    foto: 350,
    stunden: 2,
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    umfang: 'Innenräume, Neben- und Technikräume, Außenansichten und Grundstück.',
    foto: 450,
    empfohlen: true,
    stunden: 3,
  },
  {
    key: 'mehrfamilienhaus',
    name: 'Mehrfamilienhaus',
    kurz: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    umfang: 'Alle Einheiten, Gemeinschaftsflächen, Neben- und Technikräume, Außenbereiche.',
    foto: 550,
    stunden: 4,
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
 * Auf der Seite stehen sie nur als Hinweis, ohne Preisliste. Buchbar ist
 * im Workflow aktuell allein das Launch-Reel; alles Weitere wird im
 * Abstimmungstermin auf das Objekt zugeschnitten.
 * ------------------------------------------------------------------ */
export const buchbareErgaenzung = {
  key: 'launchreel',
  name: 'Launch-Reel',
  zusatz: 'vertikaler Rundgang, ca. 30 bis 45 Sekunden',
  preis: 390,
  preisLabel: '390 €',
  stunden: 2,
  note: 'Ein vertikaler Clip durch das Objekt für Instagram, Facebook und Ihre Website. '
    + 'Entsteht im selben Termin, ohne zweiten Vor-Ort-Besuch.',
};

/** Nur als Aufzählung auf der Seite, ohne Preise. */
export const weitereErgaenzungen = [
  'Drohnenaufnahmen von Gebäude, Grundstück und Lage',
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

/** Preis für die Anzeige formatieren. */
export const preis = (n) => n.toLocaleString('de-DE') + ' €';
