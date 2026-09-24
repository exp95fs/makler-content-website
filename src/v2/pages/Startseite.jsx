import { PageShell } from '../Shell.jsx';
import { Hero } from '../sections/Hero.jsx';
import { Vertrauen } from '../sections/Vertrauen.jsx';
import { ReferenzTeaser } from '../sections/ReferenzTeaser.jsx';
import { KernLeistung } from '../sections/KernLeistung.jsx';
import { Vorteile } from '../sections/Vorteile.jsx';
import { Prozess } from '../sections/Prozess.jsx';
import { PreisUebersicht } from '../sections/PreisUebersicht.jsx';
import { Zusammenarbeit } from '../sections/Zusammenarbeit.jsx';
import { AboutTeaser } from '../sections/AboutTeaser.jsx';
import { Faq } from '../sections/Faq.jsx';
import { Abschluss } from '../sections/Abschluss.jsx';

/** Startseite, Reihenfolge wie freigegeben. */
export function Startseite() {
  return (
    <PageShell seite="start">
      <Hero />
      <Vertrauen />
      <ReferenzTeaser />
      <KernLeistung />
      <Vorteile />
      <Prozess bg="bg-linen" />
      <PreisUebersicht bg="bg-linen-2" />
      <Zusammenarbeit />
      <AboutTeaser bg="bg-linen" />
      <Faq fragen={['kosten', 'anwesenheit', 'bereitstellung', 'video']} />
      <Abschluss />
    </PageShell>
  );
}
