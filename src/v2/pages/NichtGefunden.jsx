import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { SEITEN } from '../seiten.js';

export function NichtGefunden() {
  return (
    <PageShell seite="nichtGefunden">
      <SeitenKopf
        kompakt
        eyebrow="Fehler 404"
        titel="Seite nicht gefunden"
        einleitung="Diese Seite gibt es nicht oder nicht mehr. Hier geht es weiter:"
      >
        <ul className="qb-404-links">
          {['start', 'immobilienfotografie', 'referenzen', 'preise', 'anfrage'].map((k) => (
            <li key={k}><a href={SEITEN[k].pfad}>{SEITEN[k].name}</a></li>
          ))}
        </ul>
      </SeitenKopf>
    </PageShell>
  );
}
