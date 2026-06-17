---
name: makler-content-design
description: Use this skill to generate well-branded interfaces and assets for Makler-Content (premium real-estate photo & video studio, DACH region) — for production or throwaway prototypes/mocks. Contains the "Erdig & Natürlich" brand: colors, type, fonts, assets, components, and a full website UI kit.
user-invocable: true
---

Read `readme.md` within this skill first — it carries the brand context, content
voice, visual foundations, and iconography rules. Then explore the other files.

## What's here
- `styles.css` — global entry; link this. `@import`s everything below.
- `tokens/` — colors, typography, fonts (Fraunces + Mulish via Google Fonts), spacing/radius/shadow/motion.
- `components/` — React primitives: Button, Eyebrow, Card, Badge, Tag, Divider, StatBlock, MediaFrame, Input, Textarea, Logo. Each has a `.d.ts` + `.prompt.md`.
- `ui_kits/website/` — full Makler-Content marketing-site recreation.
- `guidelines/` — foundation specimen cards.
- `assets/icons.md` — iconography (Lucide, flagged substitution).

## How to use
If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets
out and produce static HTML for the user to view. Link `styles.css` for tokens;
mount components from `window.MaklerContentDesignSystem_<hash>` after loading
`_ds_bundle.js` (see any `*.card.html` for the exact pattern). For production
code, copy assets and follow the rules here to design natively in-brand.

## Brand in one breath
„Erdig & Natürlich" — warm, wohnlich, bodenständig-gehoben. Sells **Zuhause**, not
Investment. Sage `#565E45` · taupe `#C7BCA9` · linen `#F3EEE5` · terracotta accent
`#BC6B49`. Fraunces (headlines, sentence-case) over Mulish (everything else).
German formal-warm „Sie". No emoji. 60-30-10: linen ground, sage structure,
terracotta the 10% spark.

If invoked without guidance, ask what the user wants to build, ask a few focused
questions, then act as an expert designer who outputs HTML artifacts or production
code as needed.
