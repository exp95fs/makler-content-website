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
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          {steps.map((s) => (
            <div key={s.n} className="mc-timeline-step">
              <span className="mc-timeline-n" style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '34px', color: 'var(--color-accent)', lineHeight: 1,
                letterSpacing: 'var(--ls-heading)',
                display: 'inline-block',
                transition: 'transform var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
              }}>{s.n}</span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '18px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '14px 0 8px',
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
          lead="Wir bauen unser regionales Portfolio auf. Wenn Sie ein passendes Objekt haben — zum Verkauf oder zur Vermietung — kann Ihr Objekt eines davon sein. Kostenlos. Wie das funktioniert, lesen Sie gleich."
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

export function Offer({ onNav }) {
  const list = [
    { b: 'Was Sie bekommen:', t: ' komplette Produktion, konzipiertes Objektvideo (60–90 s) + vertikales Reel + bearbeitete Objektfotos. Für Verkauf oder Vermietung.' },
    { b: 'Was wir dafür möchten:', t: ' Ihr Einverständnis, das Ergebnis als Referenz zeigen zu dürfen.' },
    { b: 'Was nicht dahintersteckt:', t: ' kein Abo, keine versteckten Kosten, keine Verpflichtung.' },
  ];
  return (
    <Section bg="page">
      <Container>
        <div style={{
          maxWidth: '780px', margin: '0 auto', textAlign: 'center',
          background: 'var(--surface-card)', border: '1.5px solid var(--color-accent)',
          borderRadius: 'var(--radius-xl)', padding: 'clamp(32px, 5vw, 56px)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <span style={{
            display: 'inline-block', marginBottom: '14px',
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '13px',
            letterSpacing: '0.04em', color: 'var(--color-accent-deep)',
            background: 'var(--color-accent-tint)', border: '1px solid var(--color-accent)',
            padding: '7px 16px', borderRadius: 'var(--radius-pill)',
          }}>Nur 3 Pilotplätze in der Region</span>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
            fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', lineHeight: 1.16,
            letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
            margin: 0, textWrap: 'balance',
          }}>
            Eine ehrliche Sache: Wir suchen 3 Objekte für unser Portfolio.
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '15.5px', lineHeight: 'var(--lh-normal)',
            color: 'var(--text-muted)', margin: '16px auto 0', maxWidth: '60ch',
          }}>
            Wir sind neu am Markt im Raum Bühl / Mittelbaden und bauen unser Referenz-Portfolio auf.
            Statt Versprechen zu machen, zeigen wir Ihnen lieber das Ergebnis — an einem Ihrer Objekte.
          </p>
          <div style={{
            margin: '24px 0', display: 'inline-flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
            justifyContent: 'center',
            fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-muted)',
          }}>
            <span>Regulärer Wert: <span style={{ textDecoration: 'line-through' }}>1.590 €</span></span>
            <Icon name="arrow-right" size={16} color="var(--text-muted)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '26px', color: 'var(--status-success)' }}>0 €</span>
            <span>für die ersten 3 Pilot-Objekte</span>
          </div>
          <div style={{ display: 'grid', gap: '12px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            {list.map((l) => (
              <div key={l.b} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ marginTop: '2px', flex: 'none', color: 'var(--status-success)' }}>
                  <Icon name="check" size={18} color="var(--status-success)" />
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 1.55, color: 'var(--text-body)' }}>
                  <strong style={{ fontWeight: 'var(--fw-body-bold)', color: 'var(--text-strong)' }}>{l.b}</strong>{l.t}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '28px' }}>
            <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} onClick={() => onNav('anfrage')}>
              Pilotplatz sichern
            </Button>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: '18px 0 0' }}>
            Bewusst begrenzt — damit jedes Objekt die volle Aufmerksamkeit bekommt.
          </p>
        </div>
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
