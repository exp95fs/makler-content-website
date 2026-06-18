import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ds/Button.jsx';
import { Eyebrow } from '../components/ds/Eyebrow.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { Container } from '../components/ui/Layout.jsx';

export function Hero({ onNav }) {
  return (
    <section id="top" style={{ background: 'var(--bg-page)' }}>
      <Container style={{ padding: 'clamp(44px, 6vw, 80px) var(--container-pad) clamp(40px, 5vw, 64px)' }}>
        <Eyebrow>Foto &amp; Video für Makler · Raum Bühl · Mittelbaden · Ortenau</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
          fontSize: 'clamp(2.3rem, 4.8vw, 3.5rem)', lineHeight: 1.06,
          letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)',
          margin: '18px 0 0', maxWidth: '32ch', textWrap: 'balance',
        }}>
          Content, der Ihre Objekte heraushebt - und Ihr{' '}
          <span style={{ color: 'var(--color-accent)' }}>Maklerbüro</span>.
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-light)',
          fontSize: 'var(--fs-lead)', lineHeight: 'var(--lh-normal)',
          color: 'var(--text-muted)', margin: '22px 0 0', maxWidth: '58ch',
        }}>
          Professionelle Fotos und konzipierte Videos für Maklerbüros. Hochwertiger Content,
          der Ihre Objekte schneller vermittelt, qualifiziertere Anfragen bringt und Ihr Büro
          als Marke sichtbar macht — Konzept, Dreh und Schnitt aus einer Hand.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '30px 0 0' }}>
          <Button variant="primary" size="lg" iconRight={<Icon name="arrow-right" size={18} />} onClick={() => onNav('anfrage')}>
            Gratis-Pilot anfragen
          </Button>
          <Button variant="ghost" size="lg" onClick={() => onNav('portfolio')}>
            Arbeitsproben ansehen
          </Button>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)',
          margin: '20px 0 0', lineHeight: 1.6,
        }}>
          Für Verkauf &amp; Vermietung · Foto, Video, Drohne und 360° · schnelle Lieferung nach Paketumfang.
        </p>
      </Container>
    </section>
  );
}

function Stat({ count, prefix = '', suffix = '', label }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started) return;
        setStarted(true);
        observer.unobserve(el);
        const duration = 1200;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(count * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [count, started]);

  return (
    <div ref={ref}>
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)',
        fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)', lineHeight: 1,
        letterSpacing: 'var(--ls-heading)', color: 'var(--color-accent)',
      }}>{prefix}{value}{suffix}</div>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '13.5px', lineHeight: 1.45,
        color: 'var(--text-muted)', margin: '10px auto 0', maxWidth: '22ch',
      }}>{label}</div>
    </div>
  );
}

export function StatBar() {
  const stats = [
    { count: 403, prefix: '+', suffix: ' %', label: 'mehr Anfragen mit Video' },
    { count: 32, prefix: '~', suffix: ' %', label: 'schnellere Vermittlung mit Profi-Fotos' },
    { count: 73, suffix: ' %', label: 'der Verkäufer bevorzugen Makler, die Video nutzen' },
    { count: 9, prefix: 'nur ', suffix: ' %', label: 'der Makler machen objektspezifische Videos' },
  ];
  return (
    <section style={{
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hair)', borderBottom: '1px solid var(--border-hair)',
      padding: 'clamp(36px, 5vw, 52px) 0',
    }}>
      <Container>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center',
        }} className="mc-stats">
          {stats.map((s) => (
            <Stat key={s.label} count={s.count} prefix={s.prefix} suffix={s.suffix} label={s.label} />
          ))}
        </div>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '12.5px', color: 'var(--text-muted)',
          opacity: 0.85, textAlign: 'center', margin: '26px auto 0', maxWidth: '78ch', lineHeight: 1.55,
        }}>
          Quellen: NAR, Redfin/VHT, Branchenstudien (überwiegend international) — die Größenordnung
          ist auf den deutschen Markt übertragbar, in dem Video noch kaum genutzt wird.
        </p>
      </Container>
    </section>
  );
}
