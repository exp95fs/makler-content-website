// Post-Build-Prerender (SSG): rendert jede Seite aus src/v2/seiten.js in
// eine eigene HTML-Datei mit seitenspezifischem <head>, schreibt 404.html
// und erzeugt die Sitemap aus den indexierbaren Seiten.
// Reines Node, kein Headless-Browser.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const { render, SEITEN, headHtml, SITE_URL } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);

// Das Einstiegsskript ist klein und nicht render-kritisch: niedrige
// Priorität, damit CSS, Schriften und Hero-Bild die Bandbreite zuerst bekommen.
const vorlage = readFileSync(resolve('dist/index.html'), 'utf8')
  .replace('<script type="module" crossorigin src=', '<script type="module" fetchpriority="low" crossorigin src=');
for (const marke of ['<!--app-head-->', '<!--app-preload-->', '<div id="root"></div>']) {
  if (!vorlage.includes(marke)) {
    console.error(`[prerender] Marke fehlt in dist/index.html: ${marke}`);
    process.exit(1);
  }
}

// Die zwei Schnitte, die im sichtbaren Bereich zuerst gebraucht werden,
// vorab laden: Überschriften (Jakarta 600) und Fließtext (Mulish 400).
const assets = readdirSync(resolve('dist/assets'));
const schrift = (muster) => assets.find((f) => f.startsWith(muster) && f.endsWith('.woff2'));
const preload = ['plus-jakarta-sans-latin-600-normal', 'mulish-latin-400-normal']
  .map(schrift).filter(Boolean)
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin>`)
  .join('\n  ');

const sitemap = [];
const heute = new Date().toISOString().slice(0, 10);

for (const [key, seite] of Object.entries(SEITEN)) {
  const app = render(key);
  const html = vorlage
    .replace('<!--app-head-->', headHtml(key))
    .replace('<!--app-preload-->', preload)
    .replace('<div id="root"></div>', `<div id="root" data-seite="${key}">${app}</div>`);

  const ziel = seite.pfad.endsWith('.html')
    ? resolve('dist' + seite.pfad)
    : resolve('dist' + seite.pfad, 'index.html');
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, html, 'utf8');
  console.log(`[prerender] ${seite.pfad} (${app.length} Zeichen)`);

  if (seite.index !== false) sitemap.push(`${SITE_URL}${seite.pfad}`);
}

writeFileSync(resolve('dist/sitemap.xml'), [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemap.map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${heute}</lastmod>\n  </url>`),
  '</urlset>',
  '',
].join('\n'), 'utf8');
console.log(`[prerender] sitemap.xml mit ${sitemap.length} URLs`);

rmSync('dist-ssr', { recursive: true, force: true });
