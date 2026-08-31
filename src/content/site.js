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
 * Umfang der Produktion
 * Die Namen sagen ohne Erklärung, was enthalten ist. Bewusst keine
 * Kunstbegriffe, keine Stufenlogik über Qualität.
 * ------------------------------------------------------------------ */
export const level = [
  {
    key: 'fotos',
    name: 'Nur Fotos',
    zweck: 'Für Exposé und Portale',
    punkte: [
      'Bearbeitete Bildauswahl, abgestimmt auf das Objekt',
      'Innen, außen sowie Neben- und Technikräume',
      'Einsatzfertig für Exposé, Portale und Ihre Website',
    ],
  },
  {
    key: 'kurzvideo',
    name: 'Fotos und Kurzvideo',
    zweck: 'Wenn das Objekt auch auf Social Media laufen soll',
    empfohlen: true,
    punkte: [
      'Alle Fotos wie oben',
      'Video im Hochformat, etwa 30 bis 45 Sekunden',
    ],
  },
  {
    key: 'objektfilm',
    name: 'Fotos und Objektfilm',
    zweck: 'Wenn Sie das Objekt vollständig zeigen wollen',
    punkte: [
      'Alle Fotos wie oben',
      'Geführter Film durch das Objekt, mit Hochformat-Schnitt',
      'Auf Wunsch mit Ihnen vor der Kamera',
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Erweiterungen
 * Die Preise stehen nicht auf der Seite, sondern im Anfrageformular,
 * wo sie direkt mitgerechnet werden.
 * `preis`      – fester Betrag, geht in die Summe ein
 * `jeEinheit`  – Mengenpreis, Formular zeigt ein Mengenfeld
 * `zuschlag`   – prozentualer Aufschlag auf die Summe
 * ------------------------------------------------------------------ */
export const erweiterungen = [
  {
    key: 'drohnenfotos', name: 'Drohnenfotos', preis: 170, preisLabel: '170 €',
    beschreibung: 'Gebäude, Grundstück und Lage aus der Luft. Sinnvoll bei Häusern, größeren Grundstücken und schwer erklärbarer Lage.',
  },
  {
    key: 'drohnenvideo', name: 'Drohnenfotos und Drohnenvideo', preis: 260, preisLabel: '260 €',
    beschreibung: 'Zusätzlich zu den Drohnenfotos bewegte Aufnahmen, die im Kurzvideo oder im Objektfilm verwendet werden.',
  },
  {
    key: 'kurzvideo', name: 'Kurzvideo für Social Media', preis: 390, preisLabel: '390 €',
    beschreibung: 'Video im Hochformat, etwa 30 bis 45 Sekunden, für Instagram und Facebook.',
  },
  {
    key: 'objektfilm', name: 'Objektfilm', preis: 890, preisLabel: '890 €',
    beschreibung: 'Geführter Film durch das Objekt, inklusive eines Hochformat-Schnitts für Social Media.',
  },
  {
    key: 'maklerkamera', name: 'Sie vor der Kamera', preis: 350, preisLabel: '350 €',
    beschreibung: 'Sie führen selbst durch das Objekt und sind im Film zu sehen.',
  },
  {
    key: 'stimme', name: 'Ihre Stimme im Film', preis: 190, preisLabel: '190 €',
    beschreibung: 'Sie sprechen den Film ein, ohne selbst vor der Kamera zu stehen.',
  },
  {
    key: 'zweitfassung', name: 'Zweite Videofassung', preis: 180, preisLabel: '180 €',
    beschreibung: 'Ein zweiter Schnitt aus dem vorhandenen Material, zum Beispiel kürzer oder für einen anderen Kanal.',
  },
  {
    key: 'zusatzvideos', name: 'Drei kurze Zusatzvideos', preis: 450, preisLabel: '450 €',
    beschreibung: 'Drei weitere kurze Clips aus dem Material des Termins, für spätere Beiträge zum selben Objekt.',
  },
  {
    key: 'homestaging', name: 'Virtuelles Home Staging', jeEinheit: 89, jeEinheitAb3: 69,
    preisLabel: '89 € je Bild, ab drei Bildern 69 €',
    beschreibung: 'Leere Räume werden am Rechner möbliert, damit Interessenten die Nutzung erkennen.',
  },
  {
    key: 'express', name: 'Express-Bearbeitung', zuschlag: 0.30, zuschlagMin: 120,
    preisLabel: 'Aufschlag 30 %, mindestens 120 €', preisLabelKurz: '+30 %, mind. 120 €',
    beschreibung: 'Vorgezogene Bearbeitung, wenn das Inserat kurzfristig online gehen muss.',
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
