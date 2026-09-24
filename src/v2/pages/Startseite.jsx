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
import { Marke } from '../sections/Marke.jsx';
import { Faq, FRAGEN_START } from '../sections/Faq.jsx';
import { Kontakt } from '../sections/Kontakt.jsx';

/**
 * Startseite als Onepager, Sektionsfolge wie im bisherigen Onepager.
 * Preise und Buchung stehen unmittelbar hintereinander, damit aus der
 * Preisübersicht direkt angefragt werden kann; der Ablauf folgt darauf.
 * Die Unterseiten bleiben als vertiefende Seiten erreichbar (Textlinks
 * in den Sektionen und im Footer).
 */
export function Startseite() {
  return (
    <PageShell seite="start">
      <Hero />
      <StatBar />
      <LeistungenVorschau />
      <LogoSektion />
      <Referenzen variante="start" />
      <WarumQuadratblick />
      <Preise />
      <Booking kopf />
      <Ablauf />
      <Marke />
      <Faq quelle={FRAGEN_START} eyebrow="Häufige Fragen" titel="Damit keine Fragen offen bleiben."
           fragen={Object.keys(FRAGEN_START)} />
      <Kontakt variante="start" />
    </PageShell>
  );
}
