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
    title: 'Immobilienfotograf Mittelbaden | Quadratblick',
    description: 'Professionelle Immobilienfotografie für Makler in Bühl, Baden-Baden, Achern und Mittelbaden. Klare Preise nach Objektklasse und direkte Projektanfrage.',
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
