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
  // 16:9, min. 2000px Breite. Aktuell echtes Bild aus einer Objektproduktion.
  hero: '/images/hero/hero.jpg',
  // 4:5 Hochformat, min. 1200px Breite. PLATZHALTER: Porträt Fabian.
  portrait: '/images/portrait/portrait.jpg',
  // 3:1 quer, einfarbig (currentColor). PLATZHALTER: vier Kundenlogos.
  logos: [
    { src: '/images/logos/kunde-01.svg', alt: 'Logo Kunde 1' },
    { src: '/images/logos/kunde-02.svg', alt: 'Logo Kunde 2' },
    { src: '/images/logos/kunde-03.svg', alt: 'Logo Kunde 3' },
    { src: '/images/logos/kunde-04.svg', alt: 'Logo Kunde 4' },
  ],
  // 3:2 quer, min. 1600px Breite. ref-01 bis ref-07 echte Aufnahmen,
  // ref-08 bis ref-10 PLATZHALTER.
  referenzen: [
    { src: '/images/referenzen/ref-01.jpg', alt: 'Mehrfamilienhaus, Außenaufnahme mit Zufahrt und Carport' },
    { src: '/images/referenzen/ref-02.jpg', alt: 'Luftaufnahme eines Wohnobjekts mit Umgebung und Lage' },
    { src: '/images/referenzen/ref-03.jpg', alt: 'Wohnraum mit Parkett und bodentiefen Fenstern' },
    { src: '/images/referenzen/ref-04.jpg', alt: 'Außenansicht mit Balkonen und Blick über die Felder' },
    { src: '/images/referenzen/ref-05.jpg', alt: 'Offene Wohnküche mit Tageslicht' },
    { src: '/images/referenzen/ref-06.jpg', alt: 'Eingangsbereich mit Briefkastenanlage' },
    { src: '/images/referenzen/ref-07.jpg', alt: 'Großzügiger Wohnraum mit Blick in den Garten' },
    { src: '/images/referenzen/ref-08.jpg', alt: 'Platzhalter für eine weitere Referenzaufnahme' },
    { src: '/images/referenzen/ref-09.jpg', alt: 'Platzhalter für eine weitere Referenzaufnahme' },
    { src: '/images/referenzen/ref-10.jpg', alt: 'Platzhalter für eine weitere Referenzaufnahme' },
  ],
};

/* ------------------------------------------------------------------ *
 * Objektklassen Fotografie
 * Der Preis richtet sich nach dem Objektumfang, nicht nach Bildqualität.
 * Keine Bildanzahl als Kontingent nach außen kommunizieren.
 * ------------------------------------------------------------------ */
export const objektklassen = [
  {
    key: 'wohnung',
    name: 'Wohnung',
    beschreibung: 'Eine Wohnung innerhalb eines Mehrparteiengebäudes.',
    preis: 350,
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    preis: 450,
  },
  {
    key: 'mehrfamilienhaus',
    name: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    preis: 550,
  },
];

export const sonderobjekt = {
  name: 'Größere oder komplexe Objekte',
  beschreibung: 'Gewerbe, Mischnutzung, mehrere Gebäude oder besondere Anforderungen. Sie erhalten ein individuelles Festpreisangebot.',
  preisLabel: 'Festpreis nach Objektprüfung',
};

/** Vorteil je weiterem Objekt am selben Produktionstag, nur auf den Fotokern. */
export const buendelVorteil = {
  betrag: 50,
  bedingungen: 'Gilt für den fotografischen Grundpreis, bei gleichem Kunden, gemeinsamer Rechnung, sinnvoller Route und ohne zusätzliche Anfahrt. Wird nicht mit anderen Vorteilen kombiniert.',
};

/* ------------------------------------------------------------------ *
 * Filmpakete
 * Der frühere "Makler-Film" ist aufgelöst: Objektfilm plus die
 * Erweiterung "Makler vor der Kamera".
 * ------------------------------------------------------------------ */
export const filmpakete = [
  {
    key: 'objektfilm',
    name: 'Objektfilm',
    preis: 890,
    beschreibung: 'Hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll vermittelt, ganz ohne Personen vor der Kamera. Ideal für eine emotionale Präsentation.',
  },
];

/* ------------------------------------------------------------------ *
 * Erweiterungen
 * Stehen nicht als Preisliste auf der Seite, sondern im Optionen-Teil
 * der Terminanfrage, wo sie mitgerechnet werden.
 * `preis`      – fester Betrag
 * `jeEinheit`  – Mengenpreis, Formular zeigt ein Mengenfeld
 * `zuschlag`   – prozentualer Aufschlag auf die Summe
 * ------------------------------------------------------------------ */
export const erweiterungen = [
  { key: 'drohnenfotos', name: 'Drohnenfotos', preis: 170, preisLabel: '170 €' },
  { key: 'drohnenmedia', name: 'Drohnen-Media', zusatz: 'Fotos plus bewegtes Material', preis: 260, preisLabel: '260 €' },
  { key: 'launchreel', name: 'Launch-Reel', zusatz: 'vertikal, ca. 30 bis 45 Sekunden', preis: 390, preisLabel: '390 €' },
  { key: 'maklerkamera', name: 'Makler vor der Kamera', preis: 350, preisLabel: '350 €' },
  { key: 'voiceover', name: 'Voice-over des Maklers', preis: 190, preisLabel: '190 €' },
  { key: 'zusatzschnitt', name: 'Zusätzlicher Schnitt', zusatz: 'aus vorhandenem Material', preis: 180, preisLabel: '180 €' },
  { key: 'aktivierungen', name: 'Drei Content-Aktivierungen', preis: 450, preisLabel: '450 €' },
  { key: 'homestaging', name: 'Virtuelles Home Staging', jeEinheit: 89, jeEinheitAb3: 69,
    preisLabel: '89 € je Bild, ab drei Bildern 69 €' },
  { key: 'express', name: 'Express', zuschlag: 0.30, zuschlagMin: 120,
    preisLabel: 'Aufschlag 30 %, mindestens 120 €', preisLabelKurz: '+30 %, mind. 120 €' },
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
