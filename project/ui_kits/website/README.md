# UI Kit — Makler-Content Marketing Website

A click-through recreation of the Makler-Content marketing site, built entirely
from the design-system primitives (`window.MaklerContentDesignSystem_a211b6`).

## Run
Open `index.html`. It loads React + Babel + Lucide + the compiled `_ds_bundle.js`,
then mounts the page from the section files below.

## Sections
| File | What |
|---|---|
| `ui.jsx` | Shared `Icon` (Lucide) + `SectionHead` helpers |
| `Header.jsx` | Sticky translucent nav, logo, links, CTA, mobile menu |
| `Hero.jsx` | Eyebrow, display headline, CTAs, hero MediaFrame, stat band |
| `Services.jsx` | Leistungen — icon cards (Card + Lucide) |
| `Portfolio.jsx` | Referenzen — Tag-filterable MediaFrame grid |
| `Process.jsx` | Ablauf steps + sage testimonial band (StatBlock onDark) |
| `Contact.jsx` | Enquiry form (Input/Textarea/Button) with success state |
| `Footer.jsx` | Sage footer, logo, link columns |

## Interactions
- Nav links + CTAs smooth-scroll to sections; mobile burger toggles the menu.
- Portfolio tags filter the grid live.
- Contact form submits to an inline "Danke" success state ("Weitere Anfrage" resets).

## Notes
- **Imagery is placeholder.** `MediaFrame` renders warm taupe blocks; pass real
  `src` photos (warm natural light interiors) to finish.
- Icons are **Lucide** (CDN) — a flagged substitution; see `../../assets/icons.md`.
- This recreates the brand's primary surface (the website). No app/product exists.
