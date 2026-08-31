import { createRoot } from 'react-dom/client';
import Onepage from './v2/Onepage.jsx';
import './styles/tokens/fonts.css';
import './v2/v2.css';

// Bewusst ohne StrictMode: GSAP/Lenis werden einmalig initialisiert,
// ein Doppelmount würde ScrollTrigger doppelt anlegen.
createRoot(document.getElementById('root')).render(<Onepage />);
