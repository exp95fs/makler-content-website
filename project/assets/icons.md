# Iconography — Makler-Content

**Set:** [Lucide](https://lucide.dev) — *substitution* (no icon set in brief).
Thin, rounded, consistent-stroke icons; the soft humanist line matches Mulish
and the warm tone of the brand.

## Load from CDN
```html
<script src="https://unpkg.com/lucide@latest"></script>
<script>lucide.createIcons();</script>
```
Or per-icon SVG via `https://unpkg.com/lucide-static/icons/<name>.svg`.

## Usage rules
- Stroke only, ~1.75px at 24px. `stroke: currentColor` — inherits text colour.
- Default colour `--text-muted`; terracotta (`--color-accent`) only when active/accent.
- Icon weight must match body text — never heavier than the type beside it.
- Sizes: 16 inline · 20 buttons/nav · 24 feature · 32+ decorative.
- No emoji. No filled/duotone variants. No hand-drawn SVG.

## Common icons in this brand
camera · video · home · sun · map-pin · phone · mail · arrow-right · arrow-up-right
· check · play · image · calendar · star · menu · x

If a real set is adopted later, swap the CDN link and keep these rules.
