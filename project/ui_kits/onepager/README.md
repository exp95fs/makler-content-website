# One-Pager — Makler-Content (Akquise-Landingpage)

A complete one-page acquisition site for the Makler-Content business, adapted
from the supplied `Makler-Content_OnePager_V2.html` structure and fully re-skinned
to the „Erdig & Natürlich" design system (linen / sage / terracotta, Fraunces /
Mulish). Built from the DS primitives (`window.MaklerContentDesignSystem_a211b6`).

## Run
Open `index.html` — loads React + ReactDOM (production UMD) + Lucide from CDN,
the shared design-system bundle (`../../_ds_bundle.js`), and this kit's own
precompiled `onepager.bundle.js`, then mounts the sections below. There is no
in-browser JSX transpilation (no Babel CDN script) — the JSX sources are
compiled ahead of time, see "Build" below.

## Sections (in order)
| File | Sections |
|---|---|
| `ui.jsx` | `Icon`, `Container`, `Section`, `SectionHead` helpers |
| `NavHero.jsx` | Nav (logo + CTA), Hero, Stat bar |
| `Value.jsx` | Benefits (6 reasons), Segments (Verkauf / Vermietung) |
| `Branding.jsx` | **Personal Branding / Markenbildung** (NEW, sage band), USP |
| `Flow.jsx` | Process (4 steps), Portfolio, Pilot offer, About (Fabian) |
| `FaqContact.jsx` | FAQ accordion, Contact form, Footer |

## Build
`onepager.bundle.js` is generated from the six `.jsx` files above (concatenated
in the table order, plus the `App`/mount glue) via `@babel/preset-react`
(classic runtime, JSX → `React.createElement`). Whenever a `.jsx` file in this
directory changes, recompile:

```sh
npx babel ui.jsx NavHero.jsx Value.jsx Branding.jsx Flow.jsx FaqContact.jsx \
  --presets=@babel/preset-react --no-babelrc -o /tmp/x.js   # then append the
  # App()/mount glue from index.html's old inline script and concatenate —
  # see git history of this commit for the exact build script used.
```
The shared design-system primitives (`Logo`, `Button`, `Card`, `MediaFrame`,
`Eyebrow`, etc.) are not part of this bundle — they ship in the project-root
`_ds_bundle.js`, already plain JS, and are loaded separately.

## Key adaptations & decisions
- **CTA is portfolio-building**, as requested — the free "Gratis-Pilot" (3 places)
  is the central conversion, honest about being a new brand without references yet.
- **Personal Branding expanded** into its own dedicated sage section
  (`Branding.jsx`), addressing both Maklerbüros and independent brokers, flagged as
  an "Ausbaustufe". It also remains as USP #3 for continuity.
- **Logo & brand name are deliberate placeholders.** The nav/footer use the DS
  `Logo` component (renders „Makler·Content"); `// PLATZHALTER` comments mark every
  swap point. Owner name shows as „Fabian [Nachname]"; e-mail/phone/Impressum/
  Datenschutz and all images are placeholders.
- Stats kept verbatim with the original source disclaimer.

## Interactions
- Nav + all CTAs smooth-scroll to the enquiry form (`#anfrage`).
- FAQ is a single-open accordion.
- Contact form submits to an inline success state ("Weitere Anfrage" resets).

## To finish
Swap: final logo + brand name · owner surname · contact details · real warm-light
property photos (hero, segments, portfolio, portrait) · Datenschutz/Impressum ·
wire the form to a real endpoint.
