import React from 'react';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

const NOTES = [
  {
    group: 'foto',
    label: 'Foto',
    dot: 'var(--color-primary)',
    lead: 'Foto Basis oder Premium?',
    text: ' Foto Basis eignet sich für Wohnungen und klassische Immobilien, Foto Premium für besondere, hochpreisige oder emotional zu vermarktende Objekte.',
  },
  {
    group: 'film',
    label: 'Film',
    dot: 'var(--color-accent)',
    lead: 'Objektfilm oder Makler-Film?',
    text: ' Der Objektfilm inszeniert die Immobilie ohne Auftritt vor der Kamera, der Makler-Film zeigt Sie zusätzlich persönlich und stärkt Vertrauen und Marke.',
  },
];

const TIERS = [
  {
    key: 'foto-basis',
    group: 'foto',
    name: 'Foto Basis',
    price: '390 €',
    desc: 'Ca. 20 professionell bearbeitete Aufnahmen für einen vollständigen, überzeugenden Immobilienauftritt. Ideal für Wohnungen und klassische Verkaufsobjekte.',
  },
  {
    key: 'foto-premium',
    group: 'foto',
    name: 'Foto Premium',
    price: '590 €',
    desc: '30–40 professionell bearbeitete Aufnahmen inkl. Detail- und Atmosphärenbildern. Ideal für besondere, hochpreisige und emotional zu vermarktende Immobilien.',
  },
  {
    key: 'objektfilm',
    group: 'film',
    name: 'Objektfilm',
    price: 'ab 890 €',
    desc: 'Hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll vermittelt – ganz ohne Personen vor der Kamera. Ideal für eine emotionale Präsentation.',
  },
  {
    key: 'makler-film',
    group: 'film',
    name: 'Makler-Film',
    price: 'ab 1.290 €',
    desc: 'Atmosphärische Aufnahmen der Immobilie treffen auf Ihre persönliche Präsentation vor der Kamera – für Vertrauen und Ihre Marke.',
  },
];

function PkgCard({ tier }) {
  const [hover, setHover] = React.useState(false);
  const accent = tier.group === 'film' ? 'var(--color-accent)' : 'var(--color-primary)';
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'var(--surface-card)',
        border: '1px solid', borderColor: hover ? accent : 'var(--border-hair)',
        borderRadius: 'var(--radius-lg)', padding: '30px 26px',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column',
        transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
      }}
    >
      <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent }} />
      <h3 style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: '20px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
        margin: '6px 0 0',
      }}>{tier.name}</h3>
      <div style={{ margin: '14px 0 0', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
          fontSize: '30px', lineHeight: 1, color: 'var(--text-strong)',
        }}>{tier.price}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>netto</span>
      </div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
        color: 'var(--text-muted)', margin: '14px 0 0',
      }}>{tier.desc}</p>
    </div>
  );
}

export function Leistungspakete({ onNav }) {
  return (
    <Section bg="page" id="leistungen">
      <Container>
        <SectionHead
          eyebrow="Leistungen & Pakete"
          title="Der passende Auftritt für jede Immobilie."
          lead="Ob hochwertige Fotostrecke oder emotionaler Immobilienfilm: Wählen Sie das Paket, das zu Ihrem Objekt, Ihrer Zielgruppe und Ihrem Vermarktungsziel passt. Alle Leistungen lassen sich individuell ergänzen und auf Wunsch zu einer abgestimmten Content-Produktion kombinieren."
          maxWidth="62ch"
        />

        {/* Foto / Film Erläuterungen */}
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(28px, 4vw, 44px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        }}>
          {NOTES.map((n) => (
            <div key={n.group}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', flex: 'none', background: n.dot }} />
                <span style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-body-bold)', fontSize: '12.5px',
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>{n.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--fw-body-bold)' }}>{n.lead}</strong>{n.text}
              </p>
            </div>
          ))}
        </div>

        {/* Paket-Karten */}
        <div style={{
          display: 'grid', gap: '20px', marginTop: '22px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', alignItems: 'stretch',
        }}>
          {TIERS.map((t) => <PkgCard key={t.key} tier={t} />)}
        </div>

        {/* Mehrobjekt-Rabatt */}
        <div style={{
          marginTop: '34px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          background: 'var(--color-accent-tint)', border: '1.5px solid var(--color-accent)',
          borderRadius: 'var(--radius-lg)', padding: '20px 26px',
        }}>
          <span style={{
            flex: 'none', width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)', color: 'var(--color-on-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="tag" size={20} color="var(--color-on-accent)" />
          </span>
          <div style={{ minWidth: '200px', flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-body-bold)', fontSize: '16.5px',
              color: 'var(--color-accent-deep)', margin: '0 0 3px',
            }}>Mehrere Objekte, ein Termin: 10 % Rabatt</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-body)', margin: 0, lineHeight: 1.5 }}>
              Beauftragen Sie mehr als ein Objekt bei einem gemeinsamen Termin, erhalten Sie auf die Gesamtsumme
              10 % Rabatt. Direkt in der Terminanfrage wählbar.
            </p>
          </div>
        </div>

        {/* CTAs — zwei Wege */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginTop: '28px' }}>
          <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} onClick={() => onNav && onNav('booking')}>
            Paket &amp; Termin anfragen
          </Button>
          <Button variant="ghost" size="lg" onClick={() => onNav && onNav('anfrage')}>
            Lieber erst kennenlernen
          </Button>
        </div>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)',
          margin: '20px 0 0', maxWidth: '74ch',
        }}>Alle Preise netto, zzgl. gesetzl. MwSt.</p>
      </Container>
    </Section>
  );
}
