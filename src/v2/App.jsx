import { Startseite } from './pages/Startseite.jsx';
import { NichtGefunden } from './pages/NichtGefunden.jsx';
import { ObjektAnfragen } from './pages/ObjektAnfragen.jsx';

/** Seitenschlüssel aus seiten.js -> Komponente. */
export const KOMPONENTEN = {
  start: Startseite,
  objektAnfragen: ObjektAnfragen,
  nichtGefunden: NichtGefunden,
};

export default function App({ seite }) {
  const Seite = KOMPONENTEN[seite] || NichtGefunden;
  return <Seite />;
}
