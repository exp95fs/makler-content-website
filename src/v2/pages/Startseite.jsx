import { PageShell } from '../Shell.jsx';
import { Hero } from '../sections/Hero.jsx';
import { StatBar } from '../sections/StatBar.jsx';
import { LeistungenVorschau } from '../sections/LeistungenVorschau.jsx';
import { LogoSektion } from '../sections/LogoBand.jsx';
import { Referenzen } from '../sections/Referenzen.jsx';
import { WarumQuadratblick } from '../sections/WarumQuadratblick.jsx';
import { Preise } from '../sections/Preise.jsx';
import { Booking } from '../sections/Booking.jsx';
import { Ablauf } from '../sections/Ablauf.jsx';
import { RegelmaessigeZusammenarbeit } from '../sections/RegelmaessigeZusammenarbeit.jsx';
import { Faq } from '../sections/Faq.jsx';
import { Kontakt } from '../sections/Kontakt.jsx';

/**
 * Startseite als Onepager, Sektionsfolge wie im bisherigen Onepager.
 * Preise und Buchung stehen unmittelbar hintereinander, damit aus der
 * Preisübersicht direkt angefragt werden kann; der Ablauf folgt darauf.
 * Die früheren Unterseiten leiten per 301 auf die passenden Abschnitte
 * weiter (netlify.toml).
 */
export function Startseite() {
  return (
    <PageShell seite="start">
      <Hero />
      <StatBar />
      <LeistungenVorschau />
      <LogoSektion />
      <Referenzen />
      <WarumQuadratblick />
      <Preise />
      <Booking />
      <Ablauf />
      <RegelmaessigeZusammenarbeit />
      <Faq />
      <Kontakt />
    </PageShell>
  );
}
