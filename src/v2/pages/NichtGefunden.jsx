import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';

/** Ziele auf der Startseite (die Website ist ein Onepager). */
const ZIELE = [
  ['/', 'Startseite'],
  ['/#leistungen', 'Leistungen'],
  ['/#referenzen', 'Referenzen'],
  ['/#preise', 'Preise'],
  ['/#booking', 'Objekt anfragen'],
];

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
          {ZIELE.map(([href, text]) => (
            <li key={href}><a href={href}>{text}</a></li>
          ))}
        </ul>
      </SeitenKopf>
    </PageShell>
  );
}
