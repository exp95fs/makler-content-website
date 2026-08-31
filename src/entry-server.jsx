import { renderToStaticMarkup } from 'react-dom/server';
import Onepage from './v2/Onepage.jsx';

// Nur zur Buildzeit (SSG-Prerender): erzeugt das statische Markup,
// das in dist/index.html in #root eingesetzt wird.
export function render() {
  return renderToStaticMarkup(<Onepage />);
}
