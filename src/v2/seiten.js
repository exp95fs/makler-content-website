/**
 * Seitenstruktur der Website. Einzige Quelle für Pfade, Titel, Meta
 * Descriptions und Brotkrumen. Prerender, Sitemap, Navigation und
 * JSON-LD lesen von hier.
 *
 * `index: false` hält eine Seite aus der Sitemap und setzt noindex.
 */
export const SEITEN = {
  start: {
    pfad: '/',
    name: 'Startseite',
    title: 'Immobilienfotograf Bühl, Baden-Baden & Rastatt | Quadratblick',
    // Vorgabe auf ca. 160 Zeichen gekürzt ("und Mittelbaden", "direkte" entfallen).
    description: 'Immobilienfotografie für Maklerbüros in Bühl, Baden-Baden, Rastatt und Achern. Festpreis nach Objektklasse, Drohnenaufnahmen, Objekt-Kurzvideo und Terminanfrage.',
  },
  nichtGefunden: {
    pfad: '/404.html',
    name: 'Seite nicht gefunden',
    title: 'Seite nicht gefunden | Quadratblick',
    description: 'Die angefragte Seite gibt es nicht. Von hier geht es zurück zur Startseite, zu den Preisen oder zur Anfrage.',
    index: false,
  },
};

/** Pfad aus der Adresszeile auf eine Seite abbilden. */
export function seiteZuPfad(pfad) {
  const norm = pfad.endsWith('/') || pfad.endsWith('.html') ? pfad : `${pfad}/`;
  const key = Object.keys(SEITEN).find((k) => SEITEN[k].pfad === norm);
  return key || 'nichtGefunden';
}
