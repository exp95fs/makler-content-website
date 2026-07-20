import { MediaFrame } from '../components/ds/MediaFrame.jsx';
import { Eyebrow } from '../components/ds/Eyebrow.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { InstagramIcon } from '../components/ui/InstagramIcon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

export function Process() {
  const steps = [
    { n: '01', title: 'Kurzes Briefing', text: '10 Minuten am Telefon: Objekt, Ziel (Verkauf/Vermietung), Termin.' },
    { n: '02', title: 'Ein Termin vor Ort', text: 'Fotos und Video in einem Durchgang. Sie müssen nicht dabei sein.' },
    { n: '03', title: 'Konzipierter Schnitt', text: 'Geschnitten nach Konzept, nicht nach Schema.' },
    { n: '04', title: 'Schnelle Lieferung', text: 'Sie erhalten Ihre finalen Fotos, Videos und Reels einsatzbereit für Portale, Exposé und Social Media.' },
  ];
  return (
    <Section bg="surface" divider>
      <Container>
        <SectionHead eyebrow="So läuft's ab" title="In vier Schritten zum fertigen Objekt-Content." />
        <div className="mc-timeline" style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(40px, 5vw, 56px)',
          gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative',
        }}>
          {steps.map((s) => (
            <div key={s.n} className="mc-timeline-step" style={{ position: 'relative', paddingTop: '60px' }}>
              <div className="mc-timeline-n" style={{
                position: 'absolute', top: 0, left: 0, width: '44px', height: '44px',
                borderRadius: '50%', background: 'var(--surface-card)', border: '2px solid var(--color-accent)',
                color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '16px',
                transition: 'transform var(--dur-slow) var(--ease-soft), background var(--dur-slow) var(--ease-soft), color var(--dur-slow) var(--ease-soft)',
              }}>{s.n}</div>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '18px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '0 0 8px',
              }}>{s.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 'var(--lh-normal)',
                color: 'var(--text-muted)', margin: 0,
              }}>{s.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function Portfolio() {
  const slots = [
    'Referenzobjekt 1 · Verkauf',
    'Referenzobjekt 2 · Vermietung',
    'Referenzobjekt 3 · Video + Bildstrecke',
  ];
  return (
    <Section bg="page" id="portfolio">
      <Container>
        <SectionHead
          eyebrow="Arbeitsproben"
          title="Die ersten Referenzobjekte entstehen gerade."
          lead="Wir bauen unser regionales Portfolio auf. Erste Projekte sind bereits abgeschlossen, weitere entstehen laufend, diese Seite wächst mit jedem neuen Objekt."
        />
        <div style={{
          display: 'grid', gap: '18px', marginTop: 'clamp(28px, 4vw, 40px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}>
          {slots.map((s) => (
            <MediaFrame key={s} ratio="16 / 10" radius="lg" placeholderLabel={s} />
          ))}
        </div>
        <a
          href="https://www.instagram.com/quadratblick_de"
          target="_blank"
          rel="noopener"
          className="mc-portfolio-instagram"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px', marginTop: '24px',
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '14px',
            color: 'var(--color-accent-deep)', textDecoration: 'none',
            transition: 'color var(--dur-base) var(--ease-standard)',
          }}
        >
          <InstagramIcon size={18} />
          <span>Mehr Arbeitsproben auf Instagram</span>
        </a>
      </Container>
    </Section>
  );
}


export function About() {
  return (
    <Section bg="surface" divider>
      <Container>
        <div style={{
          display: 'grid', gap: 'clamp(28px, 5vw, 48px)', alignItems: 'center',
          gridTemplateColumns: 'minmax(0, 0.82fr) minmax(0, 1.18fr)',
        }} className="mc-about-grid">
          {/* PLATZHALTER: professionelles Porträtfoto */}
          <MediaFrame ratio="1 / 1" radius="lg" placeholderLabel="Porträtfoto · Platzhalter" />
          <div>
            <Eyebrow>Wer das macht</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
              fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1.16,
              letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
              margin: '14px 0 0', textWrap: 'balance',
            }}>
              Fabian — Foto, Video und strategischer Blick für Immobilienmarken.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
              fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
              color: 'var(--text-body)', margin: '18px 0 0',
            }}>
              Ich komme aus der professionellen Foto- und Videoproduktion und habe über viele Jahre
              visuelle Projekte für namhafte Unternehmen umgesetzt. Dabei ging es nie nur um schöne Bilder,
              sondern immer um die Frage: Welche Botschaft soll ankommen und wie muss sie aussehen, damit
              sie bei der richtigen Zielgruppe wirkt?
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
              fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
              color: 'var(--text-body)', margin: '14px 0 0',
            }}>
              Genau diesen Anspruch übertrage ich auf Immobilien. Ich produziere Fotos, Videos und
              Markencontent, die Objekte hochwertig zeigen, Maklerbüros professionell positionieren und aus
              einem einzelnen Auftrag ein stimmiges Gesamtbild machen.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 'var(--lh-normal)',
              color: 'var(--text-muted)', margin: '14px 0 0',
            }}>
              Ansässig in Bühl, unterwegs in Mittelbaden und der Ortenau.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
