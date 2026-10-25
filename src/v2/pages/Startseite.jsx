import { PageShell } from '../Shell.jsx';
import { Hero } from '../sections/Hero.jsx';
import { StatBar } from '../sections/StatBar.jsx';
import { LeistungenVorschau } from '../sections/LeistungenVorschau.jsx';
import { LogoSektion } from '../sections/LogoBand.jsx';
import { Referenzen } from '../sections/Referenzen.jsx';
import { WarumQuadratblick } from '../sections/WarumQuadratblick.jsx';
import { Preise } from '../sections/Preise.jsx';
import { Ablauf } from '../sections/Ablauf.jsx';
import { Zusammenarbeit } from '../sections/Zusammenarbeit.jsx';
import { Faq } from '../sections/Faq.jsx';
import { Kontakt } from '../sections/Kontakt.jsx';

/**
 * Startseite als Onepager. Ein Anfrageweg für Neukunden: alle Anfrage-
 * Buttons führen zum Formular in #kontakt. Der mehrstufige Konfigurator
 * steht für bestehende Kunden auf /objekt-anfragen.
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
      <Ablauf />
      <Zusammenarbeit />
      <Faq />
      <Kontakt />
    </PageShell>
  );
}
