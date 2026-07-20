import { createRoot } from 'react-dom/client';
import AppV2 from './v2/AppV2.jsx';
import './styles/tokens/fonts.css';
import './v2/v2.css';

// Hinweis: bewusst ohne StrictMode — die GSAP/Lenis-Effekte werden einmal
// initialisiert; StrictMode-Doppelmount würde ScrollTrigger doppelt anlegen.
createRoot(document.getElementById('root')).render(<AppV2 />);
