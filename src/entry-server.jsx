import { renderToString } from 'react-dom/server';
import App from './v2/App.jsx';
import { SEITEN } from './v2/seiten.js';
import { headHtml } from './v2/head.js';
import { SITE_URL } from './content/site.js';

// Nur zur Buildzeit (SSG-Prerender). renderToString statt
// renderToStaticMarkup, weil der Client das Markup hydriert.
export function render(seite) {
  return renderToString(<App seite={seite} />);
}
export { SEITEN, headHtml, SITE_URL };
