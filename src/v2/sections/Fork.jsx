import { Split, Magnetic, scrollToId } from '../fx.jsx';
import { Arrow } from '../ui.jsx';

/** "Zwei Wege" von der Live-Seite. Texte wörtlich übernommen. */
export function Fork() {
  return (
    <section className="v2-sec bg-linen-2" id="start">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Bereit für Ihr Objekt?</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Zwei Wege – Sie wählen, was zu Ihnen passt.
          </Split>
          <p className="v2-lead" data-reveal>
            Noch unsicher oder erst kennenlernen? Schreiben Sie uns kurz. Sie wissen schon, was Sie
            brauchen? Dann direkt zum Wunschtermin.
          </p>
        </div>

        <div className="v2-fork-grid">
          <div className="v2-fork-card" data-reveal>
            <span className="v2-fork-badge">Neu hier? · Unverbindlich</span>
            <h3>Kurz kennenlernen</h3>
            <p>
              Sie wollen erst Fragen klären oder uns kennenlernen? Schreiben Sie uns kurz über das
              Kontaktformular, unverbindlich und ohne Terminzwang. Wir melden uns persönlich.
            </p>
            <Magnetic>
              <button type="button" className="v2-btn ghost" onClick={() => scrollToId('anfrage')}>
                Nachricht schreiben
              </button>
            </Magnetic>
            <div className="v2-fork-meta"><span className="dot" />Ideal für neue Interessenten</div>
          </div>

          <div className="v2-fork-card dark" data-reveal data-delay="0.12">
            <span className="v2-fork-badge">Sie wissen, was Sie brauchen?</span>
            <h3>Objekt-Termin direkt anfragen</h3>
            <p>
              Sie kennen uns bereits oder wissen genau, was Ihr Objekt braucht? Stellen Sie in
              wenigen Schritten Ihr Paket zusammen und fragen Sie direkt einen Wunschtermin an.
              Die Anfrage ist unverbindlich, wir bestätigen persönlich.
            </p>
            <Magnetic>
              <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
                Paket &amp; Termin wählen <Arrow />
              </button>
            </Magnetic>
            <div className="v2-fork-meta"><span className="dot" />Ideal für Bestandskunden &amp; Entschlossene</div>
          </div>
        </div>
      </div>
    </section>
  );
}
