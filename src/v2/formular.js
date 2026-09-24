/**
 * Versand an Netlify Forms. Wartet auf die Serverantwort und meldet nur
 * dann Erfolg, wenn der Status erfolgreich ist. Netzwerk- und Serverfehler
 * werden als Fehler zurückgegeben, nie verschluckt.
 */
export const kodieren = (daten) => Object.keys(daten)
  .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(daten[k] ?? ''))
  .join('&');

export async function sendeFormular(daten) {
  let antwort;
  try {
    antwort = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: kodieren(daten),
    });
  } catch {
    return { ok: false, grund: 'netzwerk' };
  }
  if (!antwort.ok) return { ok: false, grund: 'server', status: antwort.status };
  return { ok: true };
}

export const emailGueltig = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
