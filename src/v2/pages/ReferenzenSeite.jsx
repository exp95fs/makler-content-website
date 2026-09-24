import { useEffect } from 'react';
import { PageShell } from '../Shell.jsx';
import { SeitenKopf } from '../sections/SeitenKopf.jsx';
import { Referenzen } from '../sections/Referenzen.jsx';
import { LogoBand } from '../sections/LogoBand.jsx';
import { Abschluss } from '../sections/Abschluss.jsx';
import { track } from '../tracking.js';

export function ReferenzenSeite() {
  useEffect(() => { track('referenzen_aufruf', { ansicht: 'seite' }); }, []);
  return (
    <PageShell seite="referenzen">
      <SeitenKopf
        kompakt
        eyebrow="Referenzen"
        titel="Ausgewählte Immobilien­projekte"
        einleitung="Aufnahmen aus regionalen Projekten, nach Objekt gruppiert. Die Bildunterschriften beschreiben, was auf den Aufnahmen zu sehen ist."
      />
      <Referenzen />
      <section className="v2-sec tight bg-linen-2" aria-label="Regionale Immobilienanbieter">
        <div className="v2-wrap">
          <LogoBand />
        </div>
      </section>
      <Abschluss />
    </PageShell>
  );
}
