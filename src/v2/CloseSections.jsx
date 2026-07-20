import { useEffect, useRef, useState } from 'react';
import { Split, scrollToId } from './fx.jsx';
import { Arrow } from './AppV2.jsx';

/* ---------- Leistungspakete ---------- */
const TIERS = [
  {
    key: 'foto',
    name: 'Foto (Basis)',
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
    name: 'Foto & Video (Basis)',
    price: 990,
    desc: 'Die meistgewählte Kombination: Fotos, Objektvideo und Luftaufnahmen für mehr Reichweite.',
    points: [
      'Alles aus Foto (Basis)',
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
      'Alles aus Foto & Video (Basis)',
      'Premium-Videoschnitt mit ausführlicherem Erzählbogen',
      'Erweiterte Bildstrecke inkl. Detail- & Lifestyle-Aufnahmen',
    ],
  },
];

function Tiers() {
  return (
    <section className="v2-sec bg-linen-2" id="leistungen">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Leistungspakete</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Drei Pakete, klar kalkuliert, für jedes Objekt das passende Format.
          </Split>
          <p className="v2-lead" data-reveal>
            Alle Preise netto, zzgl. MwSt. Für laufende Zusammenarbeit lohnt sich der Retainer-Rechner weiter unten.
          </p>
        </div>
        <div className="v2-tiers">
          {TIERS.map((t, i) => (
            <article className={`v2-tier ${t.featured ? 'featured' : ''}`} key={t.key} data-reveal data-delay={i * 0.12}>
              <span className="tname">{t.name}</span>
              <div className="price">
                {t.price.toLocaleString('de-DE')} €<span className="net">netto</span>
              </div>
              <p className="desc">{t.desc}</p>
              <ul>
                {t.points.map((p) => (
                  <li key={p}><span className="tick">✓</span>{p}</li>
                ))}
              </ul>
              <div className="cta">
                <button
                  type="button"
                  className={`v2-btn ${t.featured ? '' : 'ghost'}`}
                  onClick={() => scrollToId('anfrage')}
                >
                  Anfragen <Arrow size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="v2-fine" data-reveal>Alle Preise netto, zzgl. MwSt.</p>
      </div>
    </section>
  );
}

/* ---------- Retainer-Rechner ---------- */
const PRICES = { foto: 490, kombi: 990, premium: 1490 };
const DISCOUNTS = { 3: 0.05, 6: 0.10, 12: 0.15 };
const fmt = (n) => Math.round(n).toLocaleString('de-DE') + ' €';

function Retainer() {
  const [mix, setMix] = useState('kombi');
  const [objects, setObjects] = useState(5);
  const [duration, setDuration] = useState(6);

  const avg = PRICES[mix];
  const discount = DISCOUNTS[duration];
  const singleTotal = avg * objects * duration;
  const retainerTotal = singleTotal * (1 - discount);
  const monthly = retainerTotal / duration;
  const savings = singleTotal - retainerTotal;
  const retainerBarPct = (retainerTotal / singleTotal) * 100;

  return (
    <section className="v2-sec bg-sage" id="retainer">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow on-dark" data-reveal>Für laufende Zusammenarbeit</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Mit einem Retainer sparen Sie über die Vertragslaufzeit deutlich.
          </Split>
          <p className="v2-lead on-dark" data-reveal>
            Wählen Sie Paket, Objekte pro Monat und Laufzeit, der Rechner zeigt sofort den Vorteil gegenüber Einzelbuchung.
          </p>
        </div>
        <div className="v2-calc" data-reveal>
          <div>
            <span className="v2-calc-label">Paket</span>
            <div className="v2-pills">
              {[
                { v: 'foto', label: 'Foto (Basis)' },
                { v: 'kombi', label: 'Foto & Video (Basis)' },
                { v: 'premium', label: 'Foto & Video Premium' },
              ].map((o) => (
                <button type="button" key={o.v} className={`v2-pill ${mix === o.v ? 'is-on' : ''}`} onClick={() => setMix(o.v)}>{o.label}</button>
              ))}
            </div>
            <span className="v2-calc-label">Objekte pro Monat</span>
            <div className="v2-pills">
              {[3, 4, 5].map((o) => (
                <button type="button" key={o} className={`v2-pill ${objects === o ? 'is-on' : ''}`} onClick={() => setObjects(o)}>~{o}</button>
              ))}
            </div>
            <span className="v2-calc-label">Vertragslaufzeit</span>
            <div className="v2-pills" style={{ marginBottom: 0 }}>
              {[
                { v: 3, label: '3 Monate', d: '−5 %' },
                { v: 6, label: '6 Monate', d: '−10 %' },
                { v: 12, label: '12 Monate', d: '−15 %' },
              ].map((o) => (
                <button type="button" key={o.v} className={`v2-pill ${duration === o.v ? 'is-on' : ''}`} onClick={() => setDuration(o.v)}>
                  {o.label}<small>{o.d}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="v2-calc-result">
            <div className="v2-calc-monthly">{fmt(monthly)} <small>/ Monat</small></div>
            <p className="v2-calc-note">
              netto, zzgl. MwSt. · {duration} Monate Laufzeit · −{Math.round(discount * 100)} % ggü. Einzelbuchung
            </p>
            <div className="v2-bar-row">
              <div className="v2-bar-head"><span>Einzelbuchung</span><span>{fmt(singleTotal)}</span></div>
              <div className="v2-bar"><div className="full" /></div>
            </div>
            <div className="v2-bar-row">
              <div className="v2-bar-head"><span>Retainer</span><span>{fmt(retainerTotal)}</span></div>
              <div className="v2-bar"><div className="part" style={{ width: `${retainerBarPct}%` }} /></div>
            </div>
            <div className="v2-savings">
              <strong>Sie sparen {fmt(savings)} ({Math.round(discount * 100)} %)</strong>
              <span>über die gesamte Vertragslaufzeit, im Vergleich zur Einzelbuchung.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FaqItem({ q, a, open, onToggle }) {
  const bodyRef = useRef(null);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    el.style.height = open ? `${el.scrollHeight}px` : '0px';
  }, [open]);
  return (
    <div className={`v2-faq-item ${open ? 'is-open' : ''}`}>
      <button type="button" className="v2-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="ico" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
        </span>
      </button>
      <div className="v2-faq-a" ref={bodyRef} aria-hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
}

function Faq() {
  const items = [
    { q: 'Lohnt sich das wirtschaftlich?', a: 'Die Zahlen sprechen dafür: Objekte mit Profi-Fotos verkaufen rund 32 % schneller, Inserate mit Video erhalten ein Vielfaches an Anfragen, und Ferienobjekte mit guten Fotos werden deutlich öfter gebucht. Schnellere Vermittlung und qualifiziertere Anfragen sparen Ihnen Zeit und Folgekosten. Der Content amortisiert sich meist über ein einziges Objekt.' },
    { q: 'Erstellen Sie auch Content für Objekte zur Vermietung?', a: 'Ja. Neben Verkaufsobjekten produzieren wir gezielt Content für Miet- und Ferienobjekte (z. B. Airbnb/Booking). Dort wirkt guter Content auf Buchungsrate und erzielbaren Preis besonders stark.' },
    { q: 'Warum gratis, wo ist der Haken?', a: 'Es gibt keinen. Wir bauen unser Portfolio auf und brauchen dafür echte Objekte in Top-Qualität. Sie bekommen das fertige Ergebnis, wir bekommen eine Referenz. Fairer Tausch.' },
    { q: 'Was kostet es danach?', a: 'Nichts, solange Sie nichts weiter beauftragen. Möchten Sie weitere Objekte, liegt eine Einzelproduktion bei 320–1.490 € je nach Umfang; für regelmäßigen Objektfluss gibt es planbare Monatspakete. Völlig unverbindlich.' },
    { q: 'Wie viel Zeit kostet mich das?', a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest machen wir.' },
    { q: 'Wem gehören die Aufnahmen?', a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Wir dürfen das Ergebnis als Arbeitsprobe zeigen.' },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="v2-sec bg-linen" id="faq">
      <div className="v2-wrap">
        <div className="v2-sec-head center">
          <p className="v2-eyebrow" data-reveal>Häufige Fragen</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Damit keine Fragen offen bleiben.
          </Split>
        </div>
        <div className="v2-faq" data-reveal>
          {items.map((it, i) => (
            <FaqItem key={it.q} q={it.q} a={it.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Kontakt ---------- */
function encodeFormData(data) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    const data = Object.fromEntries(new FormData(e.target).entries());
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(data),
    })
      .then((res) => { if (!res.ok) throw new Error('submit failed'); setSent(true); })
      .catch(() => setSubmitError(true))
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="v2-sec bg-ink" id="anfrage">
      <div className="v2-wrap">
        <div className="v2-contact">
          <div className="v2-contact-info">
            <p className="v2-eyebrow on-dark" data-reveal>Jetzt anfragen</p>
            <Split as="h2" className="v2-h-display v2-h-lg">
              Sichern Sie sich einen der 3 Pilotplätze.
            </Split>
            <p className="v2-lead on-dark" data-reveal>
              Kurz Ihre Eckdaten, wir melden uns innerhalb von 24 Stunden mit einem Terminvorschlag.
            </p>
            <div className="v2-contact-meta" data-reveal>
              <a href="mailto:info@quadratblick.de"><span className="k">E-Mail</span>info@quadratblick.de</a>
              <a href="tel:+4915904692843"><span className="k">Telefon</span>0159 0469 2843</a>
              <a href="https://www.instagram.com/quadratblick_de" target="_blank" rel="noopener noreferrer"><span className="k">Instagram</span>@quadratblick_de</a>
              <span className="row"><span className="k">Region</span>Bühl · Mittelbaden · Ortenau</span>
            </div>
          </div>
          <div className="v2-form" data-reveal data-delay="0.15">
            {sent ? (
              <div className="v2-sent">
                <span className="ok">✓</span>
                <h3>Danke, wir melden uns.</h3>
                <p>
                  Ihre Anfrage ist angekommen. Sie hören innerhalb von 24 Stunden von uns,
                  mit einem Terminvorschlag für Ihr Pilot-Objekt.
                </p>
                <button type="button" className="v2-btn ghost sm" onClick={() => setSent(false)}>Weitere Anfrage</button>
              </div>
            ) : (
              <form name="kontakt" onSubmit={handleSubmit} data-netlify-honeypot="bot-field">
                <input type="hidden" name="form-name" value="kontakt" />
                <input type="text" name="bot-field" tabIndex="-1" autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} aria-hidden="true" />
                <div className="v2-field">
                  <label htmlFor="v2-name">Ihr Name</label>
                  <input id="v2-name" type="text" name="name" placeholder="Vor- und Nachname" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="v2-email">E-Mail</label>
                  <input id="v2-email" type="email" name="email" placeholder="ihre@email.de" required />
                </div>
                <div className="v2-field">
                  <label htmlFor="v2-msg">Nachricht</label>
                  <textarea id="v2-msg" name="nachricht" rows={4} placeholder="Kurz zu Ihrem Objekt und Anliegen" required />
                </div>
                <button type="submit" className="v2-btn" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                  {submitting ? 'Wird gesendet …' : 'Gratis-Pilot anfragen'} <Arrow />
                </button>
                {submitError && (
                  <p className="v2-form-error">
                    Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie direkt an{' '}
                    <a href="mailto:info@quadratblick.de">info@quadratblick.de</a>.
                  </p>
                )}
                <p className="v2-form-note">
                  Ihre Angaben werden ausschließlich zur Kontaktaufnahme genutzt. Mehr dazu in der{' '}
                  <a href="/datenschutz.html">Datenschutzerklärung</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CloseSections() {
  return (
    <>
      <Tiers />
      <Retainer />
      <Faq />
      <Contact />
    </>
  );
}
