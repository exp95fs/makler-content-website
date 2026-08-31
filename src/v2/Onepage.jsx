import { PageShell } from './Shell.jsx';
import { Hero } from './sections/Hero.jsx';
import { LogoBand } from './sections/LogoBand.jsx';
import { Preise } from './sections/Preise.jsx';
import { Umfang } from './sections/Umfang.jsx';
import { Warum } from './sections/Warum.jsx';
import { Referenzen } from './sections/Referenzen.jsx';
import { MarkeSocial } from './sections/MarkeSocial.jsx';
import { Ablauf } from './sections/Ablauf.jsx';
import { UeberMich } from './sections/UeberMich.jsx';
import { Faq } from './sections/Faq.jsx';
import { Anfrage } from './sections/Anfrage.jsx';

/**
 * Reihenfolge folgt der Frage, die der Besucher zuerst stellt:
 * Was bekomme ich und was kostet es, dann warum hier, dann Beleg,
 * dann Ausblick, dann Ablauf und Anfrage.
 */
export default function Onepage() {
  return (
    <PageShell dark>
      <Hero />
      <LogoBand />
      <Preise />
      <Umfang />
      <Warum />
      <Referenzen />
      <MarkeSocial />
      <Ablauf />
      <UeberMich />
      <Faq />
      <Anfrage />
    </PageShell>
  );
}
