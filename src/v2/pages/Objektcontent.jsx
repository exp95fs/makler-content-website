import { Magnetic, scrollToId } from '../fx.jsx';
import { PageShell, SubHero, CrossLink } from '../Shell.jsx';
import { Arrow } from '../ui.jsx';
import { Pakete, Segments } from '../StorySections.jsx';
import { Usp, Process } from '../BizSections.jsx';
import { Fork, Faq, Contact } from '../CloseSections.jsx';
import { BookingV2 } from '../BookingV2.jsx';

export default function ObjektcontentPage() {
  return (
    <PageShell active="objektcontent" dark>
      <SubHero
        eyebrow="Objektcontent · Einzelaufträge pro Immobilie"
        title="Objekt-Content, der Ihre Inserate heraushebt."
        lead="Professionelle Immobilienfotografie, Objektfilme, Drohnenaufnahmen und vertikale Reels — pro Objekt gebucht, an einem Termin produziert und einsatzbereit geliefert für Exposé, Portale und Social Media."
        image="/media/ref-innen-1.jpg"
        imageAlt="Lichtdurchfluteter Wohnraum eines Referenzobjekts mit Parkett"
        ctas={(
          <>
            <Magnetic>
              <button type="button" className="v2-btn" onClick={() => scrollToId('booking')}>
                Objektproduktion anfragen <Arrow />
              </button>
            </Magnetic>
            <Magnetic>
              <button type="button" className="v2-btn ghost on-dark" onClick={() => scrollToId('leistungen')}>
                Pakete ansehen
              </button>
            </Magnetic>
          </>
        )}
        trust="Für Verkauf & Vermietung · schnelle Lieferung nach Paketumfang · Wunschtermin online anfragbar"
      />
      <Pakete />
      <Segments />
      <Usp />
      <Process />
      <Fork />
      <BookingV2 />
      <CrossLink
        eyebrow="Mehr als ein einzelnes Objekt?"
        title="Regelmäßige Sichtbarkeit für Ihre Maklermarke."
        text="Wenn Sie über den Einzelauftrag hinausdenken, bündeln wir Strategie, Produktion und Veröffentlichung in einer laufenden Content-Partnerschaft — vom einmaligen Content Day bis zur ausgelagerten Content-Redaktion."
        href="/marke-und-social/"
        cta="Marke & Social entdecken"
      />
      <Faq />
      <Contact />
    </PageShell>
  );
}
