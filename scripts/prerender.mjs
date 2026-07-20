// Post-build prerender (SSG): renders <App /> to static HTML and injects it
// into #root of dist/index.html. Pure Node — no headless browser — so it runs
// safely in the Netlify build. The client still fully renders via main.jsx.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const distIndex = resolve('dist/index.html');
const ssrEntry = resolve('dist-ssr/entry-server.js');

const { render } = await import(pathToFileURL(ssrEntry).href);
const appHtml = render();

let html = readFileSync(distIndex, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) {
  console.error('[prerender] #root marker not found in dist/index.html — aborting.');
  process.exit(1);
}
html = html.replace(marker, `<div id="root">${appHtml}</div>`);
writeFileSync(distIndex, html, 'utf8');

// Clean up the SSR-only build output.
rmSync('dist-ssr', { recursive: true, force: true });

console.log(`[prerender] Injected ${appHtml.length} chars of prerendered markup into dist/index.html`);
