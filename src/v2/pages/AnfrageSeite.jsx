import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { Booking } from '../sections/Booking.jsx';
import { Kontakt } from '../sections/Kontakt.jsx';

export function AnfrageSeite() {
  return (
    <PageShell seite="anfrage">
      <SeitenKopf
        kompakt
        eyebrow="Projekt anfragen"
        titel="Verfügbarkeit für Ihr Objekt prüfen"
        einleitung="Wählen Sie Objektklasse, gewünschten Zeitraum und mögliche Zusatzleistung. Sie erhalten anschließend eine persönliche Bestätigung zu Termin, Leistungsumfang und Preis. Erst diese Bestätigung macht die Anfrage verbindlich."
      />
      <Booking />
      <Kontakt />
    </PageShell>
  );
}
