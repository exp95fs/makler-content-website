import { PageShell } from './Shell.jsx';
import { Hero } from './sections/Hero.jsx';
import { LogoBand } from './sections/LogoBand.jsx';
import { Benefits } from './sections/Benefits.jsx';
import { Pakete } from './sections/Pakete.jsx';
import { Segmente } from './sections/Segmente.jsx';
import { Marke } from './sections/Marke.jsx';
import { Usp } from './sections/Usp.jsx';
import { Prozess } from './sections/Prozess.jsx';
import { Referenzen } from './sections/Referenzen.jsx';
import { UeberMich } from './sections/UeberMich.jsx';
import { Fork } from './sections/Fork.jsx';
import { Anfrage } from './sections/Anfrage.jsx';
import { Faq } from './sections/Faq.jsx';
import { Kontakt } from './sections/Kontakt.jsx';

/**
 * Sektionsfolge der Live-Seite. Zwei Abweichungen: das Kennzahlenband
 * unter dem Hero entfällt, an seiner Stelle stehen die Kundenlogos.
 */
export default function Onepage() {
  return (
    <PageShell dark>
      <Hero />
      <LogoBand />
      <Benefits />
      <Pakete />
      <Segmente />
      <Marke />
      <Usp />
      <Prozess />
      <Referenzen />
      <UeberMich />
      <Fork />
      <Anfrage />
      <Faq />
      <Kontakt />
    </PageShell>
  );
}
