/**
 * Erzeugt den <head>-Inhalt je Seite für den Prerender: Title, Meta
 * Description, Canonical, Robots, Open Graph, Twitter und JSON-LD.
 *
 * Das JSON-LD ist ein @graph mit stabilen @id-Werten. Es enthält nur
 * Angaben, die auch sichtbar auf der Seite stehen: Unternehmen, Person,
 * die Leistung Immobilienfotografie mit den drei Objektklassen und den
 * Zusatzleistungen (Drohnenaufnahmen, Objekt-Kurzvideo). Keine Social-
 * oder Staging-Angebote.
 */
import { SEITEN } from './seiten.js';
import { SITE_URL, fotoklassen, ergaenzungen, kontakt } from '../content/site.js';

const OG_BILD = `${SITE_URL}/og-immobilienfotografie-mittelbaden.jpg`;
const ID = {
  business: `${SITE_URL}/#quadratblick`,
  person: `${SITE_URL}/#fabian-schneebiegl`,
  website: `${SITE_URL}/#website`,
  foto: `${SITE_URL}/#immobilienfotografie`,
  drohne: `${SITE_URL}/#drohnenaufnahmen`,
  kurzvideo: `${SITE_URL}/#objekt-kurzvideo`,
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function netto(betrag) {
  return {
    '@type': 'UnitPriceSpecification',
    price: betrag,
    priceCurrency: 'EUR',
    valueAddedTaxIncluded: false,
  };
}

function graph(key) {
  const seite = SEITEN[key];
  const knoten = [
    {
      '@type': 'ProfessionalService',
      '@id': ID.business,
      name: 'Quadratblick',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/quadratblick-logo.png`,
      image: OG_BILD,
      description: 'Immobilienfotografie für Makler in Bühl, Baden-Baden, Achern und Mittelbaden.',
      email: kontakt.email,
      telephone: '+49 159 0469 2843',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Winkel 8',
        postalCode: '77815',
        addressLocality: 'Bühl',
        addressRegion: 'Baden-Württemberg',
        addressCountry: 'DE',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 48.6959, longitude: 8.1351 },
      areaServed: [
        { '@type': 'City', name: 'Bühl' },
        { '@type': 'City', name: 'Baden-Baden' },
        { '@type': 'City', name: 'Achern' },
        { '@type': 'AdministrativeArea', name: 'Mittelbaden' },
      ],
      founder: { '@id': ID.person },
      sameAs: [kontakt.instagram],
      makesOffer: [{ '@id': `${ID.foto}-angebote` }, ...ergaenzungen.map((e) => ({ '@id': `${ID[e.key]}-angebot` }))],
    },
    {
      '@type': 'Person',
      '@id': ID.person,
      name: 'Fabian Schneebiegl',
      worksFor: { '@id': ID.business },
      workLocation: { '@type': 'Place', name: 'Bühl' },
    },
    {
      '@type': 'WebSite',
      '@id': ID.website,
      url: `${SITE_URL}/`,
      name: 'Quadratblick',
      inLanguage: 'de-DE',
      publisher: { '@id': ID.business },
    },
    {
      '@type': 'Service',
      '@id': ID.foto,
      name: 'Immobilienfotografie',
      serviceType: 'Immobilienfotografie',
      description: 'Innen- und Außenaufnahmen für Exposés und Immobilienportale.',
      provider: { '@id': ID.business },
      areaServed: { '@type': 'AdministrativeArea', name: 'Mittelbaden' },
      url: `${SITE_URL}/`,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        '@id': `${ID.foto}-angebote`,
        name: 'Immobilienfotografie nach Objektklasse',
        itemListElement: fotoklassen.map((k) => ({
          '@type': 'Offer',
          name: `Immobilienfotografie ${k.name}`,
          description: `${k.beschreibung} ${k.bilder}.`,
          price: k.foto,
          priceCurrency: 'EUR',
          priceSpecification: netto(k.foto),
          url: `${SITE_URL}/`,
        })),
      },
    },
    ...ergaenzungen.map((e) => ({
      '@type': 'Service',
      '@id': ID[e.key],
      name: e.name,
      serviceType: e.name,
      description: 'Optionale Zusatzleistung zur Immobilienfotografie.',
      provider: { '@id': ID.business },
      offers: {
        '@type': 'Offer',
        '@id': `${ID[e.key]}-angebot`,
        name: `${e.name} als Zusatzleistung`,
        price: e.preis,
        priceCurrency: 'EUR',
        priceSpecification: netto(e.preis),
        url: `${SITE_URL}/`,
      },
    })),
  ];

  if (seite.pfad !== '/') {
    knoten.push({
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}${seite.pfad}#brotkrumen`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: seite.name, item: `${SITE_URL}${seite.pfad}` },
      ],
    });
  }
  return { '@context': 'https://schema.org', '@graph': knoten };
}

export function headHtml(key) {
  const s = SEITEN[key];
  const url = `${SITE_URL}${s.pfad}`;
  const indexierbar = s.index !== false;
  const zeilen = [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}">`,
    indexierbar
      ? `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
      : `<meta name="robots" content="noindex, follow">`,
    indexierbar ? `<link rel="canonical" href="${url}">` : '',
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:site_name" content="Quadratblick">`,
    `<meta property="og:title" content="${esc(s.title)}">`,
    `<meta property="og:description" content="${esc(s.description)}">`,
    indexierbar ? `<meta property="og:url" content="${url}">` : '',
    `<meta property="og:image" content="${OG_BILD}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Wohnhaus mit Holzfassade, Immobilienaufnahme von Quadratblick">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(s.title)}">`,
    `<meta name="twitter:description" content="${esc(s.description)}">`,
    `<meta name="twitter:image" content="${OG_BILD}">`,
  ];
  if (indexierbar) {
    const json = JSON.stringify(graph(key)).replace(/</g, '\\u003c');
    zeilen.push(`<script type="application/ld+json">${json}</script>`);
  }
  return zeilen.filter(Boolean).join('\n  ');
}
