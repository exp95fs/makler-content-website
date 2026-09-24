import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { PreisUebersicht } from '../sections/PreisUebersicht.jsx';

export function PreiseSeite() {
  return (
    <PageShell seite="preise">
      <SeitenKopf
        kompakt
        eyebrow="Preise"
        titel="Transparente Preise für Immobilien­fotografie"
        einleitung="Wählen Sie die passende Objektklasse und senden Sie Ihre Projektanfrage. Nach einer kurzen Prüfung erhalten Sie eine persönliche Bestätigung zu Leistungsumfang, Preis und Termin."
      />
      <PreisUebersicht variante="seite" />
    </PageShell>
  );
}
