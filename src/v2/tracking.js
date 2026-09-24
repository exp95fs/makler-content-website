/**
 * Providerneutrale Tracking-Abstraktion. Es ist keine Analytics-Plattform
 * angebunden: Ereignisse werden als DOM-Event `qb:track` ausgelöst und, falls
 * später ein `window.dataLayer` existiert, dort abgelegt.
 *
 * Grundsatz: niemals personenbezogene Formulardaten übergeben. Erlaubt sind
 * nur Ereignisname, Formularname, Schrittnummer und Zielseite.
 *
 * Ereignisse:
 *   cta_primary          Klick auf "Verfügbarkeit prüfen"
 *   referenzen_aufruf    Aufruf der Referenzen (Seite oder Großansicht)
 *   preisbereich         Preisbereich sichtbar
 *   formular_start       erste Interaktion mit einem Formular
 *   formular_schritt     Schrittwechsel im Wizard
 *   formular_erfolg      NUR nach bestätigter erfolgreicher Übertragung
 *   formular_fehler      Übertragung fehlgeschlagen
 *   telefon_klick        Klick auf tel:-Link
 *   email_klick          Klick auf mailto:-Link
 *   cta_zusammenarbeit   Klick auf "Regelmäßige Zusammenarbeit besprechen"
 */
import { useEffect } from 'react';

export function track(event, daten = {}) {
  if (typeof window === 'undefined') return;
  const detail = { event, ...daten };
  window.dispatchEvent(new CustomEvent('qb:track', { detail }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(detail);
}

/** Einmal je Seite: wertet data-event-Attribute sowie tel:/mailto:-Links aus. */
export function useKlickTracking() {
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('a, button');
      if (!el) return;
      if (el.dataset.event) {
        track(el.dataset.event, el.getAttribute('href') ? { ziel: el.getAttribute('href') } : {});
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

/** Einmaliges Ereignis, sobald ein Element sichtbar wird. */
export function useSichtbarTracking(ref, event) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const obs = new IntersectionObserver(([eintrag]) => {
      if (!eintrag.isIntersecting) return;
      obs.disconnect();
      track(event);
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, event]);
}
