import { Card } from '../components/ds/Card.jsx';
import { Badge } from '../components/ds/Badge.jsx';
import { MediaFrame } from '../components/ds/MediaFrame.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

export function Benefits() {
  const items = [
    { icon: 'trending-up', title: 'Objekte heben sich ab', text: 'Im Portal entscheidet das erste Bild. Profi-Fotos bringen spürbar mehr Aufmerksamkeit.', kpi: '+61 % mehr Aufrufe' },
    { icon: 'eye', title: 'Bleiben im Kopf', text: 'Video vermittelt Raumgefühl, Licht und Laufwege. Interessenten erinnern sich an Ihr Objekt, nicht an das nächste in der Liste.' },
    { icon: 'timer', title: 'Schneller vermittelt', text: 'Bessere Darstellung verkürzt die Zeit am Markt nachweislich, bei Fotos wie bei Video.', kpi: 'bis zu ~32 % schneller' },
    { icon: 'target', title: 'Qualifiziertere Anfragen', text: 'Wer das Objekt im Video gesehen hat, meldet sich gezielter. Weniger Besichtigungstourismus, weniger vergeudete Termine.' },
    { icon: 'building-2', title: 'Repräsentiert Ihr Büro', text: 'Konsistenter, hochwertiger Content zeigt Ihren Qualitätsanspruch. Bei Eigentümern wie bei Käufern.' },
    { icon: 'sparkles', title: 'Baut Ihre Marke', text: 'Reels und Maklerpräsenz arbeiten auch für Sie, nicht nur fürs Objekt.', kpi: '71 % wählen Makler mit starker Online-Präsenz' },
  ];
  return (
    <Section bg="page">
      <Container>
        <SectionHead
          eyebrow="Warum hochwertiger Content"
          title="Sechs Gründe, warum sich der Invest in guten Content rechnet."
          lead="Hochwertige Fotos und Videos sind kein Schmuck fürs Inserat. Sie sind ein messbarer Hebel auf Anfragen, Vermittlungsdauer und das Bild, das Ihr Büro abgibt."
        />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}>
          {items.map((it) => (
            <Card key={it.title} interactive padding="lg">
              <span className="mc-card-icon" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '46px', height: '46px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
                transition: 'transform var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard), color var(--dur-base) var(--ease-standard)',
              }}>
                <Icon name={it.icon} size={22} />
              </span>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '19px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '18px 0 8px',
              }}>{it.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
                color: 'var(--text-muted)', margin: 0,
              }}>{it.text}</p>
              {it.kpi && (
                <span style={{
                  display: 'inline-block', marginTop: '12px',
                  fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '13px',
                  color: 'var(--color-accent-deep)',
                }}>{it.kpi}</span>
              )}
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function Segments() {
  const segs = [
    {
      tag: 'Verkaufen', tagTone: 'accent', accent: 'var(--color-accent)',
      title: 'Wohnungen · Häuser · Anwesen',
      text: 'Content, der den Wert eines Kaufobjekts vermittelt und den richtigen Käufer schneller anzieht.',
      points: [
        'Schnellere Vermittlung, höhere Wahrnehmung des Objekts',
        'Vorqualifizierte Käufer durch realistisches Raumgefühl',
        'Stärkere Position im Akquisegespräch mit Eigentümern',
      ],
      ph: 'Beispiel · Verkaufsobjekt',
    },
    {
      tag: 'Vermieten & Ferienwohnung', tagTone: 'sage', accent: 'var(--color-primary)',
      title: 'Miet- & Kurzzeit-/Ferienobjekte',
      text: 'Content, der Buchungen und Mietanfragen steigert, bis hin zu Ferienwohnung und Airbnb.',
      points: [
        'Bis zu +40 % mehr Buchungen mit Profi-Fotos',
        '~26 % höhere erzielbare Preise, weniger Leerstand',
        'Wiederverwendbarer Content für Portale & Social Media',
      ],
      ph: 'Beispiel · Ferienwohnung',
    },
  ];

  return (
    <Section bg="surface" divider>
      <Container>
        <SectionHead
          eyebrow="Für welches Ziel?"
          title="Ob Verkauf oder Vermietung: Der richtige Content für Ihr Objekt."
        />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(28px, 4vw, 40px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}>
          {segs.map((s) => (
            <Card key={s.tag} interactive padding="lg" style={{ borderColor: 'var(--border-hair)' }}>
              <Badge tone={s.tagTone}>{s.tag}</Badge>
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '21px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: '14px 0 8px',
              }}>{s.title}</h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '15px', lineHeight: 'var(--lh-normal)',
                color: 'var(--text-muted)', margin: 0,
              }}>{s.text}</p>
              <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'grid', gap: '11px' }}>
                {s.points.map((p) => (
                  <li key={p} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ marginTop: '2px', flex: 'none', color: s.accent }}>
                      <Icon name="arrow-right" size={16} color={s.accent} />
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-body)', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '18px' }}>
                <MediaFrame ratio="16 / 9" radius="md" placeholderLabel={s.ph} style={{ boxShadow: 'var(--shadow-sm)' }} />
              </div>
            </Card>
          ))}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)',
          opacity: 0.85, margin: '22px 0 0', lineHeight: 1.55,
        }}>
          Vermietungs-/Ferienwohnungs-Zahlen: Airbnb- und Branchen-Zusammenstellungen. Richtwerte, keine Garantie.
        </p>
      </Container>
    </Section>
  );
}
