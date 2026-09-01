import { PageShell } from './Shell.jsx';
import { Hero } from './sections/Hero.jsx';
import { StatBar } from './sections/StatBar.jsx';
import { LeistungenVorschau } from './sections/LeistungenVorschau.jsx';
import { LogoBand } from './sections/LogoBand.jsx';
import { Referenzen } from './sections/Referenzen.jsx';
import { WarumQuadratblick } from './sections/WarumQuadratblick.jsx';
import { Preise } from './sections/Preise.jsx';
import { Booking } from './sections/Booking.jsx';
import { Marke } from './sections/Marke.jsx';
import { UeberMich } from './sections/UeberMich.jsx';
import { Prozess } from './sections/Prozess.jsx';
import { Faq } from './sections/Faq.jsx';
import { Kontakt } from './sections/Kontakt.jsx';

/**
 * Verbindliche Sektionsfolge. Preise und Buchung stehen unmittelbar
 * hintereinander, damit aus der Preisübersicht direkt gebucht werden kann.
 */
export default function Onepage() {
  return (
    <PageShell dark>
      <Hero />
      <StatBar />
      <LeistungenVorschau />
      <LogoBand />
      <Referenzen />
      <WarumQuadratblick />
      <Preise />
      <Booking />
      <Marke />
      <UeberMich />
      <Prozess />
      <Faq />
      <Kontakt />
    </PageShell>
  );
}
