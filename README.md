# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 2 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/ui_kits/onepager/index.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Makler-Content Design System` project files (HTML prototypes, assets, components)

---

## Referenzen: Beispiel-Inserate

Die Referenz-Sektion zeigt vollständige Beispiel-Inserate statt einzelner
Aufnahmen. Je Preisklasse ein Hauptbeispiel in einer eigenen Zeile (Titelbild
plus vier Bilder aus dem Manifest-Feld `vorschau`, Klasse und Festpreis aus
`src/content/site.js`), darunter „Weitere Projekte“. Jedes Bild der Zeile
öffnet die Galerie an genau diesem Bild. Die Reihenfolge der Zeilen folgt der
Reihenfolge von `klassen` im Manifest. Die Preiskacheln
verlinken auf das Hauptbeispiel ihrer Klasse, `#beispiel-<slug>` öffnet die
Galerie eines Listings direkt (für Links aus der Akquise).

Quelle der Wahrheit ist `referenzen-manifest.json` im Projekt-Root, die
Originalbilder liegen unter `referenzen-input/<slug>/`. Beides ist bewusst
**nicht im Repository** (`.gitignore`): das Repository ist öffentlich, und das
Manifest enthält Kunden- und Ordnernamen.

`scripts/referenzen.py` prüft das Manifest gegen die Bilder, verarbeitet nur
Listings mit `"freigegeben": true` und schreibt

- `public/images/beispiele/<slug>-<nr>-<breite>.(avif|webp|jpg)` und
- `src/content/beispiele.json` (nur öffentliche Felder, keine Originalnamen).

Dateien nicht (mehr) freigegebener Listings löscht der Lauf aus
`public/images/beispiele/`. Fehlende oder mehrdeutige Dateien brechen ab,
bevor etwas geschrieben wird. Benötigt Pillow mit AVIF (`pip install pillow`).

### Listing nachträglich freischalten

1. Originalbilder unter `referenzen-input/<slug>/` ablegen (Ordnername = Slug
   aus dem Manifest) und im Manifest `"freigegeben": true` setzen. Bei einem
   Platzhalter im Titel (z. B. `ORT_FEHLT`) vorher den Titel korrigieren,
   sonst bricht der Lauf ab.
   Optional `"vorschau": [4 Dateinamen aus "bilder", nicht das Titelbild]`
   für das Raster neben dem Titelbild; ohne das Feld nimmt das Skript die
   Galeriebilder 2–5 und warnt. `"auswahl_hinweis": false` blendet
   „Auswahl aus X gelieferten Bildern“ aus (X wird dann nicht ausgeliefert).
2. `python3 scripts/referenzen.py` ausführen. Groß gezeigt wird das eine
   Listing mit `"hauptbeispiel": true` (genau eines, sonst Abbruch); alle
   übrigen erscheinen als Karten unter „Weitere Projekte“. Welches Listing
   der Link „Beispiel ansehen“ einer Preiskachel öffnet, steht in
   `src/content/site.js` (`fotoklassen[].beispiel`).
3. `npm run build` und die Vorschau prüfen.
4. `public/images/beispiele/` und `src/content/beispiele.json` committen.

Freigabe zurücknehmen: `"freigegeben": false` setzen und dieselben Schritte
ausführen; die Bilder des Listings verschwinden dabei aus `public/`.

---

## Anfragewege

- **Startseite, `#kontakt`** – Anfrageformular für Neukunden (Netlify-Formular
  `kontakt`, verstecktes Feld `quelle=startseite`). Alle Anfrage-Buttons der
  Startseite führen hierher. Links mit `data-klasse="wohnung|einfamilienhaus|mehrfamilienhaus"`
  wählen die Objektklasse vor, `data-anliegen="regelmaessig"` das Anliegen
  (ausgewertet in `src/v2/sections/Kontakt.jsx`). Der alte Anker `#booking`
  landet ebenfalls hier.
- **`/objekt-anfragen/`** – mehrstufiger Konfigurator für bestehende Kunden
  (Netlify-Formular `terminanfrage`, `quelle=bestandskunden-seite`). Nicht in
  Navigation und Sitemap, `noindex`, kein Canonical. Verlinkt nur aus der
  Sektion „Regelmäßige Zusammenarbeit“.

Die statischen Gegenstücke beider Formulare stehen in `index.html`; Feldnamen
müssen exakt mit den React-Formularen übereinstimmen.

## Tracking

`track(name, props)` in `src/v2/tracking.js` spricht ein cookieloses
Analyse-Tool mit Events an, sobald eines geladen ist (`window.plausible` oder
`window.pirsch`), und tut sonst still nichts. Eingebunden ist derzeit nur
Cloudflare Web Analytics (Seitenaufrufe, keine Events). Jedes Ereignis geht
zusätzlich als DOM-Event `qb:track` raus (zum Prüfen im Browser). Props
enthalten nie personenbezogene Daten oder Freitext.

| Event | Auslöser | Props |
|---|---|---|
| `anfrage_gesendet` | Anfrageformular der Startseite, erst nach erfolgreicher Übertragung | `anliegen` (einzeln, regelmaessig, sonstiges), `objektklasse` (wohnung, einfamilienhaus, mehrfamilienhaus, besonders, unklar, keine), `rueckruf` (ja, nein) |
| `bestandskunde_anfrage_gesendet` | Konfigurator auf `/objekt-anfragen/`, erst nach erfolgreicher Übertragung | `objektklasse` (wohnung, einfamilienhaus, mehrfamilienhaus), `ergaenzungen` (z. B. `drohne,kurzvideo` oder `keine`) |
| `cta_klick` | Klick auf einen Anfrage-Button mit `data-cta` | `ort` (hero, navigation, preise, ablauf, zusammenarbeit) |
| `preiskachel_anfrage` | Klick auf „Für dieses Objekt anfragen“ in einer Preiskachel | `klasse` (wohnung, einfamilienhaus, mehrfamilienhaus) |
| `beispiel_geoeffnet` | Galerie eines Beispiel-Inserats geöffnet | `slug`, `quelle` (karte, preiskachel, deeplink) |
| `telefon_klick` | Klick auf einen `tel:`-Link | – |
| `email_klick` | Klick auf einen `mailto:`-Link | – |
