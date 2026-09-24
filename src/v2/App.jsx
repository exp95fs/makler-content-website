import { Startseite } from './pages/Startseite.jsx';
import { Immobilienfotografie } from './pages/Immobilienfotografie.jsx';
import { ReferenzenSeite } from './pages/ReferenzenSeite.jsx';
import { PreiseSeite } from './pages/PreiseSeite.jsx';
import { UeberSeite } from './pages/UeberSeite.jsx';
import { AnfrageSeite } from './pages/AnfrageSeite.jsx';
import { NichtGefunden } from './pages/NichtGefunden.jsx';

/** Seitenschlüssel aus seiten.js -> Komponente. */
export const KOMPONENTEN = {
  start: Startseite,
  immobilienfotografie: Immobilienfotografie,
  referenzen: ReferenzenSeite,
  preise: PreiseSeite,
  ueber: UeberSeite,
  anfrage: AnfrageSeite,
  nichtGefunden: NichtGefunden,
};

export default function App({ seite }) {
  const Seite = KOMPONENTEN[seite] || NichtGefunden;
  return <Seite />;
}
