import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Section, SectionHead } from '../components/ui/Layout.jsx';
import { Button } from '../components/ds/Button.jsx';
import { Icon } from '../components/ui/Icon.jsx';

/* ============================ Data ============================ */
const fotoData = {
  none: { name: 'Kein Foto', price: 0, hours: 0 },
  basis: { name: 'Foto Basis', price: 390, hours: 2 },
  premium: { name: 'Foto Premium', price: 590, hours: 3 },
};
const videoData = {
  none: { name: 'Kein Video', price: 0, hours: 0 },
  objektfilm: { name: 'Objektfilm', price: 890, hours: 5 },
  maklerfilm: { name: 'Makler-Film', price: 1290, hours: 7 },
};
const addonData = {
  walkthrough: { name: 'Walk-Through Video', price: 390, hours: 2 },
  drohne: { name: 'Drohnenaufnahmen', price: 150, hours: 1 },
  express: { name: 'Express-Lieferung', pct: 30 },
  retusche: { name: 'Objektentfernung / Retusche', price: 0, note: true },
  homestaging: { name: 'Virtuelles Home Staging', price: 190 },
};

const STEP_LABELS = ['Rabatt', 'Bedarf', 'Paket', 'Optionen', 'Termin', 'Kontakt', 'Prüfen', 'Fertig'];
const MIN_LEAD_DAYS = 3;
const DEMO_FULLY_BOOKED_INDEXES = [1, 3];
const MAX_WINDOW = 8;

const WEEKDAY_LABEL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONTH_LABEL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/* ============================ Date helpers ============================ */
const pad2 = (n) => String(n).padStart(2, '0');
const dateKey = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round((d - firstThursday) / 86400000 / 7);
}
const isThirdSaturday = (d) => d.getDay() === 6 && d.getDate() >= 15 && d.getDate() <= 21;
const formatDateLabel = (d) => `${WEEKDAY_LABEL[d.getDay()]}, ${d.getDate()}. ${MONTH_LABEL[d.getMonth()]}`;

function generateProductionDays(maxDays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const list = [];
  for (let i = MIN_LEAD_DAYS; i <= maxDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const wk = isoWeek(d);
    if (dow === 1 && wk % 2 === 0) list.push({ date: d, key: dateKey(d), window: [9, 17] });
    else if (dow === 5 && wk % 2 === 1) list.push({ date: d, key: dateKey(d), window: [9, 17] });
    else if (isThirdSaturday(d)) list.push({ date: d, key: dateKey(d), window: [9, 14] });
  }
  return list;
}
function hasFreeSlot(day, durationHours) {
  // No demo bookings configured → any day with a wide-enough window has slots.
  return day.window[1] - day.window[0] >= durationHours;
}
const timeLabel = (mins) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;
function generateTimeSlots(day, durationHours) {
  const stepMin = 30;
  const winStart = day.window[0] * 60;
  const winEnd = day.window[1] * 60;
  const durMin = durationHours * 60;
  const slots = [];
  for (let t = winStart; t + durMin <= winEnd; t += stepMin) {
    slots.push({ start: t, label: `${timeLabel(t)}–${timeLabel(t + durMin)} Uhr` });
  }
  return slots;
}

/* ============================ Pricing / duration ============================ */
const fmt = (n) => n.toLocaleString('de-DE');
const objWalkEligible = (o) => o.foto !== 'none' && o.video === 'none';

function objDurationHours(o) {
  let h = 0;
  if (o.foto !== 'none') h += fotoData[o.foto].hours;
  if (o.video !== 'none') h += videoData[o.video].hours;
  if (o.addons.drohne) h += addonData.drohne.hours;
  if (o.addons.walkthrough && objWalkEligible(o)) h += addonData.walkthrough.hours;
  return h;
}
function objBaseTotal(o) {
  let t = 0;
  if (o.foto !== 'none') t += fotoData[o.foto].price;
  if (o.video !== 'none') t += videoData[o.video].price;
  if (o.addons.walkthrough && objWalkEligible(o)) t += addonData.walkthrough.price;
  if (o.addons.drohne) t += addonData.drohne.price;
  if (o.addons.homestaging && o.foto !== 'none') t += addonData.homestaging.price;
  return t;
}
function objFinalTotal(o) {
  let t = objBaseTotal(o);
  if (o.addons.express) t *= 1.3;
  return Math.round(t);
}
function objAddonLines(o) {
  const lines = [];
  if (o.foto !== 'none') lines.push([fotoData[o.foto].name, fotoData[o.foto].price]);
  if (o.video !== 'none') lines.push([videoData[o.video].name, videoData[o.video].price]);
  if (o.addons.walkthrough && objWalkEligible(o)) lines.push([addonData.walkthrough.name, addonData.walkthrough.price]);
  if (o.addons.drohne) lines.push([addonData.drohne.name, addonData.drohne.price]);
  if (o.addons.homestaging && o.foto !== 'none') lines.push([addonData.homestaging.name, addonData.homestaging.price]);
  if (o.addons.retusche) lines.push([addonData.retusche.name, null]);
  if (o.addons.express) lines.push([addonData.express.name, '+30%']);
  return lines;
}

const emptyObject = () => ({ foto: 'none', video: 'none', addons: {} });
const emptyContact = { vorname: '', nachname: '', email: '', telefon: '', firma: '', adresse: '', nachricht: '' };
const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function encodeForm(data) {
  return Object.keys(data)
    .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');
}

/* ============================ Shared style fragments ============================ */
const CARD_TRANSITION = 'border-color var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard), background var(--dur-base) var(--ease-standard)';

function selectableCardStyle(selected, { disabled = false } = {}) {
  return {
    background: 'var(--surface-card)',
    border: selected ? '2px solid var(--color-accent)' : '2px solid var(--border-hair)',
    boxShadow: selected ? '0 0 0 3px rgba(188,107,67,0.12)' : 'none',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: CARD_TRANSITION,
    textAlign: 'left',
    width: '100%',
    fontFamily: 'var(--font-body)',
  };
}

const H4 = { fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '17px', color: 'var(--text-strong)', margin: 0, letterSpacing: 'var(--ls-heading)' };
const DESC = { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body)', fontSize: '14px', lineHeight: 'var(--lh-normal)', color: 'var(--text-muted)', margin: 0 };
const STEP_H2 = { fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: 'clamp(1.25rem, 2.4vw, 1.55rem)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-strong)', margin: 0 };
const GROUP_LABEL = { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '4px 0 10px' };
const OBJ_HEAD = { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '13px', letterSpacing: '0.04em', color: 'var(--color-accent)', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-hair)' };
const FADE_NOTE = { fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--status-warning)', margin: '18px 0 0' };

const intentIcons = { foto: 'camera', video: 'video', both: 'clapperboard' };
const intentText = {
  foto: { title: 'Nur Fotos', desc: 'Bildstrecke fürs Inserat.' },
  video: { title: 'Nur Video', desc: 'Objektfilm oder Makler-Film.' },
  both: { title: 'Foto & Video', desc: 'Kombiniertes Produktionspaket.' },
};

/* ============================ Component ============================ */
export function Booking() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [objectCount, setObjectCount] = useState(1);
  const [intent, setIntent] = useState(null);
  const [objects, setObjects] = useState([emptyObject(), emptyObject()]);
  const [slot, setSlot] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [contact, setContact] = useState(emptyContact);
  const [agbChecked, setAgbChecked] = useState(false);

  const activeObjects = objects.slice(0, objectCount);

  const totalDurationHours = activeObjects.reduce((s, o) => s + objDurationHours(o), 0);

  const calcTotal = useMemo(() => {
    const sums = activeObjects.map(objFinalTotal);
    const raw = sums.reduce((a, b) => a + b, 0);
    const discount = objectCount >= 2 ? Math.round(raw * 0.1) : 0;
    return { raw, discount, final: raw - discount };
  }, [objects, objectCount]);

  /* --- mutation helpers (reset termin whenever the config changes) --- */
  const resetTermin = () => { setSlot(null); setFallback(false); };

  function updateObject(idx, mutate) {
    setObjects((prev) => {
      const next = prev.map((o, i) => (i === idx ? { ...o, addons: { ...o.addons } } : o));
      mutate(next[idx]);
      return next;
    });
    resetTermin();
  }

  function chooseObjectCount(n) {
    setObjectCount(n);
    resetTermin();
  }

  function chooseIntent(value) {
    setIntent(value);
    setObjects((prev) => prev.map((o) => {
      const next = { ...o };
      if (value === 'video') next.foto = 'none';
      if (value === 'foto') next.video = 'none';
      return next;
    }));
    resetTermin();
  }

  function setPackage(idx, group, key) {
    updateObject(idx, (o) => {
      o[group] = key;
      // Walk-Through is only valid with a foto package and no video — drop it otherwise.
      if (o.addons.walkthrough && !objWalkEligible(o)) o.addons.walkthrough = false;
    });
  }

  function toggleAddon(idx, key) {
    updateObject(idx, (o) => { o.addons[key] = !o.addons[key]; });
  }

  /* --- validation gates --- */
  function objHasPackage(o) {
    if (intent === 'foto') return o.foto !== 'none';
    if (intent === 'video') return o.video !== 'none';
    if (intent === 'both') return o.foto !== 'none' && o.video !== 'none';
    return false;
  }
  const hasPackageSelection = activeObjects.every(objHasPackage);
  const contactValid = contact.vorname.trim() && contact.nachname.trim() && emailValid(contact.email) && contact.adresse.trim();
  const hasTerminSelection = !!slot || fallback;

  function stepValid(s) {
    if (s === 2) return !!intent;
    if (s === 3) return hasPackageSelection;
    if (s === 5) return hasTerminSelection;
    if (s === 6) return !!contactValid;
    if (s === 7) return agbChecked;
    return true;
  }
  const canAdvance = stepValid(step);

  /* --- production day candidates (step 5) --- */
  const candidates = useMemo(() => {
    if (totalDurationHours > MAX_WINDOW) return [];
    return generateProductionDays(120)
      .filter((d) => d.window[1] - d.window[0] >= totalDurationHours)
      .slice(0, 6)
      .map((d, idx) => ({
        day: d,
        available: DEMO_FULLY_BOOKED_INDEXES.includes(idx) ? false : hasFreeSlot(d, totalDurationHours),
      }));
  }, [totalDurationHours]);

  const overflow = totalDurationHours > MAX_WINDOW;
  const noCandidates = !overflow && candidates.length === 0;
  const allBooked = candidates.length > 0 && candidates.every((c) => !c.available);
  const forcedFallback = overflow || noCandidates || allBooked;

  /* --- navigation --- */
  function goStep(n) {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    // If landing on the termin step and no real termin can be chosen, lock in the fallback.
    if (n === 5) {
      const dur = activeObjects.reduce((s, o) => s + objDurationHours(o), 0);
      const cand = dur > MAX_WINDOW ? [] : generateProductionDays(120).filter((d) => d.window[1] - d.window[0] >= dur).slice(0, 6);
      const noAvail = dur > MAX_WINDOW || cand.length === 0 || cand.every((d, idx) => DEMO_FULLY_BOOKED_INDEXES.includes(idx) || !hasFreeSlot(d, dur));
      if (noAvail && !slot) { setFallback(true); }
    }
  }

  function next() {
    if (step === 7) { submitToNetlify(); goStep(8); return; }
    if (step < 8 && canAdvance) goStep(step + 1);
  }
  function back() { if (step > 1) goStep(step - 1); }

  const nextLabels = { 1: 'Bedarf auswählen', 2: 'Paket auswählen', 3: 'Optionen wählen', 4: 'Termin auswählen', 5: 'Kontaktdaten eingeben', 6: 'Angaben prüfen', 7: 'Terminanfrage verbindlich senden' };

  function buildZusammenfassung() {
    const terminText = slot ? slot.label : 'Individuelle Terminanfrage (persönliche Abstimmung)';
    const parts = [`Objektanzahl: ${objectCount}`];
    activeObjects.forEach((o, i) => {
      parts.push(`Objekt ${i + 1} – Fotografie: ${fotoData[o.foto].name} · Video: ${videoData[o.video].name}`);
    });
    parts.push(`Wunschtermin: ${terminText}`);
    parts.push(`Geschätzte Gesamtsumme (netto): ${fmt(calcTotal.final)} €`);
    return parts.join('\n');
  }

  function submitToNetlify() {
    const payload = {
      'form-name': 'terminanfrage',
      'bot-field': '',
      vorname: contact.vorname, nachname: contact.nachname, email: contact.email,
      telefon: contact.telefon, firma: contact.firma, adresse: contact.adresse, nachricht: contact.nachricht,
      objektanzahl: String(objectCount),
      wunschtermin: slot ? slot.label : 'Individuelle Terminanfrage',
      zusammenfassung: buildZusammenfassung(),
    };
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encodeForm(payload) }).catch(() => {});
  }

  /* ============================ Render ============================ */
  return (
    <Section bg="surface" id="booking" divider>
      <Container>
        <SectionHead
          eyebrow="Verbindliche Terminanfrage"
          title="Stellen Sie Ihr Paket zusammen und fragen Sie Ihren Wunschtermin an."
          lead="Die Anfrage ist für Sie unverbindlich — wir bestätigen Ihren Termin nach kurzer persönlicher Rückmeldung."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start', marginTop: 'clamp(28px, 4vw, 40px)' }} className="qb-shell">
          {/* -------- Main column (takes 2 columns on wide screens) -------- */}
          <div style={{ minWidth: 0, gridColumn: 'span 2' }} className="qb-main">
                {/* Stepper */}
                <Stepper step={step} maxStep={maxStep} onJump={(s) => { if (s <= maxStep && s !== step) goStep(s); }} />

                {/* Panel */}
                <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 'clamp(20px, 3vw, 32px)', marginTop: '18px' }}>
                  {step === 1 && (
                    <StepShell title="Wie viele Objekte möchten Sie anfragen?" desc="Planen wir mehrere Objekte am selben Produktionstermin ein, sparen wir uns Anfahrt und Koordinationsaufwand – das geben wir als Rabatt weiter.">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                        {[1, 2].map((n) => (
                          <button key={n} type="button" onClick={() => chooseObjectCount(n)} style={{ ...selectableCardStyle(objectCount === n), padding: '20px' }}>
                            <h4 style={H4}>{n === 1 ? '1 Objekt' : '2 Objekte'}</h4>
                            <p style={{ ...DESC, marginTop: '8px' }}>
                              {n === 1 ? 'Ein Objekt, ein Termin.' : 'Zwei Objekte am selben Termin – Paket und Optionen wählen Sie für jedes Objekt einzeln.'}
                            </p>
                            {n === 2 && (
                              <span style={{ display: 'inline-block', marginTop: '12px', padding: '5px 12px', borderRadius: 'var(--radius-pill)', background: 'var(--color-accent-tint)', color: 'var(--color-accent-deep)', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '12.5px' }}>
                                −10 % Rabatt auf den Gesamtpreis
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </StepShell>
                  )}

                  {step === 2 && (
                    <StepShell title="Was benötigen Sie?" desc="Wählen Sie die Richtung – die passenden Pakete zeigen wir Ihnen im nächsten Schritt.">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                        {['foto', 'video', 'both'].map((key) => (
                          <button key={key} type="button" onClick={() => chooseIntent(key)} style={{ ...selectableCardStyle(intent === key), padding: '22px 18px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <span style={{ display: 'inline-flex', width: '46px', height: '46px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: intent === key ? 'var(--color-accent-tint)' : 'var(--surface-sunk)', color: 'var(--color-accent)' }}>
                              <Icon name={intentIcons[key]} size={22} color="var(--color-accent)" />
                            </span>
                            <h4 style={H4}>{intentText[key].title}</h4>
                            <p style={{ ...DESC, textAlign: 'center' }}>{intentText[key].desc}</p>
                          </button>
                        ))}
                      </div>
                      {!intent && <p style={FADE_NOTE}>Bitte wählen Sie eine Option, um fortzufahren.</p>}
                    </StepShell>
                  )}

                  {step === 3 && (
                    <PackageStep intent={intent} objectCount={objectCount} objects={objects} onPick={setPackage} valid={hasPackageSelection} />
                  )}

                  {step === 4 && (
                    <AddonStep intent={intent} objectCount={objectCount} objects={objects} onToggle={toggleAddon} />
                  )}

                  {step === 5 && (
                    <TerminStep
                      durH={totalDurationHours}
                      objectCount={objectCount}
                      overflow={overflow}
                      noCandidates={noCandidates}
                      candidates={candidates}
                      slot={slot}
                      fallback={fallback}
                      onPick={(d, timeSlot) => {
                        setSlot({ key: d.key, dateLabel: formatDateLabel(d.date), timeLabel: timeSlot.label, label: `${formatDateLabel(d.date)}, ${timeSlot.label}` });
                        setFallback(false);
                      }}
                      onFallback={() => { setFallback(true); setSlot(null); }}
                      forced={forcedFallback}
                    />
                  )}

                  {step === 6 && (
                    <ContactStep contact={contact} setContact={setContact} valid={!!contactValid} />
                  )}

                  {step === 7 && (
                    <RecapStep objectCount={objectCount} activeObjects={activeObjects} slot={slot} contact={contact} total={calcTotal.final} agbChecked={agbChecked} onToggleAgb={() => setAgbChecked((v) => !v)} />
                  )}

                  {step === 8 && (
                    <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                      <span style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-tint)', color: 'var(--status-success)', marginBottom: '18px' }}>
                        <Icon name="check" size={34} color="var(--status-success)" />
                      </span>
                      <h2 style={STEP_H2}>Terminanfrage gesendet</h2>
                      <p style={{ ...DESC, maxWidth: '46ch', margin: '14px auto 0' }}>
                        Vielen Dank! Wir prüfen Ihre Anfrage und melden uns in der Regel innerhalb von 1–2 Werktagen persönlich mit einer verbindlichen Bestätigung Ihres Termins.
                      </p>
                    </div>
                  )}

                  {step !== 8 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-hair)' }}>
                      <Button variant="ghost" onClick={back} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>Zurück</Button>
                      <Button variant="primary" onClick={next} disabled={!canAdvance} iconRight={<Icon name="arrow-right" size={17} />}>
                        {nextLabels[step] || 'Weiter'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* -------- Summary sidebar -------- */}
              <SummarySidebar
                activeObjects={activeObjects}
                objectCount={objectCount}
                discount={calcTotal.discount}
                total={calcTotal.final}
                totalDurationHours={totalDurationHours}
                slot={slot}
                fallback={fallback}
              />
          </div>
      </Container>
    </Section>
  );
}

/* ============================ Sub-components ============================ */
function StepShell({ title, desc, children }) {
  return (
    <div>
      <h2 style={STEP_H2}>{title}</h2>
      {desc && <p style={{ ...DESC, margin: '10px 0 22px' }}>{desc}</p>}
      {children}
    </div>
  );
}

function Stepper({ step, maxStep, onJump }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        const active = s === step;
        const done = s < step;
        const locked = s > maxStep;
        return (
          <button
            key={s}
            type="button"
            disabled={locked}
            onClick={() => onJump(s)}
            style={{
              display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left',
              padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              border: '1px solid', borderColor: active ? 'var(--color-accent)' : 'var(--border-hair)',
              background: active ? 'var(--color-accent-tint)' : 'var(--surface-card)',
              cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.45 : 1,
              fontFamily: 'var(--font-body)', transition: CARD_TRANSITION,
            }}
          >
            <span style={{ fontSize: '10.5px', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'var(--fw-body-medium)' }}>
              Schritt {s}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 'var(--fw-body-bold)', color: active ? 'var(--color-accent-deep)' : done ? 'var(--text-strong)' : 'var(--text-body)' }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ObjectColumns({ objectCount, render }) {
  if (objectCount === 2) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {[0, 1].map((idx) => (
          <div key={idx} style={{ minWidth: 0 }}>
            <div style={OBJ_HEAD}>Objekt {idx + 1}</div>
            {render(idx)}
          </div>
        ))}
      </div>
    );
  }
  return <div>{render(0)}</div>;
}

function OptCard({ selected, name, price, desc, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ ...selectableCardStyle(selected), padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ display: 'inline-flex', width: '18px', height: '18px', flex: 'none', borderRadius: '50%', border: selected ? '5px solid var(--color-accent)' : '2px solid var(--border-strong)', transition: CARD_TRANSITION }} />
        <h4 style={H4}>{name}</h4>
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '14px', color: 'var(--color-accent)', paddingLeft: '28px' }}>{price}</div>
      <p style={{ ...DESC, paddingLeft: '28px' }}>{desc}</p>
    </button>
  );
}

function PackageStep({ intent, objectCount, objects, onPick, valid }) {
  const titles = {
    foto: { t: 'Welches Foto-Paket passt zu Ihrem Objekt?', d: 'Für Wohnungen und klassische Immobilien ist unser Foto-Basis-Paket ideal. Bei besonderen oder hochpreisigen Objekten empfehlen wir Foto Premium.' },
    video: { t: 'Welcher Immobilienfilm passt zu Ihrer Vermarktung?', d: 'Der Objektfilm setzt die Immobilie atmosphärisch in Szene. Mit dem Makler-Film präsentieren Sie das Objekt persönlich und stärken zugleich Ihre eigene Marke.' },
    both: { t: 'Stellen Sie Ihr Produktionspaket zusammen', d: 'Kombinieren Sie das passende Foto- und Video-Paket. Je nach Umfang benötigen Videoaufnahmen etwa 5–8 Std. und Fotoaufnahmen etwa 2–4 Std.' },
  };
  const cfg = titles[intent] || titles.foto;
  const grid = (idx) => {
    const o = objects[idx];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {intent !== 'video' && (
          <div>
            <div style={GROUP_LABEL}>Fotografie</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <OptCard selected={o.foto === 'basis'} name="Foto Basis" price="390 € netto" desc="Ca. 20 professionell bearbeitete Aufnahmen. Ideal für Wohnungen und klassische Immobilieninserate." onClick={() => onPick(idx, 'foto', 'basis')} />
              <OptCard selected={o.foto === 'premium'} name="Foto Premium" price="590 € netto" desc="30–40 Aufnahmen inkl. Detail- und Atmosphärenbildern. Für eine emotionale, hochwertige Vermarktung." onClick={() => onPick(idx, 'foto', 'premium')} />
            </div>
          </div>
        )}
        {intent !== 'foto' && (
          <div>
            <div style={GROUP_LABEL}>Video</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              <OptCard selected={o.video === 'objektfilm'} name="Objektfilm" price="890 € netto" desc="Ein hochwertiger Immobilienfilm, der Räume, Details und Atmosphäre eindrucksvoll in Szene setzt." onClick={() => onPick(idx, 'video', 'objektfilm')} />
              <OptCard selected={o.video === 'maklerfilm'} name="Makler-Film" price="1.290 € netto" desc="Atmosphärische Aufnahmen kombiniert mit Ihrer persönlichen Präsentation vor der Kamera." onClick={() => onPick(idx, 'video', 'maklerfilm')} />
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <StepShell title={cfg.t} desc={cfg.d}>
      <ObjectColumns objectCount={objectCount} render={grid} />
      {!valid && <p style={FADE_NOTE}>Bitte treffen Sie für jedes Objekt eine Auswahl, um fortzufahren.</p>}
    </StepShell>
  );
}

function InfoButton({ note }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onOutside, true);
    document.addEventListener('touchstart', onOutside, true);
    return () => {
      document.removeEventListener('click', onOutside, true);
      document.removeEventListener('touchstart', onOutside, true);
    };
  }, [open]);

  if (!note) return null;
  return (
    <span
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => { e.stopPropagation(); setOpen(true); }}
      style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '19px', height: '19px', borderRadius: '50%',
        border: '1.5px solid var(--border-strong)', color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '11px',
        cursor: 'help', touchAction: 'manipulation',
      }}>?</span>
      {open && (
        <span style={{
          position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          width: 'min(240px, 70vw)', background: 'var(--color-primary)', color: 'var(--color-on-primary)',
          borderRadius: 'var(--radius-md)', padding: '10px 13px', fontSize: '12px', fontWeight: 'var(--fw-body)',
          lineHeight: 1.5, boxShadow: 'var(--shadow-lg)', zIndex: 20, textAlign: 'left',
          fontFamily: 'var(--font-body)',
        }}>{note}</span>
      )}
    </span>
  );
}

function CheckLine({ selected, disabled, name, price, note, onClick }) {
  return (
    <button type="button" onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...selectableCardStyle(selected, { disabled }), padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <span style={{ display: 'inline-flex', width: '20px', height: '20px', flex: 'none', borderRadius: '6px', alignItems: 'center', justifyContent: 'center', border: selected ? '2px solid var(--color-accent)' : '2px solid var(--border-strong)', background: selected ? 'var(--color-accent)' : 'transparent', transition: CARD_TRANSITION }}>
        {selected && <Icon name="check" size={13} color="var(--color-on-accent)" strokeWidth={3} />}
      </span>
      <span style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '14.5px', color: 'var(--text-strong)' }}>{name}</span>
        <InfoButton note={note} />
      </span>
      <span style={{ flex: 'none', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '14px', color: disabled ? 'var(--text-muted)' : 'var(--color-accent)' }}>{price}</span>
    </button>
  );
}

function AddonStep({ intent, objectCount, objects, onToggle }) {
  const col = (idx) => {
    const o = objects[idx];
    const walkEligible = objWalkEligible(o);
    const isVideo = o.video !== 'none';
    const isCombo = o.foto !== 'none' && o.video !== 'none';
    const expressDays = isCombo ? '5 Tagen' : (isVideo ? '3 Tagen' : '48 Stunden');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <div style={GROUP_LABEL}>Bei der Aufnahme</div>
          {walkEligible && (
            <CheckLine selected={!!o.addons.walkthrough} name="Walk-Through Video" price="+390 €" note="Ein professionell produzierter Rundgang, der Raumgefühl und Atmosphäre authentisch vermittelt. Ideal für Exposé, Website und Social Media – in 4K sowie im Hoch- oder Querformat." onClick={() => onToggle(idx, 'walkthrough')} />
          )}
          {!walkEligible && intent === 'video' && (
            <CheckLine disabled name="Walk-Through Video" price="–" note="Nur als Erweiterung bei Foto-Paketen buchbar." />
          )}
          <CheckLine selected={!!o.addons.drohne} name="Drohnenaufnahmen" price="+150 €" note="Präsentieren Sie Immobilie, Grundstück und Umgebung aus einer eindrucksvollen Perspektive. Besonders empfehlenswert bei Häusern, großzügigen Grundstücken und attraktiven Lagen." onClick={() => onToggle(idx, 'drohne')} />
        </div>
        <div>
          <div style={GROUP_LABEL}>Bei der Bearbeitung</div>
          <CheckLine selected={!!o.addons.express} name="Express-Lieferung" price="+30 %" note={`Sie benötigen die Bilder besonders kurzfristig? Mit der Express-Lieferung erhalten Sie die final bearbeiteten Aufnahmen innerhalb von ${expressDays}.`} onClick={() => onToggle(idx, 'express')} />
          <CheckLine selected={!!o.addons.retusche} name="Objektentfernung / Retusche" price="n. Absprache" note="Störende Möbel, Gegenstände oder andere Bildelemente können auf Wunsch digital entfernt oder retuschiert werden. Den Aufwand und den Festpreis stimmen wir vor dem Termin transparent mit Ihnen ab." onClick={() => onToggle(idx, 'retusche')} />
          {o.foto !== 'none' && (
            <CheckLine selected={!!o.addons.homestaging} name="Virtuelles Home Staging" price="+190 €" note="Wir verwandeln bis zu 5 Aufnahmen leerer Räume in hochwertige, realistisch eingerichtete Wohnwelten. Einrichtungsstil, Möbel und Dekoration werden passend zum Objekt und zur gewünschten Zielgruppe ausgewählt." onClick={() => onToggle(idx, 'homestaging')} />
          )}
        </div>
      </div>
    );
  };
  return (
    <StepShell title={objectCount === 2 ? 'Ergänzen Sie Ihre Pakete' : 'Ergänzen Sie Ihr Paket'} desc="Optional – nach Bedarf ergänzen, je Objekt individuell.">
      <ObjectColumns objectCount={objectCount} render={col} />
    </StepShell>
  );
}

function TerminStep({ durH, objectCount, overflow, noCandidates, candidates, slot, fallback, onPick, onFallback, forced }) {
  const [openKey, setOpenKey] = useState(null);
  return (
    <StepShell title="Wählen Sie Ihren Wunschtermin" desc="Auf Grundlage Ihrer Auswahl planen wir ausreichend Zeit für eine hochwertige und reibungslose Produktion.">
      <div style={{ background: 'var(--surface-sunk)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-md)', padding: '14px 16px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-body)', marginBottom: '18px' }}>
        <b style={{ fontWeight: 'var(--fw-body-bold)' }}>Voraussichtliche Produktionszeit:</b> ca. {durH} Std.
        {objectCount > 1 ? ` (für ${objectCount} Objekte am selben Tag)` : ''}
      </div>

      {overflow && (
        <WarnBox title="Persönliche Terminabstimmung erforderlich">
          Ihre gewählte Kombination benötigt rund {durH} Std. und überschreitet damit die Dauer eines regulären Produktionstags. Sie können Ihre Anfrage dennoch unverbindlich fortsetzen. Gemeinsam klären wir anschließend, ob die Produktion auf zwei Termine verteilt oder als individueller Sondertermin umgesetzt wird.
        </WarnBox>
      )}

      {noCandidates && (
        <WarnBox title="Aktuell keine Produktionstage">
          Für diese Dauer haben wir in den nächsten Wochen keinen passenden Produktionstag gefunden. Bitte senden Sie uns eine individuelle Terminanfrage.
        </WarnBox>
      )}

      {!overflow && !noCandidates && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {candidates.map((item) => {
            const d = item.day;
            const picked = slot && slot.key === d.key;
            const isOpen = openKey === d.key;
            const slots = item.available ? generateTimeSlots(d, durH) : [];
            return (
              <div key={d.key} style={{
                background: 'var(--surface-card)',
                border: picked ? '2px solid var(--color-accent)' : '2px solid var(--border-hair)',
                boxShadow: picked ? '0 0 0 3px rgba(188,107,67,0.12)' : 'none',
                borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: CARD_TRANSITION,
              }}>
                <button type="button" disabled={!item.available}
                  onClick={item.available ? () => setOpenKey(isOpen ? null : d.key) : undefined}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', padding: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    cursor: item.available ? 'pointer' : 'not-allowed', opacity: item.available ? 1 : 0.6,
                    fontFamily: 'var(--font-body)', textAlign: 'left',
                  }}>
                  <span style={{ textAlign: 'left' }}>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '15px', color: 'var(--text-strong)' }}>{formatDateLabel(d.date)}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {picked ? slot.timeLabel : `${d.window[0]}–${d.window[1]} Uhr`}
                    </span>
                  </span>
                  <span style={{
                    flex: 'none', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '12.5px',
                    padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                    background: item.available ? 'rgba(92,112,72,0.14)' : 'rgba(164,88,58,0.12)',
                    color: item.available ? 'var(--status-success)' : 'var(--status-danger)',
                  }}>
                    {item.available ? 'Termine verfügbar' : 'Keine Termine verfügbar'}
                  </span>
                </button>
                {isOpen && item.available && (
                  <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: '8px' }}>
                    {slots.map((ts) => {
                      const timeSelected = picked && slot.timeLabel === ts.label;
                      return (
                        <button key={ts.start} type="button" onClick={() => { onPick(d, ts); setOpenKey(null); }}
                          style={{
                            ...selectableCardStyle(timeSelected), padding: '9px 6px', textAlign: 'center',
                            fontSize: '13px', fontWeight: 'var(--fw-body-medium)', color: 'var(--text-strong)',
                          }}>
                          {ts.label.replace(' Uhr', '')}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!forced && !overflow && !noCandidates && (
        <button type="button" onClick={onFallback} style={{ background: 'none', border: 'none', padding: '14px 0 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '14px', color: 'var(--color-accent)', textDecoration: 'underline', textAlign: 'left' }}>
          Kein passender Termin dabei? Individuelle Terminanfrage senden
        </button>
      )}

      {(fallback || forced) && (
        <div style={{ marginTop: '16px', background: 'var(--surface-card)', border: '2px solid var(--color-accent)', boxShadow: '0 0 0 3px rgba(188,107,67,0.12)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <b style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', color: 'var(--text-strong)' }}>Unverbindliche Terminanfrage</b>
          <p style={{ ...DESC, margin: '6px 0 0' }}>Sie müssen jetzt keinen Termin auswählen. Nach Eingang Ihrer Anfrage melden wir uns persönlich mit passenden Terminvorschlägen.</p>
        </div>
      )}
    </StepShell>
  );
}

function WarnBox({ title, children }) {
  return (
    <div style={{ background: 'var(--color-accent-tint)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', padding: '16px 18px', marginBottom: '14px' }}>
      <b style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', color: 'var(--color-accent-deep)', display: 'block', marginBottom: '4px' }}>{title}</b>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 'var(--lh-normal)', color: 'var(--text-body)' }}>{children}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-medium)', fontSize: '13px', color: 'var(--text-body)' }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '11px 13px',
  fontFamily: 'var(--font-body)', fontSize: '14.5px', color: 'var(--text-strong)',
  background: 'var(--surface-card)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-sm)',
  outline: 'none', transition: CARD_TRANSITION,
};

function ContactStep({ contact, setContact, valid }) {
  const upd = (k) => (e) => setContact((c) => ({ ...c, [k]: e.target.value }));
  return (
    <StepShell title="Ihre Kontaktdaten" desc="Damit wir Ihre Terminanfrage zuordnen und bestätigen können.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Field label="Vorname *"><input type="text" value={contact.vorname} onChange={upd('vorname')} style={inputStyle} /></Field>
        <Field label="Nachname *"><input type="text" value={contact.nachname} onChange={upd('nachname')} style={inputStyle} /></Field>
        <Field label="E-Mail *"><input type="email" value={contact.email} onChange={upd('email')} style={inputStyle} /></Field>
        <Field label="Telefon"><input type="tel" value={contact.telefon} onChange={upd('telefon')} style={inputStyle} /></Field>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Firma / Maklerbüro"><input type="text" value={contact.firma} onChange={upd('firma')} style={inputStyle} /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Objektadresse(n) *"><input type="text" value={contact.adresse} onChange={upd('adresse')} placeholder="Straße, PLZ, Ort — bei 2 Objekten beide angeben" style={inputStyle} /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Nachricht"><textarea value={contact.nachricht} onChange={upd('nachricht')} rows={4} placeholder="Besonderheiten zum Objekt, Zeitwünsche, Rückfragen ..." style={{ ...inputStyle, resize: 'vertical' }} /></Field></div>
      </div>
      {!valid && <p style={FADE_NOTE}>Bitte füllen Sie mindestens die mit * markierten Felder korrekt aus.</p>}
    </StepShell>
  );
}

function RecapStep({ objectCount, activeObjects, slot, contact, total, agbChecked, onToggleAgb }) {
  const terminText = slot ? slot.label : 'Individuelle Terminanfrage';
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '9px 0', borderBottom: '1px solid var(--border-hair)' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '14px', color: 'var(--text-strong)', textAlign: 'right' }}>{value}</span>
    </div>
  );
  const groupHead = { fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '18px 0 4px' };
  return (
    <StepShell title="Zusammenfassung & Anfrage senden" desc="Bitte prüfen Sie Ihre Angaben – die Terminanfrage ist verbindlich, jedoch noch keine Zahlungsverpflichtung ohne unsere Bestätigung.">
      <div style={{ background: 'var(--surface-sunk)', border: '1px solid var(--border-hair)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
        {activeObjects.map((o, i) => {
          const addonNames = objAddonLines(o).slice(2).map((l) => l[0]);
          return (
            <div key={i}>
              {objectCount === 2 && <div style={groupHead}>Objekt {i + 1}</div>}
              <Row label="Fotografie" value={fotoData[o.foto].name} />
              <Row label="Video" value={videoData[o.video].name} />
              <Row label="Zusatzoptionen" value={addonNames.length ? addonNames.join(', ') : '–'} />
            </div>
          );
        })}
        <div style={groupHead}>Termin & Kontakt</div>
        <Row label="Wunschtermin" value={terminText} />
        <Row label="Kontakt" value={`${contact.vorname} ${contact.nachname} · ${contact.email}`} />
        <Row label="Objektadresse(n)" value={contact.adresse} />
        <Row label="Geschätzte Gesamtsumme" value={`${fmt(total)} € netto`} />
      </div>

      <button type="button" onClick={onToggleAgb} style={{ ...selectableCardStyle(agbChecked), marginTop: '18px', padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ display: 'inline-flex', width: '20px', height: '20px', flex: 'none', borderRadius: '6px', alignItems: 'center', justifyContent: 'center', border: agbChecked ? '2px solid var(--color-accent)' : '2px solid var(--border-strong)', background: agbChecked ? 'var(--color-accent)' : 'transparent', transition: CARD_TRANSITION }}>
          {agbChecked && <Icon name="check" size={13} color="var(--color-on-accent)" strokeWidth={3} />}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', lineHeight: 'var(--lh-normal)', color: 'var(--text-body)', textAlign: 'left' }}>
          Ich bestätige die Allgemeinen Geschäftsbedingungen von Quadratblick, insbesondere die verbindliche Terminanfrage, die Abrechnung nach Umsetzung sowie die Storno- und Widerrufsregelung.
        </span>
      </button>
    </StepShell>
  );
}

function SummarySidebar({ activeObjects, objectCount, discount, total, totalDurationHours, slot, fallback }) {
  const anyLines = activeObjects.some((o) => objAddonLines(o).length > 0);
  const anySelection = activeObjects.some((o) => o.foto !== 'none' || o.video !== 'none');
  const lineStyle = { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 0', fontFamily: 'var(--font-body)', fontSize: '13.5px' };
  return (
    <aside style={{ position: 'sticky', top: '24px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', borderRadius: 'var(--radius-lg)', padding: '22px', boxShadow: 'var(--shadow-md)' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '17px', letterSpacing: 'var(--ls-heading)', color: 'var(--color-on-primary)', margin: '0 0 14px' }}>Ihre Auswahl</h3>

      {!anyLines ? (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--color-secondary)', margin: 0 }}>Noch keine Auswahl getroffen.</p>
      ) : (
        <div>
          {activeObjects.map((o, i) => {
            const lines = objAddonLines(o);
            if (lines.length === 0) return null;
            return (
              <div key={i}>
                {objectCount === 2 && <div style={{ fontFamily: 'var(--font-body)', fontWeight: 'var(--fw-body-bold)', fontSize: '11.5px', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-secondary)', margin: '10px 0 2px' }}>Objekt {i + 1}</div>}
                {lines.map((l, j) => {
                  const val = l[1] === null ? 'n. Absprache' : (typeof l[1] === 'string' ? l[1] : `+${fmt(l[1])} €`);
                  return (
                    <div key={j} style={lineStyle}>
                      <span style={{ color: 'var(--color-on-primary)' }}>{l[0]}</span>
                      <b style={{ fontWeight: 'var(--fw-body-bold)', whiteSpace: 'nowrap' }}>{val}</b>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {objectCount > 1 && (
            <div style={{ ...lineStyle, color: 'var(--color-secondary)' }}>
              <span>Mehrobjekt-Rabatt (−10 %)</span>
              <b style={{ fontWeight: 'var(--fw-body-bold)', whiteSpace: 'nowrap' }}>-{fmt(discount)} €</b>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(243,238,229,0.22)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13.5px', color: 'var(--color-secondary)' }}>Gesamt (netto)</span>
        <b style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--fw-heading)', fontSize: '22px', color: 'var(--color-on-primary)' }}>{fmt(total)} €</b>
      </div>

      {anySelection && (
        <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(243,238,229,0.10)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 'var(--lh-normal)', color: 'var(--color-on-primary)' }}>
          {slot ? (
            <><b style={{ fontWeight: 'var(--fw-body-bold)' }}>Wunschtermin</b><br />{slot.label}</>
          ) : fallback ? (
            <><b style={{ fontWeight: 'var(--fw-body-bold)' }}>Individuelle Terminanfrage</b><br />Termin wird persönlich abgestimmt.</>
          ) : (
            <><b style={{ fontWeight: 'var(--fw-body-bold)' }}>Voraussichtliche Produktionszeit:</b> ca. {totalDurationHours} Std. · Termin noch offen</>
          )}
        </div>
      )}

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11.5px', lineHeight: 1.5, color: 'var(--color-secondary)', margin: '14px 0 0' }}>
        Alle Preise netto, zzgl. gesetzl. MwSt. Endgültige Rechnung nach Umsetzung inkl. ggf. besprochener Sonderleistungen (z. B. Retusche).
      </p>
    </aside>
  );
}
