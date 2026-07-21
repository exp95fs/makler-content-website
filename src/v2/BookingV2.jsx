import { useEffect, useMemo, useRef, useState } from 'react';
import { Split } from './fx.jsx';
import { Arrow } from './ui.jsx';

/* ============================ Daten (identisch zum Produktiv-Stand) ============================ */
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

/* ============================ Datums-Helfer ============================ */
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
const hasFreeSlot = (day, durationHours) => day.window[1] - day.window[0] >= durationHours;
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

/* ============================ Preis / Dauer ============================ */
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

const intentText = {
  foto: { title: 'Nur Fotos', desc: 'Bildstrecke fürs Inserat.' },
  video: { title: 'Nur Video', desc: 'Objektfilm oder Makler-Film.' },
  both: { title: 'Foto & Video', desc: 'Kombiniertes Produktionspaket.' },
};

/* ============================ Bausteine ============================ */
function StepShell({ title, desc, children }) {
  return (
    <div>
      <h3 className="v2-book-h">{title}</h3>
      {desc && <p className="v2-book-desc">{desc}</p>}
      {children}
    </div>
  );
}

function Stepper({ step, maxStep, onJump }) {
  return (
    <div className="v2-stepper">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1;
        const active = s === step;
        const locked = s > maxStep;
        return (
          <button
            key={s}
            type="button"
            disabled={locked}
            onClick={() => onJump(s)}
            className={`v2-stepchip ${active ? 'is-active' : ''}`}
          >
            <span className="s">Schritt {s}</span>
            <span className="l">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ObjectColumns({ objectCount, render }) {
  if (objectCount === 2) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {[0, 1].map((idx) => (
          <div key={idx} style={{ minWidth: 0 }}>
            <div className="v2-book-objhead">Objekt {idx + 1}</div>
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
    <button type="button" onClick={onClick} className={`v2-choice ${selected ? 'is-on' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span className="v2-radio" />
        <div>
          <h4>{name}</h4>
          <span className="p">{price}</span>
          <p className="d">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function InfoButton({ note }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
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
      <span className="v2-infobtn">?</span>
      {open && <span className="v2-infotip">{note}</span>}
    </span>
  );
}

function CheckLine({ selected, disabled, name, price, note, onClick }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`v2-choice ${selected ? 'is-on' : ''}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '14px 16px' }}
    >
      <span className="v2-checkbox">{selected ? '✓' : ''}</span>
      <span style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{name}</span>
        <InfoButton note={note} />
      </span>
      <span className="p" style={{ marginTop: 0 }}>{price}</span>
    </button>
  );
}

function WarnBox({ title, children }) {
  return (
    <div className="v2-warnbox">
      <b>{title}</b>
      <span>{children}</span>
    </div>
  );
}

function PackageStep({ intent, objectCount, objects, onPick, valid }) {
  const titles = {
    foto: { t: 'Welches Foto-Paket passt zu Ihrem Objekt?', d: 'Für Wohnungen und klassische Immobilien ist unser Foto-Basis-Paket ideal für ein überzeugendes Inserat. Bei besonderen, hochpreisigen oder emotional zu vermarktenden Objekten empfehlen wir Foto Premium: Mehr Motive sowie zusätzliche Detail- und Atmosphärenaufnahmen sorgen für einen rundum hochwertigen Auftritt.' },
    video: { t: 'Welcher Immobilienfilm passt zu Ihrer Vermarktung?', d: 'Der Objektfilm setzt die Immobilie atmosphärisch in Szene – ganz ohne Auftritt vor der Kamera. Mit dem Maklerfilm präsentieren Sie das Objekt persönlich, schaffen zusätzliches Vertrauen und stärken zugleich Ihre eigene Marke.' },
    both: { t: 'Stellen Sie Ihr Produktionspaket zusammen', d: 'Kombinieren Sie das passende Foto- und Video-Paket. Je nach Umfang benötigen Videoaufnahmen etwa 5–8 Std. und Fotoaufnahmen etwa 2–4 Std.' },
  };
  const cfg = titles[intent] || titles.foto;
  const grid = (idx) => {
    const o = objects[idx];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {intent !== 'video' && (
          <div>
            <div className="v2-book-group">Fotografie</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <OptCard selected={o.foto === 'basis'} name="Foto Basis" price="390 € netto" desc="Ca. 20 professionell bearbeitete Aufnahmen. Ideal für Wohnungen und klassische Immobilieninserate." onClick={() => onPick(idx, 'foto', 'basis')} />
              <OptCard selected={o.foto === 'premium'} name="Foto Premium" price="590 € netto" desc="30–40 Aufnahmen inkl. Detail- und Atmosphärenbildern. Für eine emotionale, hochwertige Vermarktung." onClick={() => onPick(idx, 'foto', 'premium')} />
            </div>
          </div>
        )}
        {intent !== 'foto' && (
          <div>
            <div className="v2-book-group">Video</div>
            <div style={{ display: 'grid', gap: 10 }}>
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
      {!valid && <p className="v2-book-note">Bitte treffen Sie für jedes Objekt eine Auswahl, um fortzufahren.</p>}
    </StepShell>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <div className="v2-book-group">Bei der Aufnahme</div>
          {walkEligible && (
            <CheckLine selected={!!o.addons.walkthrough} name="Walk-Through Video" price="+390 €" note="Ein professionell produzierter Rundgang, der Raumgefühl und Atmosphäre authentisch vermittelt. Ideal für Exposé, Website und Social Media – in 4K sowie im Hoch- oder Querformat." onClick={() => onToggle(idx, 'walkthrough')} />
          )}
          {!walkEligible && intent === 'video' && (
            <CheckLine disabled name="Walk-Through Video" price="–" note="Nur als Erweiterung bei Foto-Paketen buchbar." />
          )}
          <CheckLine selected={!!o.addons.drohne} name="Drohnenaufnahmen" price="+150 €" note="Präsentieren Sie Immobilie, Grundstück und Umgebung aus einer eindrucksvollen Perspektive. Besonders empfehlenswert bei Häusern, großzügigen Grundstücken und attraktiven Lagen." onClick={() => onToggle(idx, 'drohne')} />
        </div>
        <div>
          <div className="v2-book-group">Bei der Bearbeitung</div>
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
      <div className="v2-recap" style={{ marginBottom: 18, fontSize: 14 }}>
        <b style={{ fontWeight: 700 }}>Voraussichtliche Produktionszeit:</b> ca. {durH} Std.
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
        <div style={{ display: 'grid', gap: 10 }}>
          {candidates.map((item) => {
            const d = item.day;
            const picked = slot && slot.key === d.key;
            const isOpen = openKey === d.key;
            const slots = item.available ? generateTimeSlots(d, durH) : [];
            return (
              <div key={d.key} className={`v2-dayrow ${picked ? 'is-on' : ''}`}>
                <button type="button" disabled={!item.available} onClick={item.available ? () => setOpenKey(isOpen ? null : d.key) : undefined}>
                  <span>
                    <span className="date">{formatDateLabel(d.date)}</span>
                    <span className="win">{picked ? slot.timeLabel : `${d.window[0]}–${d.window[1]} Uhr`}</span>
                  </span>
                  <span className={`v2-daybadge ${item.available ? 'free' : 'full'}`}>
                    {item.available ? 'Termine verfügbar' : 'Keine Termine verfügbar'}
                  </span>
                </button>
                {isOpen && item.available && (
                  <div className="v2-slots">
                    {slots.map((ts) => {
                      const timeSelected = picked && slot.timeLabel === ts.label;
                      return (
                        <button key={ts.start} type="button" className={`v2-slot ${timeSelected ? 'is-on' : ''}`} onClick={() => { onPick(d, ts); setOpenKey(null); }}>
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
        <button type="button" onClick={onFallback} style={{ background: 'none', border: 'none', padding: '14px 0 0', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, color: 'var(--terra-deep)', textDecoration: 'underline', textAlign: 'left' }}>
          Kein passender Termin dabei? Individuelle Terminanfrage senden
        </button>
      )}

      {(fallback || forced) && (
        <div className="v2-choice is-on" style={{ marginTop: 16, cursor: 'default' }}>
          <b style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14.5 }}>Unverbindliche Terminanfrage</b>
          <p className="d" style={{ marginTop: 6 }}>Sie müssen jetzt keinen Termin auswählen. Nach Eingang Ihrer Anfrage melden wir uns persönlich mit passenden Terminvorschlägen.</p>
        </div>
      )}
    </StepShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="v2-book-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ContactStep({ contact, setContact, valid }) {
  const upd = (k) => (e) => setContact((c) => ({ ...c, [k]: e.target.value }));
  return (
    <StepShell title="Ihre Kontaktdaten" desc="Damit wir Ihre Terminanfrage zuordnen und bestätigen können.">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <Field label="Vorname *"><input type="text" value={contact.vorname} onChange={upd('vorname')} /></Field>
        <Field label="Nachname *"><input type="text" value={contact.nachname} onChange={upd('nachname')} /></Field>
        <Field label="E-Mail *"><input type="email" value={contact.email} onChange={upd('email')} /></Field>
        <Field label="Telefon"><input type="tel" value={contact.telefon} onChange={upd('telefon')} /></Field>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Firma / Maklerbüro"><input type="text" value={contact.firma} onChange={upd('firma')} /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Objektadresse(n) *"><input type="text" value={contact.adresse} onChange={upd('adresse')} placeholder="Straße, PLZ, Ort — bei 2 Objekten beide angeben" /></Field></div>
        <div style={{ gridColumn: '1 / -1' }}><Field label="Nachricht"><textarea value={contact.nachricht} onChange={upd('nachricht')} rows={4} placeholder="Besonderheiten zum Objekt, Zeitwünsche, Rückfragen ..." /></Field></div>
      </div>
      {!valid && <p className="v2-book-note">Bitte füllen Sie mindestens die mit * markierten Felder korrekt aus.</p>}
    </StepShell>
  );
}

function RecapStep({ objectCount, activeObjects, slot, contact, total, agbChecked, onToggleAgb }) {
  const terminText = slot ? slot.label : 'Individuelle Terminanfrage';
  const Row = ({ label, value }) => (
    <div className="row"><span>{label}</span><b>{value}</b></div>
  );
  return (
    <StepShell title="Zusammenfassung & Anfrage senden" desc="Bitte prüfen Sie Ihre Angaben – die Terminanfrage ist verbindlich, jedoch noch keine Zahlungsverpflichtung ohne unsere Bestätigung.">
      <div className="v2-recap">
        {activeObjects.map((o, i) => {
          const addonNames = objAddonLines(o).slice(2).map((l) => l[0]);
          return (
            <div key={i}>
              {objectCount === 2 && <div className="ghead">Objekt {i + 1}</div>}
              <Row label="Fotografie" value={fotoData[o.foto].name} />
              <Row label="Video" value={videoData[o.video].name} />
              <Row label="Zusatzoptionen" value={addonNames.length ? addonNames.join(', ') : '–'} />
            </div>
          );
        })}
        <div className="ghead">Termin &amp; Kontakt</div>
        <Row label="Wunschtermin" value={terminText} />
        <Row label="Kontakt" value={`${contact.vorname} ${contact.nachname} · ${contact.email}`} />
        <Row label="Objektadresse(n)" value={contact.adresse} />
        <Row label="Geschätzte Gesamtsumme" value={`${fmt(total)} € netto`} />
      </div>

      <button type="button" onClick={onToggleAgb} className={`v2-choice ${agbChecked ? 'is-on' : ''}`} style={{ marginTop: 18, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span className="v2-checkbox">{agbChecked ? '✓' : ''}</span>
        <span style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)', textAlign: 'left' }}>
          Ich bestätige die Allgemeinen Geschäftsbedingungen von Quadratblick, insbesondere die verbindliche Terminanfrage, die Abrechnung nach Umsetzung sowie die Storno- und Widerrufsregelung.
        </span>
      </button>
    </StepShell>
  );
}

function SummarySidebar({ activeObjects, objectCount, discount, total, totalDurationHours, slot, fallback }) {
  const anyLines = activeObjects.some((o) => objAddonLines(o).length > 0);
  const anySelection = activeObjects.some((o) => o.foto !== 'none' || o.video !== 'none');
  return (
    <aside className="v2-book-summary">
      <h3>Ihre Auswahl</h3>

      {!anyLines ? (
        <p style={{ fontSize: 13.5, color: 'var(--text-inv-soft)', margin: 0 }}>Noch keine Auswahl getroffen.</p>
      ) : (
        <div>
          {activeObjects.map((o, i) => {
            const lines = objAddonLines(o);
            if (lines.length === 0) return null;
            return (
              <div key={i}>
                {objectCount === 2 && <div className="objlabel">Objekt {i + 1}</div>}
                {lines.map((l, j) => {
                  const val = l[1] === null ? 'n. Absprache' : (typeof l[1] === 'string' ? l[1] : `+${fmt(l[1])} €`);
                  return (
                    <div key={j} className="line"><span>{l[0]}</span><b>{val}</b></div>
                  );
                })}
              </div>
            );
          })}
          {objectCount > 1 && (
            <div className="line"><span>Mehrobjekt-Rabatt (−10 %)</span><b>-{fmt(discount)} €</b></div>
          )}
        </div>
      )}

      <div className="total">
        <span style={{ fontSize: 13.5, color: 'var(--text-inv-soft)' }}>Gesamt (netto)</span>
        <b>{fmt(total)} €</b>
      </div>

      {anySelection && (
        <div className="termin">
          {slot ? (
            <><b style={{ fontWeight: 700 }}>Wunschtermin</b><br />{slot.label}</>
          ) : fallback ? (
            <><b style={{ fontWeight: 700 }}>Individuelle Terminanfrage</b><br />Termin wird persönlich abgestimmt.</>
          ) : (
            <><b style={{ fontWeight: 700 }}>Voraussichtliche Produktionszeit:</b> ca. {totalDurationHours} Std. · Termin noch offen</>
          )}
        </div>
      )}

      <p className="fine">
        Alle Preise netto, zzgl. gesetzl. MwSt. Endgültige Rechnung nach Umsetzung inkl. ggf. besprochener Sonderleistungen (z. B. Retusche).
      </p>
    </aside>
  );
}

/* ============================ Hauptkomponente ============================ */
export function BookingV2() {
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
      if (o.addons.walkthrough && !objWalkEligible(o)) o.addons.walkthrough = false;
    });
  }

  function toggleAddon(idx, key) {
    updateObject(idx, (o) => { o.addons[key] = !o.addons[key]; });
  }

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

  function goStep(n) {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    if (n === 5) {
      const dur = activeObjects.reduce((s, o) => s + objDurationHours(o), 0);
      const cand = dur > MAX_WINDOW ? [] : generateProductionDays(120).filter((d) => d.window[1] - d.window[0] >= dur).slice(0, 6);
      const noAvail = dur > MAX_WINDOW || cand.length === 0 || cand.every((d, idx) => DEMO_FULLY_BOOKED_INDEXES.includes(idx) || !hasFreeSlot(d, dur));
      if (noAvail && !slot) setFallback(true);
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

  return (
    <section className="v2-sec bg-linen" id="booking">
      <div className="v2-wrap">
        <div className="v2-sec-head">
          <p className="v2-eyebrow" data-reveal>Verbindliche Terminanfrage</p>
          <Split as="h2" className="v2-h-display v2-h-lg">
            Stellen Sie Ihr Paket zusammen und fragen Sie Ihren Wunschtermin an.
          </Split>
          <p className="v2-lead" data-reveal>
            Die Anfrage ist für Sie unverbindlich — wir bestätigen Ihren Termin nach kurzer
            persönlicher Rückmeldung.
          </p>
        </div>

        <div className="v2-book-shell" data-reveal>
          <div style={{ minWidth: 0 }}>
            <Stepper step={step} maxStep={maxStep} onJump={(s) => { if (s <= maxStep && s !== step) goStep(s); }} />

            <div className="v2-book-panel">
              {step === 1 && (
                <StepShell title="Wie viele Objekte möchten Sie anfragen?" desc="Planen wir mehrere Objekte am selben Produktionstermin ein, sparen wir uns Anfahrt und Koordinationsaufwand – das geben wir als Rabatt weiter.">
                  <div className="v2-book-grid">
                    {[1, 2].map((n) => (
                      <button key={n} type="button" onClick={() => chooseObjectCount(n)} className={`v2-choice ${objectCount === n ? 'is-on' : ''}`}>
                        <h4>{n === 1 ? '1 Objekt' : '2 Objekte'}</h4>
                        <p className="d">
                          {n === 1 ? 'Ein Objekt, ein Termin.' : 'Zwei Objekte am selben Termin – Paket und Optionen wählen Sie für jedes Objekt einzeln.'}
                        </p>
                        {n === 2 && <span className="tagline">−10 % Rabatt auf den Gesamtpreis</span>}
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell title="Was benötigen Sie?" desc="Wählen Sie die Richtung – die passenden Pakete zeigen wir Ihnen im nächsten Schritt.">
                  <div className="v2-book-grid">
                    {['foto', 'video', 'both'].map((key) => (
                      <button key={key} type="button" onClick={() => chooseIntent(key)} className={`v2-choice ${intent === key ? 'is-on' : ''}`} style={{ textAlign: 'center' }}>
                        <h4>{intentText[key].title}</h4>
                        <p className="d" style={{ textAlign: 'center' }}>{intentText[key].desc}</p>
                      </button>
                    ))}
                  </div>
                  {!intent && <p className="v2-book-note">Bitte wählen Sie eine Option, um fortzufahren.</p>}
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
                  <span style={{
                    display: 'inline-flex', width: 62, height: 62, borderRadius: '50%',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px',
                    background: 'rgba(86,94,69,0.14)', color: 'var(--sage)', fontSize: 26,
                  }}>✓</span>
                  <h3 className="v2-book-h">Terminanfrage gesendet</h3>
                  <p className="v2-book-desc" style={{ maxWidth: '46ch', margin: '12px auto 0' }}>
                    Vielen Dank! Wir prüfen Ihre Anfrage und melden uns in der Regel innerhalb von 1–2 Werktagen persönlich mit einer verbindlichen Bestätigung Ihres Termins.
                  </p>
                </div>
              )}

              {step !== 8 && (
                <div className="v2-book-nav">
                  <button type="button" className="v2-btn ghost sm" onClick={back} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>Zurück</button>
                  <button type="button" className="v2-btn sm" onClick={next} disabled={!canAdvance} style={{ opacity: canAdvance ? 1 : 0.5, cursor: canAdvance ? 'pointer' : 'not-allowed' }}>
                    {nextLabels[step] || 'Weiter'} <Arrow size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

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
      </div>
    </section>
  );
}
