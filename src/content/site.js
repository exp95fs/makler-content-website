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
    stunden: 2,
  },
  {
    key: 'einfamilienhaus',
    name: 'Einfamilienhaus',
    beschreibung: 'Eigenständiges Wohngebäude mit einer Wohneinheit und den üblichen Außenbereichen.',
    preis: 450,
    stunden: 3,
  },
  {
    key: 'mehrfamilienhaus',
    name: 'Mehrfamilienhaus',
    beschreibung: 'Typischerweise zwei bis drei Wohneinheiten mit Gemeinschafts- und Außenbereichen.',
    preis: 550,
    stunden: 4,
  },
];

export const sonderobjekt = {
  key: 'sonder',
  stunden: 4,
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
 * Der frühere "Makler-Film" (1.290 €) ist aufgelöst: Objektfilm plus die
 * Option "Makler vor der Kamera".
 * `stunden` steuert nur die Terminplanung im Konfigurator.
 * ------------------------------------------------------------------ */
export const filmpakete = [
  {
    key: 'objektfilm',
    name: 'Objektfilm',
    preis: 890,
    stunden: 5,
    beschreibung: 'Hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll vermittelt, ganz ohne Personen vor der Kamera. Ideal für eine emotionale Präsentation.',
  },
];

/* ------------------------------------------------------------------ *
 * Optionen (Erweiterungen)
 * `preis`      – fester Betrag
 * `jeEinheit`  – Mengenpreis, ab `staffelAb` gilt `jeEinheitAb`
 * `zuschlag`   – prozentualer Aufschlag mit Mindestbetrag
 * ------------------------------------------------------------------ */
export const optionen = [
  {
    key: 'drohnenfotos', name: 'Drohnenfotos', preis: 170, preisLabel: '+170 €', stunden: 1,
    note: 'Präsentieren Sie Immobilie, Grundstück und Umgebung aus einer eindrucksvollen Perspektive. Besonders empfehlenswert bei Häusern, großzügigen Grundstücken und attraktiven Lagen.',
  },
  {
    key: 'drohnenmedia', name: 'Drohnen-Media', preis: 260, preisLabel: '+260 €', stunden: 1,
    note: 'Drohnenfotos und zusätzlich bewegtes Material, das im Reel oder im Objektfilm verwendet werden kann.',
  },
  {
    key: 'launchreel', name: 'Launch-Reel', preis: 390, preisLabel: '+390 €', stunden: 2,
    note: 'Vertikaler Clip von etwa 30 bis 45 Sekunden für die Ankündigung des Objekts. Ideal für Instagram, Facebook und Ihre Website.',
  },
  {
    key: 'maklerkamera', name: 'Makler vor der Kamera', preis: 350, preisLabel: '+350 €', stunden: 2,
    nurMitFilm: true,
    note: 'Sie präsentieren das Objekt persönlich im Film. Das schafft Vertrauen und stärkt zugleich Ihre eigene Marke.',
  },
  {
    key: 'voiceover', name: 'Voice-over des Maklers', preis: 190, preisLabel: '+190 €',
    nurMitFilm: true,
    note: 'Ihre Stimme führt durch den Film, ohne Auftritt vor der Kamera.',
  },
  {
    key: 'zusatzschnitt', name: 'Zusätzlicher Schnitt', preis: 180, preisLabel: '+180 €',
    nurMitFilm: true,
    note: 'Ein weiterer Schnitt aus vorhandenem Material, etwa kürzer oder für einen anderen Kanal.',
  },
  {
    key: 'aktivierungen', name: 'Drei Content-Aktivierungen', preis: 450, preisLabel: '+450 €',
    note: 'Drei Ausleitungen für benannte Anlässe im Vermarktungsverlauf, etwa Ankündigung, Highlight und Abschluss.',
  },
  {
    key: 'homestaging', name: 'Virtuelles Home Staging',
    jeEinheit: 89, jeEinheitAb: 69, staffelAb: 3, maxMenge: 10,
    preisLabel: '89 € je Bild, ab drei Bildern 69 €',
    nurMitFoto: true,
    note: 'Leere Räume werden digital möbliert. Einrichtungsstil, Möbel und Dekoration werden passend zum Objekt und zur gewünschten Zielgruppe ausgewählt.',
  },
  {
    key: 'express', name: 'Express', zuschlag: 0.30, zuschlagMin: 120,
    preisLabel: '+30 %, mind. 120 €',
    note: 'Vorgezogene Bearbeitung, wenn das Inserat kurzfristig online gehen muss. Der Aufschlag wird auf die beschleunigten Positionen dieses Objekts gerechnet, mindestens jedoch 120 €.',
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
