import bilder from '../content/bilder.json';

/* Kleine geteilte UI-Bausteine, die von mehreren Seiten genutzt werden. */

export function Arrow({ size = 16 }) {
  return (
    <svg className="arr" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function InstagramGlyph({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.2" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* ---------- Responsive Bilder ---------- */

/**
 * <picture> mit AVIF und WebP in mehreren Breiten, JPEG als Fallback.
 * Varianten und Maße kommen aus src/content/bilder.json (erzeugt von
 * scripts/bilder.py). `sizes` beschreibt die tatsächlich dargestellte
 * Breite, damit der Browser auf kleinen Bildschirmen kleine Dateien lädt.
 *
 * `vorrang`: für das Bild im ersten Sichtbereich (LCP). Lädt sofort und
 * mit hoher Priorität. Alle anderen Bilder laden lazy.
 */
export function Bild({ src, alt, sizes = '100vw', vorrang = false, className, ...rest }) {
  const m = bilder[src];
  const laden = vorrang
    ? { loading: 'eager', fetchpriority: 'high', decoding: 'async' }
    : { loading: 'lazy', decoding: 'async' };
  if (!m) return <img src={src} alt={alt} className={className} {...laden} {...rest} />;
  const set = (ext) => m.breiten.map((b) => `${m.basis}-${b}.${ext} ${b}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img src={`${m.basis}-${m.fallback}.jpg`} alt={alt} width={m.width} height={m.height}
           className={className} {...laden} {...rest} />
    </picture>
  );
}

/**
 * Referenzaufnahme als ganzflächiger Hintergrund einer Sektion, mit einer
 * halbtransparenten Fläche in der Sektionsfarbe darüber (siehe .qb-hg in
 * v2.css). Rein dekorativ: leerer Alt-Text, für Screenreader verborgen,
 * lädt lazy und läuft mit leichtem Parallax.
 */
export function HintergrundBild({ src }) {
  return (
    <div className="qb-hg" aria-hidden="true">
      <Bild src={src} alt="" sizes="100vw" data-parallax="8" />
    </div>
  );
}
