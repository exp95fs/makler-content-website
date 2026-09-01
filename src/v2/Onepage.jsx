import { PageShell } from './Shell.jsx';
import { Hero } from './sections/Hero.jsx';
import { StatBar } from './sections/StatBar.jsx';
import { LogoBand } from './sections/LogoBand.jsx';
import { Pakete } from './sections/Pakete.jsx';
import { Segmente } from './sections/Segmente.jsx';
import { Marke } from './sections/Marke.jsx';
import { Benefits } from './sections/Benefits.jsx';
import { Usp } from './sections/Usp.jsx';
import { Prozess } from './sections/Prozess.jsx';
import { Referenzen } from './sections/Referenzen.jsx';
import { UeberMich } from './sections/UeberMich.jsx';
import { Fork } from './sections/Fork.jsx';
import { Booking } from './sections/Booking.jsx';
import { Faq } from './sections/Faq.jsx';
import { Kontakt } from './sections/Kontakt.jsx';

/**
 * Leistungen stehen vorn, die Argumentation folgt dahinter.
 */
export default function Onepage() {
  return (
    <PageShell dark>
      <Hero />
      <StatBar />
      <LogoBand />
      <Pakete />
      <Segmente />
      <Marke />
      <Benefits />
      <Usp />
      <Prozess />
      <Referenzen />
      <UeberMich />
      <Fork />
      <Booking />
      <Faq />
      <Kontakt />
    </PageShell>
  );
}
