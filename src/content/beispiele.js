import daten from './beispiele.json';
import { fotoklassen } from './site.js';

/**
 * Beispiel-Inserate der Referenz-Sektion.
 *
 * Quelle ist referenzen-manifest.json (nur lokal). scripts/referenzen.py
 * schreibt daraus beispiele.json mit ausschließlich freigegebenen Listings;
 * nicht freigegebene sind hier gar nicht erst vorhanden. Hier steht nur die
 * Ableitung: welches Listing groß gezeigt wird (Manifest-Feld
 * "hauptbeispiel"), welche unter "Weitere Projekte" laufen und welches
 * Listing eine Preiskachel öffnet (site.js, fotoklassen[].beispiel).
 */

/** Alle freigegebenen Listings in Manifest-Reihenfolge. */
export const listings = daten.listings;

const nachSlug = new Map(listings.map((l) => [l.slug, l]));

/** Listing zu einem Slug, `undefined` bei unbekanntem oder gesperrtem Slug. */
export const listingZu = (slug) => nachSlug.get(slug);

/** Preisklasse aus site.js zur Manifest-Klasse (Name und Festpreis). */
const fotoklasseZu = (klasse) => fotoklassen.find((k) => (k.manifestKlasse || k.key) === klasse);

/**
 * Objektklasse eines Listings für Karte und Galerie: Name und Festpreis wie
 * auf der Preiskachel, damit beide übereinstimmen.
 */
export function klasseZu(listing) {
  const preisklasse = fotoklasseZu(listing.klasse);
  const k = daten.klassen.find((x) => x.key === listing.klasse);
  return {
    label: preisklasse ? preisklasse.name : k.label,
    preis: preisklasse ? preisklasse.foto : null,
  };
}

/** Das eine groß gezeigte Listing (Manifest: "hauptbeispiel": true). */
export const hauptbeispiel = listingZu(daten.hauptbeispiel);

/** Alle übrigen freigegebenen Listings in Manifest-Reihenfolge. */
export const weitereProjekte = listings.filter((l) => l !== hauptbeispiel);

/**
 * Listing, das der Link "Beispiel ansehen" einer Preiskachel öffnet
 * (`fotoklassen[].beispiel`), `undefined` wenn keins oder nicht freigegeben.
 */
export const beispielFuerPreisklasse = (key) => {
  const k = fotoklassen.find((x) => x.key === key);
  return k && k.beispiel ? listingZu(k.beispiel) : undefined;
};

/** Anker eines Listings, öffnet beim Laden die Galerie: #beispiel-<slug> */
export const anker = (slug) => `beispiel-${slug}`;

/** Slug aus einem Anker wie "#beispiel-wohnung-lauf", nur für freigegebene Listings. */
export function slugAusAnker(hash) {
  const m = /^#?beispiel-([a-z0-9-]+)$/.exec(hash || '');
  return m && nachSlug.has(m[1]) ? m[1] : null;
}

/** Alt-Text: Raum + Listing-Titel. */
export const altText = (listing, bild) =>
  `${bild.raum} – Beispiel-Inserat ${listing.titel.replace(' · ', ', ')}`;

/**
 * Meta-Zeile wie auf Karte und in der Großansicht, z. B.
 * ["19 Bilder", "Auswahl aus 24 gelieferten Bildern", "inkl. Drohnenaufnahmen"].
 */
export function metaZeile(listing) {
  const n = listing.bilder.length;
  const teile = [`${n} Bilder`];
  if (listing.bilder_geliefert && n < listing.bilder_geliefert) {
    teile.push(`Auswahl aus ${listing.bilder_geliefert} gelieferten Bildern`);
  }
  listing.extras.forEach((x) => teile.push(`inkl. ${x}`));
  return teile;
}
