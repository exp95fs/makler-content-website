import { renderToStaticMarkup } from 'react-dom/server';
import AppV2 from './v2/AppV2.jsx';

// Server entry used only at build time (SSG prerender). Produces the static
// markup that is injected into #root in dist/index.html so crawlers and the
// first paint get real content. The client (main.jsx) then renders the live,
// interactive app via createRoot as usual.
export function render() {
  return renderToStaticMarkup(<AppV2 />);
}
