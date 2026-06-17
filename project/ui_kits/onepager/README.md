# One-Pager — Makler-Content (Akquise-Landingpage)

A complete one-page acquisition site for the Makler-Content business, adapted
from the supplied `Makler-Content_OnePager_V2.html` structure and fully re-skinned
to the „Erdig & Natürlich" design system (linen / sage / terracotta, Fraunces /
Mulish). Built from the DS primitives (`window.MaklerContentDesignSystem_a211b6`).

## Run
Open `index.html` — loads React + Babel + Lucide + `_ds_bundle.js`, then mounts
the sections below.

## Sections (in order)
| File | Sections |
|---|---|
| `ui.jsx` | `Icon`, `Container`, `Section`, `SectionHead` helpers |
| `NavHero.jsx` | Nav (logo + CTA), Hero, Stat bar |
| `Value.jsx` | Benefits (6 reasons), Segments (Verkauf / Vermietung) |
| `Branding.jsx` | **Personal Branding / Markenbildung** (NEW, sage band), USP |
| `Flow.jsx` | Process (4 steps), Portfolio, Pilot offer, About (Fabian) |
| `FaqContact.jsx` | FAQ accordion, Contact form, Footer |

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
