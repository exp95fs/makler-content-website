import { Button } from '../components/ds/Button.jsx';
import { Eyebrow } from '../components/ds/Eyebrow.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

export function Branding({ onNav }) {
  const pillars = [
    { icon: 'layers', title: 'Konsistente Bildsprache', text: 'Eine durchgängige Handschrift über alle Objekte hinweg. Ihr Büro wird auf den ersten Blick wiedererkannt.' },
    { icon: 'megaphone', title: 'Sie als Gesicht der Region', text: 'Makler-Reels, Porträt- und Experten-Content, der Vertrauen aufbaut, bevor das erste Gespräch beginnt.' },
    { icon: 'badge-check', title: 'Strategie statt Einzelclips', text: 'Ein roter Faden für Portale, Social Media und Website. Strategisch geplant, nicht zufällig zusammengestellt.' },
  ];

  return (
    <Section bg="sage">
      <Container>
        <div style={{ maxWidth: '60ch' }}>
          <Eyebrow color="onDark">Markenbildung</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
            fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', lineHeight: 1.14,
            letterSpacing: 'var(--ls-heading)', color: 'var(--color-on-primary)',
            margin: '14px 0 0', textWrap: 'balance',
          }}>
            Nicht nur das Objekt — Ihr Maklerbüro als Marke.
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
            fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
            color: 'var(--color-secondary)', margin: '16px 0 0',
          }}>
            Einzelne Objekte zu vermarkten ist der Anfang. Der eigentliche Hebel liegt darin, Sie und
            Ihr Büro als feste Größe in der Region sichtbar zu machen, ob etabliertes Maklerbüro oder
            eigenständiger Makler.
          </p>
        </div>

        <div style={{
          display: 'grid', gap: '18px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))',
        }}>
          {pillars.map((p) => (
            <div key={p.title} className="mc-pillar" style={{
              background: 'rgba(243,238,229,0.07)',
              border: '1px solid rgba(243,238,229,0.16)',
              borderRadius: 'var(--radius-lg)', padding: '26px',
              transition: 'transform var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
            }}>
              <span className="mc-pillar-icon" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent)', color: 'var(--color-on-accent)',
                transition: 'transform var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
              }}>
                <Icon name={p.icon} size={21} />
              </span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '18px', letterSpacing: 'var(--ls-heading)', color: 'var(--color-on-primary)',
                margin: '16px 0 8px',
              }}>{p.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 'var(--lh-normal)',
                color: 'var(--color-secondary)', margin: 0,
              }}>{p.text}</p>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
          marginTop: 'clamp(28px, 4vw, 40px)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '15px',
            color: 'var(--color-on-primary)', margin: 0, maxWidth: '46ch', lineHeight: 1.55,
          }}>
            Wir starten beim einzelnen Objekt und bauen daraus Schritt für Schritt Ihre Marke.
          </p>
          <Button variant="primary" size="md" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav('anfrage')}>
            Markenbildung besprechen
          </Button>
        </div>
      </Container>
    </Section>
  );
}

export function Usp() {
  const usps = [
    { n: '1', title: 'Alles aus einer Hand', text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff. alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.' },
    { n: '2', title: 'Bewusst auf wenige Kunden begrenzt', text: 'Wir arbeiten gezielt mit wenigen Kunden gleichzeitig. So bleiben die Wege kurz und die Lieferung schnell. Jedes Objekt bekommt die volle Aufmerksamkeit.' },
    { n: '3', title: 'Konsistenter, hochwertiger Look', text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht. Objekt für Objekt wiedererkennbar.' },
    { n: '4', title: 'Gedacht aus Sicht der Zielgruppe', text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.' },
  ];
  return (
    <Section bg="page">
      <Container>
        <SectionHead
          eyebrow="Was uns von anderen Anbietern unterscheidet"
          title={'Alles aus einer Hand. Gedacht aus Sicht Ihrer Zielgruppe.'}
        />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))',
        }}>
          {usps.map((u) => (
            <div key={u.n} className="mc-usp" style={{
              background: 'var(--surface-card)', border: '1px solid var(--border-hair)',
              borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)',
              transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
            }}>
              <span className="mc-usp-num" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-tint)', color: 'var(--color-accent-deep)',
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '18px',
                transition: 'transform var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
              }}>{u.n}</span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '19px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '16px 0 8px',
              }}>{u.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
                color: 'var(--text-muted)', margin: 0,
              }}>{u.text}</p>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '26px', background: 'var(--color-accent-tint)',
          border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)',
          padding: '18px 22px',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-body)', margin: 0 }}>
            <strong style={{ color: 'var(--color-accent-deep)', fontWeight: 'var(--fw-body-bold)' }}>Die Chance:</strong>{' '}
            Nur rund 9 % der Makler produzieren objektspezifische Videos - in unserer Region noch weniger.
            Wer jetzt in gutes Bewegtbild investiert, hebt sich sichtbar vom Markt ab.
          </p>
        </div>
      </Container>
    </Section>
  );
}
