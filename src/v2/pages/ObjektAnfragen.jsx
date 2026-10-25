import { PageShell } from '../Shell.jsx';
import { Booking } from '../sections/Booking.jsx';

/**
 * Anfrage für bestehende Kunden: der mehrstufige Konfigurator (Objektklasse,
 * Ergänzung, Termin, Kontakt, Prüfen) als eigene Seite. Nicht in Navigation
 * und Sitemap, noindex (seiten.js); verlinkt nur aus der Sektion
 * "Regelmäßige Zusammenarbeit" und direkt an Kunden.
 */
export function ObjektAnfragen() {
  return (
    <PageShell seite="objektAnfragen">
      <Booking />
    </PageShell>
  );
}
