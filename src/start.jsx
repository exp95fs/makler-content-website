import { hydrateRoot } from 'react-dom/client';
import App from './v2/App.jsx';
import { seiteZuPfad } from './v2/seiten.js';

// Hydration der vorgerenderten Seite. Wird von main.jsx erst nach dem
// ersten Paint dynamisch geladen.
// Bewusst ohne StrictMode: GSAP/Lenis werden einmalig initialisiert,
// ein Doppelmount würde ScrollTrigger doppelt anlegen.
const root = document.getElementById('root');
const seite = root.dataset.seite || seiteZuPfad(window.location.pathname);
hydrateRoot(root, <App seite={seite} />);
