/**
 * Zentrale Tracking-Funktion. Angebunden ist derzeit kein Tool, das
 * Ereignisse empfängt (Cloudflare Web Analytics zählt nur Seitenaufrufe).
 * `track()` spricht ein cookieloses Analyse-Tool an, sobald es geladen ist:
 * Plausible (`window.plausible`) oder Pirsch (`window.pirsch`). Ist keines
 * da, passiert still nichts. Zusätzlich geht jedes Ereignis als DOM-Event
 * `qb:track` raus, damit es sich im Browser prüfen lässt.
 *
 * Grundsatz: niemals personenbezogene Daten in Props (keine Namen,
 * E-Mail-Adressen, Telefonnummern, Freitexte). Nur feste Schlüssel.
 *
 * Ereignisse (Liste mit Auslösern auch im README):
 *   anfrage_gesendet               anliegen, objektklasse, rueckruf (ja/nein)
 *   bestandskunde_anfrage_gesendet objektklasse, ergaenzungen
 *   cta_klick                      ort (hero, navigation, preise, ablauf, zusammenarbeit)
 *   preiskachel_anfrage            klasse
 *   beispiel_geoeffnet             slug, quelle (karte, preiskachel, deeplink)
 *   telefon_klick
 *   email_klick
 */
import { useEffect } from 'react';

export function track(name, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    const hatProps = Object.keys(props).length > 0;
    if (typeof window.plausible === 'function') {
      window.plausible(name, hatProps ? { props } : undefined);
    } else if (typeof window.pirsch === 'function') {
      window.pirsch(name, hatProps ? { meta: props } : undefined);
    }
    window.dispatchEvent(new CustomEvent('qb:track', { detail: { name, props } }));
  } catch {
    // Tracking darf die Seite nie stören.
  }
}

/**
 * Einmal je Seite: wertet `data-cta` (cta_klick mit Ort) sowie
 * tel:/mailto:-Links aus.
 */
export function useKlickTracking() {
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('a, button');
      if (!el) return;
      if (el.dataset.cta) {
        track('cta_klick', { ort: el.dataset.cta });
        return;
      }
      const href = el.getAttribute('href') || '';
      if (href.startsWith('tel:')) track('telefon_klick');
      else if (href.startsWith('mailto:')) track('email_klick');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
