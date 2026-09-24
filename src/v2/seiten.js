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
  immobilienfotografie: {
    pfad: '/immobilienfotografie/',
    name: 'Immobilienfotografie',
    title: 'Immobilienfotografie für Makler | Quadratblick',
    description: 'Professionelle Immobilienfotos für Exposés und Immobilienportale in Bühl, Baden-Baden, Rastatt und Mittelbaden. Jetzt Verfügbarkeit prüfen.',
  },
  referenzen: {
    pfad: '/referenzen/',
    name: 'Referenzen',
    title: 'Referenzen Immobilienfotografie | Quadratblick',
    description: 'Ausgewählte Immobilienaufnahmen und regionale Referenzprojekte von Quadratblick in Bühl und Mittelbaden.',
  },
  preise: {
    pfad: '/preise/',
    name: 'Preise',
    title: 'Preise für Immobilienfotografie | Quadratblick',
    description: 'Transparente Preise für professionelle Immobilienfotografie: drei Objektklassen ab 350 € netto und Drohnenaufnahmen als optionales Add-on.',
  },
  ueber: {
    pfad: '/ueber-quadratblick/',
    name: 'Über Quadratblick',
    title: 'Über Quadratblick und Fabian Schneebiegl',
    description: 'Quadratblick steht für persönliche, professionelle Immobilienfotografie für Makler in Bühl und Mittelbaden. Lernen Sie Fabian Schneebiegl kennen.',
  },
  anfrage: {
    pfad: '/projekt-anfragen/',
    name: 'Verfügbarkeit prüfen',
    title: 'Verfügbarkeit prüfen | Quadratblick',
    description: 'Immobilienfotografie für ein konkretes Objekt anfragen und gewünschten Zeitraum übermitteln. Quadratblick bestätigt Termin, Umfang und Preis persönlich.',
  },
  nichtGefunden: {
    pfad: '/404.html',
    name: 'Seite nicht gefunden',
    title: 'Seite nicht gefunden | Quadratblick',
    description: 'Die angefragte Seite gibt es nicht. Von hier geht es zur Startseite, zu den Preisen oder zur Projektanfrage.',
    index: false,
  },
};

/** Pfad aus der Adresszeile auf eine Seite abbilden. */
export function seiteZuPfad(pfad) {
  const norm = pfad.endsWith('/') || pfad.endsWith('.html') ? pfad : `${pfad}/`;
  const key = Object.keys(SEITEN).find((k) => SEITEN[k].pfad === norm);
  return key || 'nichtGefunden';
}
