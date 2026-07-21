// Post-build prerender (SSG): renders every page to static HTML and injects it
// into #root of the corresponding dist HTML file. Pure Node — no headless
// browser — so it runs safely in the Netlify build.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const ssrEntry = resolve('dist-ssr/entry-server.js');
const { render } = await import(pathToFileURL(ssrEntry).href);

const PAGES = [
  ['start', 'dist/index.html'],
  ['objektcontent', 'dist/objektcontent/index.html'],
  ['marke', 'dist/marke-und-social/index.html'],
  ['referenzen', 'dist/referenzen/index.html'],
  ['ueber', 'dist/ueber-uns/index.html'],
];

const marker = '<div id="root"></div>';
for (const [page, file] of PAGES) {
  const path = resolve(file);
  let html = readFileSync(path, 'utf8');
  if (!html.includes(marker)) {
    console.error(`[prerender] #root marker not found in ${file} — aborting.`);
    process.exit(1);
  }
  const appHtml = render(page);
  html = html.replace(marker, `<div id="root">${appHtml}</div>`);
  writeFileSync(path, html, 'utf8');
  console.log(`[prerender] ${file}: ${appHtml.length} chars injected`);
}

// Clean up the SSR-only build output.
rmSync('dist-ssr', { recursive: true, force: true });
