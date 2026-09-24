import './styles/tokens/fonts.css';
import './v2/v2.css';

// Einstiegspunkt. Enthält nur die Styles, damit sie wie gewohnt als
// <link rel="stylesheet"> im <head> landen.
//
// Jede Seite ist vollständig vorgerendert und ohne JavaScript lesbar. Die
// App (React, GSAP, Lenis) wird erst geladen, wenn der Browser den ersten
// Inhalt gemalt hat. So verzögert das Auswerten des Bundles den Largest
// Contentful Paint (Hero-H1) nicht.
const starten = () => import('./start.jsx');
if ('requestIdleCallback' in window) window.requestIdleCallback(starten, { timeout: 1200 });
else window.setTimeout(starten, 60);
