import { renderToStaticMarkup } from 'react-dom/server';
import StartPage from './v2/pages/Start.jsx';
import ObjektcontentPage from './v2/pages/Objektcontent.jsx';
import MarkeSocialPage from './v2/pages/MarkeSocial.jsx';
import ReferenzenPage from './v2/pages/Referenzen.jsx';
import UeberUnsPage from './v2/pages/UeberUns.jsx';

const PAGES = {
  start: StartPage,
  objektcontent: ObjektcontentPage,
  marke: MarkeSocialPage,
  referenzen: ReferenzenPage,
  ueber: UeberUnsPage,
};

// Server entry used only at build time (SSG prerender). Produces the static
// markup that is injected into #root of each page's dist HTML so crawlers and
// the first paint get real content. The client then renders the live,
// interactive app via its page entry as usual.
export function render(page = 'start') {
  const Page = PAGES[page] || StartPage;
  return renderToStaticMarkup(<Page />);
}
