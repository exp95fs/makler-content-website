import React from 'react';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

function ForkCard({ badge, title, text, action, meta }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--surface-card)',
        border: '1.5px solid', borderColor: hover ? 'var(--color-accent)' : 'var(--border-hair)',
        borderRadius: 'var(--radius-xl)', padding: 'clamp(26px, 3vw, 38px)',
        boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column',
        transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
      }}
    >
      <span style={{
        display: 'inline-block', alignSelf: 'flex-start', marginBottom: '16px',
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '11px',
        letterSpacing: '0.05em', textTransform: 'uppercase',
        color: 'var(--color-primary-deep)', background: 'var(--color-primary-tint)',
        padding: '5px 12px', borderRadius: 'var(--radius-pill)',
      }}>{badge}</span>
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: '22px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
        margin: '0 0 10px',
      }}>{title}</h3>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
        color: 'var(--text-muted)', margin: '0 0 18px', flex: 1,
      }}>{text}</p>
      <div>{action}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px',
        fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', flex: 'none', background: 'var(--status-success)' }} />
        {meta}
      </div>
    </div>
  );
}

export function Fork({ onNav }) {
  return (
    <Section bg="surface" id="start" divider>
      <Container>
        <SectionHead
          align="center"
          eyebrow="Bereit für Ihr Objekt?"
          title="Zwei Wege — Sie wählen, was zu Ihnen passt."
          lead="Noch unsicher oder erst kennenlernen? Schreiben Sie uns kurz. Sie wissen schon, was Sie brauchen? Dann direkt zum Wunschtermin."
        />
        <div style={{
          display: 'grid', gap: '22px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'stretch',
        }}>
          <ForkCard
            badge="Neu hier? · Unverbindlich"
            title="Kurz kennenlernen"
            text="Sie wollen erst Fragen klären oder uns kennenlernen? Schreiben Sie uns kurz über das Kontaktformular — unverbindlich und ohne Terminzwang. Wir melden uns persönlich."
            meta="Ideal für neue Interessenten"
            action={
              <Button variant="ghost" size="md" onClick={() => onNav && onNav('anfrage')}>
                Nachricht schreiben
              </Button>
            }
          />
          <ForkCard
            badge="Sie wissen, was Sie brauchen?"
            title="Objekt-Termin direkt anfragen"
            text="Sie kennen uns bereits oder wissen genau, was Ihr Objekt braucht? Stellen Sie in wenigen Schritten Ihr Paket zusammen und fragen Sie direkt einen Wunschtermin an — die Anfrage ist unverbindlich, wir bestätigen persönlich."
            meta="Ideal für Bestandskunden & Entschlossene"
            action={
              <Button variant="primary" size="md" iconRight={<Icon name="arrow-right" size={16} />} onClick={() => onNav && onNav('booking')}>
                Paket &amp; Termin wählen
              </Button>
            }
          />
        </div>
      </Container>
    </Section>
  );
}
