import { PageShell } from './Shell.jsx';
import { Hero } from './sections/Hero.jsx';
import { LogoBand } from './sections/LogoBand.jsx';
import { Stufen } from './sections/Stufen.jsx';
import { Objektcontent } from './sections/Objektcontent.jsx';
import { Segmente } from './sections/Segmente.jsx';
import { MarkeSocial } from './sections/MarkeSocial.jsx';
import { Warum } from './sections/Warum.jsx';
import { Referenzen } from './sections/Referenzen.jsx';
import { Ablauf } from './sections/Ablauf.jsx';
import { UeberMich } from './sections/UeberMich.jsx';
import { Faq } from './sections/Faq.jsx';
import { Anfrage } from './sections/Anfrage.jsx';

export default function Onepage() {
  return (
    <PageShell dark>
      <Hero />
      <LogoBand />
      <Stufen />
      <Objektcontent />
      <Segmente />
      <MarkeSocial />
      <Warum />
      <Referenzen />
      <Ablauf />
      <UeberMich />
      <Faq />
      <Anfrage />
    </PageShell>
  );
}
