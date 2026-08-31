// Post-Build-Prerender (SSG): rendert den Onepager und setzt das Markup
// in #root von dist/index.html ein. Reines Node, kein Headless-Browser.
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const { render } = await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const path = resolve('dist/index.html');
const marker = '<div id="root"></div>';

let html = readFileSync(path, 'utf8');
if (!html.includes(marker)) {
  console.error('[prerender] #root nicht gefunden in dist/index.html');
  process.exit(1);
}
const app = render();
writeFileSync(path, html.replace(marker, `<div id="root">${app}</div>`), 'utf8');
console.log(`[prerender] ${app.length} Zeichen eingesetzt`);

rmSync('dist-ssr', { recursive: true, force: true });
