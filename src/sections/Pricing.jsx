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
    desc: 'Ca. 1–2 Aufnahmen pro Raum, professionell bearbeitet, für einen vollständigen, überzeugenden Immobilienauftritt. Ideal für Wohnungen und klassische Verkaufsobjekte.',
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
    price: '890 €',
    desc: 'Hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll vermittelt – ganz ohne Personen vor der Kamera. Ideal für eine emotionale Präsentation.',
  },
  {
    key: 'makler-film',
    group: 'film',
    name: 'Makler-Film',
    price: '1.290 €',
    desc: 'Atmosphärische Aufnahmen der Immobilie treffen auf Ihre persönliche Präsentation vor der Kamera – für Vertrauen und Ihre Marke.',
  },
];

function PkgRow({ tier }) {
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
        borderRadius: 'var(--radius-md)', padding: '18px 22px',
        boxShadow: hover ? 'var(--shadow-sm)' : 'none',
        display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)',
      }}
    >
      <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: accent }} />
      <div style={{ minWidth: '140px' }}>
        <h3 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
          fontSize: '17px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
          margin: 0,
        }}>{tier.name}</h3>
        <div style={{ marginTop: '3px', display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
            fontSize: '21px', lineHeight: 1, color: 'var(--text-strong)',
          }}>{tier.price}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>netto</span>
        </div>
      </div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '13.5px', lineHeight: 1.5,
        color: 'var(--text-muted)', margin: 0, flex: '1 1 320px',
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

        {/* Foto / Film Gruppen — Erläuterung + Pakete untereinander, kompakt */}
        <div style={{ marginTop: 'clamp(28px, 4vw, 40px)', display: 'grid', gap: '28px' }}>
          {NOTES.map((n) => (
            <div key={n.group}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', flex: 'none', background: n.dot }} />
                <span style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-body-bold)', fontSize: '12.5px',
                  letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>{n.label}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px' }}>
                <strong style={{ color: 'var(--text-strong)', fontWeight: 'var(--fw-body-bold)' }}>{n.lead}</strong>{n.text}
              </p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {TIERS.filter((t) => t.group === n.group).map((t) => <PkgRow key={t.key} tier={t} />)}
              </div>
            </div>
          ))}
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
