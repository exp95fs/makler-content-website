import React from 'react';
import { Card } from '../components/ds/Card.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';

const TIERS = [
  {
    key: 'foto',
    name: 'Foto-Basis',
    price: 490,
    desc: 'Solide Bildstrecke für Verkauf oder Vermietung, schnell einsatzbereit.',
    points: [
      'Bearbeitete Fotostrecke fürs Exposé & Portale',
      'Anfahrt bis 60 km, vor Ort & Nachbearbeitung inklusive',
      'Lieferung in wenigen Werktagen',
    ],
  },
  {
    key: 'kombi',
    name: 'Foto & Video & Drohne (Basis)',
    price: 990,
    desc: 'Die meistgewählte Kombination: Fotos, Objektvideo und Luftaufnahmen für mehr Reichweite.',
    points: [
      'Alles aus Foto-Basis',
      'Konzipiertes Objektvideo (60–90 s)',
      'Drohnenaufnahmen für Außen- & Lageperspektive',
      'Vertikales Reel für Social Media & Story',
    ],
    featured: true,
  },
  {
    key: 'premium',
    name: 'Foto & Video Premium',
    price: 1490,
    desc: 'Die volle Produktion für Ihre Top-Objekte, mit aufwendigerem Schnitt und mehr Material.',
    points: [
      'Alles aus Foto & Video & Drohne (Basis)',
      'Premium-Videoschnitt mit ausführlicherem Erzählbogen',
      'Erweiterte Bildstrecke inkl. Detail- & Lifestyle-Aufnahmen',
    ],
  },
];

export function Leistungspakete({ onNav }) {
  return (
    <Section bg="page" id="leistungen" divider>
      <Container>
        <SectionHead
          eyebrow="Leistungspakete"
          title="Drei Pakete, klar kalkuliert, für jedes Objekt das passende Format."
          lead="Alle Preise netto, zzgl. MwSt. Für laufende Zusammenarbeit lohnt sich der Retainer-Rechner weiter unten."
        />
        <div style={{
          display: 'grid', gap: '20px', marginTop: 'clamp(32px, 4vw, 46px)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'stretch',
        }}>
          {TIERS.map((t) => (
            <Card
              key={t.key}
              interactive
              padding="lg"
              style={{
                display: 'flex', flexDirection: 'column',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                fontSize: '21px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
                margin: 0,
              }}>{t.name}</h3>
              <div style={{ margin: '14px 0 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
                  fontSize: '32px', color: 'var(--text-strong)',
                }}>{t.price.toLocaleString('de-DE')} €</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>netto</span>
              </div>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '14.5px', lineHeight: 'var(--lh-normal)',
                color: 'var(--text-muted)', margin: '12px 0 0',
              }}>{t.desc}</p>
              <ul style={{ listStyle: 'none', margin: '18px 0 0', padding: 0, display: 'grid', gap: '11px', flex: 1 }}>
                {t.points.map((p) => (
                  <li key={p} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ marginTop: '2px', flex: 'none', color: 'var(--color-accent)' }}>
                      <Icon name="check" size={16} color="var(--color-accent)" />
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-body)', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '22px' }}>
                <Button
                  variant={t.featured ? 'primary' : 'ghost'}
                  size="md"
                  style={{ width: '100%' }}
                  onClick={() => onNav && onNav('anfrage')}
                >
                  Anfragen
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--text-muted)',
          margin: '28px 0 0', maxWidth: '74ch',
        }}>Alle Preise netto, zzgl. MwSt.</p>
      </Container>
    </Section>
  );
}

const PRICES = { foto: 490, kombi: 990, premium: 1490 };
const DISCOUNTS = { 3: 0.05, 6: 0.10, 12: 0.15 };

function fmt(n) {
  return Math.round(n).toLocaleString('de-DE') + ' €';
}

export function RetainerCalculator() {
  const [mix, setMix] = React.useState('kombi');
  const [objects, setObjects] = React.useState(5);
  const [duration, setDuration] = React.useState(6);

  const avg = PRICES[mix];
  const discount = DISCOUNTS[duration];
  const singleTotal = avg * objects * duration;
  const retainerTotal = singleTotal * (1 - discount);
  const monthly = retainerTotal / duration;
  const savings = singleTotal - retainerTotal;
  const retainerBarPct = (retainerTotal / singleTotal) * 100;

  return (
    <Section bg="sage" id="retainer">
      <Container>
        <SectionHead
          eyebrow="Für laufende Zusammenarbeit"
          title="Mit einem Retainer sparen Sie über die Vertragslaufzeit deutlich."
          lead="Wählen Sie Paket, Objekte pro Monat und Laufzeit, der Rechner zeigt sofort den Vorteil gegenüber Einzelbuchung."
          onDark
        />
        <div style={{
          marginTop: '40px', background: 'var(--surface-card)', color: 'var(--text-body)',
          borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)',
          padding: 'clamp(26px, 4vw, 44px)', display: 'grid', gap: '32px',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
        }} className="mc-calc-grid">
          <div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '13.5px', color: 'var(--text-strong)' }}>Paket</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {[
                  { v: 'foto', label: 'Foto-Basis' },
                  { v: 'kombi', label: 'Foto & Video & Drohne (Basis)' },
                  { v: 'premium', label: 'Foto & Video Premium' },
                ].map((o) => (
                  <PillLight key={o.v} active={mix === o.v} onClick={() => setMix(o.v)}>{o.label}</PillLight>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '13.5px', color: 'var(--text-strong)' }}>Objekte pro Monat</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {[3, 4, 5].map((o) => (
                  <PillLight key={o} active={objects === o} onClick={() => setObjects(o)}>{`~${o}`}</PillLight>
                ))}
              </div>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '13.5px', color: 'var(--text-strong)' }}>Vertragslaufzeit</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {[
                  { v: 3, label: '3 Monate', d: '−5 %' },
                  { v: 6, label: '6 Monate', d: '−10 %' },
                  { v: 12, label: '12 Monate', d: '−15 %' },
                ].map((o) => (
                  <PillLight key={o.v} active={duration === o.v} onClick={() => setDuration(o.v)}>
                    {o.label}
                    <span style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--fw-body)', opacity: 0.85, marginTop: '1px' }}>{o.d}</span>
                  </PillLight>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-hair)', paddingLeft: 'clamp(0px, 4vw, 32px)' }} className="mc-calc-result">
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '34px', color: 'var(--text-strong)' }}>
                {fmt(monthly)}
              </span>
              <small style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}> / Monat</small>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 22px' }}>
              netto, zzgl. MwSt. · {duration} Monate Laufzeit · −{Math.round(discount * 100)} % ggü. Einzelbuchung
            </p>

            <div style={{ display: 'grid', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Einzelbuchung</span><span>{fmt(singleTotal)}</span>
                </div>
                <div style={{ height: '10px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunk)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: 'var(--text-muted)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Retainer</span><span>{fmt(retainerTotal)}</span>
                </div>
                <div style={{ height: '10px', borderRadius: 'var(--radius-pill)', background: 'var(--surface-sunk)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${retainerBarPct}%`, background: 'var(--color-accent)' }} />
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '22px', background: 'var(--color-accent-tint)', border: '1px solid var(--color-accent)',
              borderRadius: 'var(--radius-md)', padding: '14px 18px',
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '14.5px', color: 'var(--color-accent-deep)' }}>
                Sie sparen {fmt(savings)} ({Math.round(discount * 100)} %)
              </span>
              <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                über die gesamte Vertragslaufzeit, im Vergleich zur Einzelbuchung.
              </span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function PillLight({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '13.5px',
        color: active ? 'var(--color-on-accent)' : 'var(--text-body)',
        background: active ? 'var(--color-accent)' : 'var(--surface-sunk)',
        border: '1.5px solid transparent',
        borderRadius: 'var(--radius-pill)', padding: '9px 18px', cursor: 'pointer',
        lineHeight: 1.3, textAlign: 'center', WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        boxShadow: active ? '0 6px 16px -8px rgba(164,88,58,.5)' : 'none',
        transition: 'all .2s ease',
      }}
    >
      {children}
    </button>
  );
}
