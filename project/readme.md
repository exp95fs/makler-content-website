# Makler-Content — Design System

> **„Erdig & Natürlich"** · Warm, wohnlich, bodenständig-gehoben.
> Premium real-estate media, branded so the craft sells the craft.

Makler-Content is an **immobilien photo & video production studio** for makers,
brokers, developers and real-estate companies across the DACH region (German-
speaking Europe). The proposition: *the brand is the proof of the craft —
visual skill sells visual skill.* This system sells **„Zuhause" (home)**, not
**„Investment".** It is warm, honest, inviting, grounded — premium without gloss.

This is the **„Erdig & Natürlich"** brand world — sage-green, stone-taupe, linen
and a muted terracotta accent, set in **Fraunces** (display serif) over **Mulish**
(body grotesque). It was chosen from a five-world brand catalogue (Set 03 of 5).

---

## Sources

These files were provided and inform this system. The reader may not have access;
they are recorded here in case they do.

| File | Role |
|---|---|
| `uploads/MAKLER~1.MD` | Brand brief for "Erdig & Natürlich" — colors, type, scale, spacing |
| `uploads/MAKLER~1.JSO` | Tokens Studio (Figma) token export — colors, typography, radius, spacing |
| `uploads/MAKLER~1.CSS` | Ready-made CSS custom properties + example base styles |
| `uploads/MAKLER~1.HTM` | The 5-world brand-selection catalogue (Set 03 = this world) |

There is **no app, codebase, or live Figma** — the brand is at the identity stage
(a logo + brandbook are the stated next step). The product surfaces are marketing
artifacts: website, business card, Instagram tiles. The UI kit here recreates the
**marketing website**, the brand's primary surface.

---

## Brand voice & content

**Language: German (DACH).** Copy is written in German with the formal-but-warm
**„Sie"** address — respectful, never stiff. The tone is grounded, sensory and
human; it talks about *atmosphere, light, material, arrival* — not square metres
and yield.

**Tone:** warm, honest, inviting, quietly confident. Craft-forward. It reassures
(*planbar, termintreu, konsistent*) while staying poetic about the feeling of a
home. Premium, but never showy or salesy.

**Casing:** German sentence-style capitalisation (nouns capitalised per German
rules). Headlines in **Fraunces** are set sentence-case, not all-caps. The only
uppercase is the **eyebrow / label** (Mulish 500, `letter-spacing: 0.18em`).

**Person:** *Wir* (we, the studio) addressing *Sie / Ihr Objekt* (you, the client).
Customer-centred — the home and the viewer's feeling are the subject.

**Emoji:** none in brand copy. (The source catalogue tool used a few emoji as UI
affordances, but they are **not** part of the brand voice.) Avoid emoji entirely.

**Punctuation:** German typographic quotes „…" and en-dashes for asides. Short,
sensory sentences; the occasional fragment for rhythm.

### Voice examples (from the brief)
- Eyebrow: **„Wohnen mit Charakter"**
- Headline: **„Wo Menschen ankommen — eingefangen in echtem Licht."**
- Subline: **„Foto & Film für Objekte, die sich nach Zuhause anfühlen."**
- Body: *„Eine Immobilie ist mehr als Quadratmeter. Es ist das Morgenlicht in der
  Küche, die Textur des Holzbodens, der Blick in den Garten."*
- Instagram tile: **„Licht. Linie. Verkauft."**

**Do:** lead with feeling, name materials and light, keep promises concrete.
**Don't:** talk in metrics/ROI, shout, use exclamation stacks, slip into English,
add emoji.

---

## Visual foundations

The whole system follows a **60-30-10** discipline:
**60 % Leinen** (linen `#F3EEE5`) ground · **30 % Salbei** (sage `#565E45`) for
headers, fill blocks and type accents · **10 % Terrakotta** (`#BC6B49`) for CTAs,
links and highlights. **Taupe** (`#C7BCA9`) is the calm in-between tone for cards.

### Colour
Earthy, desaturated, warm. Sage and terracotta are complementary (cool green vs.
warm clay) — the terracotta brings life but is *muted* so it reads elegant, never
loud. Backgrounds are warm off-whites (linen / surface), never pure white. Text is
**Erdschwarz** `#2A2A22` (warm near-black, 12.5:1 on linen), with `#5C5A4E` for
muted sublines. Status colours stay inside the earthy family (mossy green, ochre,
terracotta-deep, muted slate-teal) rather than primary RGB.

### Type
- **Fraunces** (soft old-style serif, opsz axis) — **headlines only.** Weights
  400/500/600; semibold 600 for display/H1/H2, regular 400 for H3. Slight negative
  tracking `-0.01em`. Carries the warm, handcrafted note.
- **Mulish** (friendly minimalist grotesque) — body, UI, buttons, nav, labels.
  Weights 300 (leads) / 400 (body) / 500 (labels, nav) / 700 (buttons, emphasis).
- Body line-height is generous (**1.65**) — copy breathes. Headlines tight (1.08).
- Scale: Display 56 · H1 40 · H2 30 · H3 22 · Lead 18 · Body 16 · Small 14 · Label 12.

### Spacing & layout
4 · 8 · 16 · 24 · 40 · 64 (· 96) px scale. Generous whitespace; content sits in a
`1140px` max container with `28px` gutters. Sections breathe (64–96px vertical
rhythm). Imagery is given room — the brand steps back so the home is the subject.

### Corners & borders
Radii: **sm 8 · md 13 · lg 18 · xl 24 · pill 100**. Cards round at lg (18px); media
frames at xl (24px); buttons at sm (8px); chips/pills fully round. Borders are
**hairlines** (`1px #E0D8CA`) — quiet edges, not heavy outlines. Ghost buttons use a
1.5px terracotta outline.

### Elevation / shadows
Soft, warm, low-contrast — shadows are tinted with the text colour at very low
alpha, never neutral grey/black. A card lifts with `--shadow-md`
(`0 14px 30px -18px rgba(42,42,34,.28)`); hero media with `--shadow-lg`. No hard
drop-shadows, no neon glows. Inner shadow is reserved for sunk tracks/inputs.

### Imagery
Real-estate photography is the hero: **warm, natural light**, honest interiors,
materials and texture (wood, stone, linen, plants), gentle contrast — *atmosphere
over spec.* Full-bleed or large rounded (xl) frames, often with a soft linen/sage
mat around them. A subtle dark scrim (`--color-overlay`) carries white type over
photos. No cold/blue grading, no heavy filters, no stock-y staging. Where real
photos aren't available, use a warm taupe placeholder block (never a grey box).

### Backgrounds & texture
Mostly flat warm fills (linen, surface, sage). No gradients-for-decoration, no
purple/tech gradients. Optional very subtle paper/linen grain is on-brand but
must stay barely-there. Sage is used as a full-bleed section ground for contrast
moments (footer, quote, stat band) with linen type on top.

### Motion
Gentle and unhurried — ease-out `cubic-bezier(0.22,0.61,0.36,1)`, 160–240 ms.
Fades and small rises (translateY 2–4px), never bounces or springs. Hover lifts a
card a few px with a softening shadow. Respect `prefers-reduced-motion`.

### Interaction states
- **Hover:** buttons darken to the *-deep* token (terracotta → `#A4583A`, sage →
  `#434A36`); cards lift `translateY(-3px)` + deeper shadow; links go terracotta.
- **Press:** color deepens; optional `scale(0.98)`. No big movement.
- **Focus:** 2px terracotta ring (`--focus-ring`) with a 2px offset — visible,
  on-brand, accessible.
- **Disabled:** 45 % opacity, no shadow, `cursor: not-allowed`.

### Transparency & blur
Used sparingly: a sticky header uses a translucent linen fill with `backdrop-filter:
blur(14px)`; photo scrims use the overlay token. No glassmorphism beyond that.

---

## Iconography

The source has **no icon set** of its own (brand is pre-identity). This system uses
**Lucide** (https://lucide.dev) — thin, rounded, consistent stroke icons whose
soft humanist line matches Mulish and the warm, friendly tone. **This is a
substitution — flagged for your confirmation** (see CAVEATS). Lucide is loaded
from CDN; see `assets/icons.md`.

Rules:
- Stroke icons only, ~1.75px stroke at 24px, `currentColor` so they inherit text
  colour. Default to `--text-muted`; terracotta only for active/accent icons.
- Line weight matches body text — icons never look heavier than the type.
- **No emoji** as icons. **No** filled/duotone icon styles. **No** hand-drawn SVGs.
- Sizes: 16 (inline), 20 (buttons/nav), 24 (feature), 32+ (decorative feature).

If a real icon set is adopted later, swap the CDN link in `assets/icons.md` and
keep the usage rules.

---

## File index

```
styles.css            ← global entry (consumers link this). @import list only.
tokens/
  fonts.css           Fraunces + Mulish + IBM Plex Mono (Google Fonts)
  colors.css          base palette · derived tints · semantic aliases · status
  typography.css      families · weights · sizes · line-heights · tracking
  spacing.css         spacing · radius · borders · shadows · motion · layout
components/core/       reusable primitives (see below)
ui_kits/website/       Makler-Content marketing site recreation
guidelines/            foundation specimen cards (Design System tab)
assets/                logo usage, icon notes
readme.md              this file
SKILL.md               portable Agent-Skill manifest
```

### Components (`components/core/`)
`Button`, `Eyebrow`, `Card`, `Badge`, `Tag`, `Input`, `Textarea`, `Logo`,
`StatBlock`, `MediaFrame`, `Avatar`, `Divider`. Each: `<Name>.jsx` +
`<Name>.d.ts` + `<Name>.prompt.md`, with one `@dsCard` card per directory.
Use via `const { Button } = window.MaklerContentDesignSystem_a211b6`.

### UI kit (`ui_kits/website/`)
A click-through recreation of the marketing website — header/nav, hero, service
grid, portfolio, process, testimonial, contact CTA, footer.

---

## CAVEATS
- **Icons are a substitution.** No icon set existed in the brief; **Lucide** was
  chosen to match the stroke/warmth. Confirm or supply your preferred set.
- **No logo existed** (identity is the stated next step). The `Logo` component is a
  minimal wordmark + "M" mark built from brand tokens (sage tile, Fraunces M) as a
  working placeholder — **not a final logo.** Replace when the real mark lands.
- **No product photography** was provided. UI-kit imagery uses warm placeholder
  blocks; drop in real warm-light interior photos to finish.
- **Fonts via Google Fonts** (Fraunces, Mulish) per the brief — no local font
  files. If you need self-hosted/offline fonts, supply the files.
