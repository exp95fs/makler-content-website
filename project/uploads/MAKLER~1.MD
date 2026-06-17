# Makler-Content — Design-System „Erdig & Natürlich"

Premium-Immobilien-CI: warm, wohnlich, bodenständig-gehoben. Verkauft „Zuhause", nicht „Investment". Zum Einfügen in Claude Design oder als Referenz.

## Farben

| Rolle | Token | Hex | Einsatz |
|---|---|---|---|
| Primär | `primary` | `#565E45` | Header, Flächen, Typo-Akzente (tiefes Salbei/Olive) |
| Primär (Hover) | `primaryDeep` | `#434A36` | Pressed/Hover-Zustand |
| Sekundär | `secondary` | `#C7BCA9` | Karten, ruhige Zwischenflächen (Stein/Taupe) |
| Hintergrund | `background` | `#F3EEE5` | Haupt-Hintergrund (Leinen) |
| Surface | `surface` | `#FBF8F1` | Karten-/Panel-Hintergrund |
| Text | `text` | `#2A2A22` | Haupttext (Erdschwarz, Kontrast 12.5:1) |
| Text gedämpft | `textMuted` | `#5C5A4E` | Sublines, Captions |
| Akzent | `accent` | `#BC6B49` | CTA, Buttons, Links, Highlights (Terrakotta) |
| Akzent (Hover) | `accentDeep` | `#A4583A` | Pressed/Hover |
| Rahmen | `border` | `#E0D8CA` | Trennlinien, Karten-Ränder |
| Auf Primär | `onPrimary` | `#F3EEE5` | Text auf Primärflächen |
| Auf Akzent | `onAccent` | `#FBF8F1` | Text auf Buttons |

**60-30-10-Regel:** 60 % Leinen-Hintergrund · 30 % Salbei (Header/Flächen/Typo) · 10 % Terrakotta (CTA/Highlights). Taupe als ruhiger Zwischenton für Karten. Der Akzent ist Terrakotta — warme Gegenfarbe zum kühlen Grün, bringt Lebendigkeit, bleibt durch die Dämpfung elegant.

## Typografie

Beide Schriften via Google Fonts.

- **Headline / Display:** `Fraunces` (Weights 400, 500, 600) — moderne old-style-Serife mit weichen, organischen Formen; trägt die warme, handwerkliche Note. Nur für Headlines.
- **Fließtext / UI:** `Mulish` (Weights 300, 400, 500, 700) — minimalistische, freundliche Grotesk; zugänglich und ruhig. Für Text, Buttons, Navigation, Labels.

### Type-Scale

| Stil | Font | Weight | Größe | Line-Height |
|---|---|---|---|---|
| Display | Fraunces | 600 | 56px | 1.08 |
| H1 | Fraunces | 600 | 40px | 1.08 |
| H2 | Fraunces | 600 | 30px | 1.3 |
| H3 | Fraunces | 400 | 22px | 1.3 |
| Lead / Subline | Mulish | 300 | 18px | 1.65 |
| Body | Mulish | 400 | 16px | 1.65 |
| Small | Mulish | 400 | 14px | 1.65 |
| Label / Eyebrow | Mulish | 500 | 12px | uppercase, letter-spacing 0.18em |

## Form & Abstände

- **Radius:** sm 8px · md 13px · lg 18px · pill 100px
- **Spacing:** 4 · 8 · 16 · 24 · 40 · 64 px

## So nutzt du die Dateien

- **`makler-content-design-tokens.json`** — Import in Figma über das kostenlose Plugin *Tokens Studio for Figma* (Plugin öffnen → Menü → „Load from file/JSON"). Erzeugt Farb-, Typo- und Spacing-Styles automatisch.
- **`makler-content-tokens.css`** — Fertige CSS-Variablen inkl. Google-Fonts-Import; direkt in Web-Projekte einbindbar.
- **Diese Datei (`.md`)** — In Claude Design einfügen oder als verbindliche Referenz fürs Logo & Brandbook (nächster Schritt).
