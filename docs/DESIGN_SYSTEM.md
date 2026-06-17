# Design System — tju.app

**Style**: a light, neutral, **high-density console** modeled on the Cloudflare
dashboard. The full, authoritative design language lives in the project skill
**`.claude/skills/tju-ui-design/SKILL.md`** — read it before building UI. This
file is the quick token/spec reference.

## Hard rules (never break)

- **Less is more — no decorative micro-text** (no eyebrows, EN/CN captions,
  `FIG.0x` tags, ornamental index numbers).
- **No left-edge accent bars** — use a full tint + border, or a small dot.
- **No native `<select>`** — use the custom `Select`.
- **One accent = Beiyang Blue** (`--color-accent`), swappable as the theme color;
  dark mode uses a brighter sibling (“深底亮版”).
- **All color via tokens**; never hardcode hex (chart palettes excepted).

## Color (tokens in `globals.css`)

Light is the default; `.dark` overrides. Neutral grayscale surfaces, white cards.

| Token | Light | Dark |
|---|---|---|
| `--color-bg-base` (page) | `#f6f6f7` | `#0c0d10` |
| `--color-bg-subtle` (card) | `#ffffff` | `#151619` |
| `--color-bg-muted` (hover) | `#eeeef0` | `#1e2025` |
| `--color-bg-overlay` | `#ffffff` | `#22252c` |
| `--color-border` | `#e5e5e8` | `#292c33` |
| `--color-text-high/mid/low` | `#1b1b1f / #64646e / #9a9aa3` | `#ececee / #9a9ca4 / #5f626b` |
| `--color-accent` (Beiyang Blue) | `#00468c` | `#4f8fe0` |
| `--shadow-card` | faint | subtle |

Status: `--color-success / warning / danger`.

## Type

- One neutral grotesk (`--font-display` = same family, heavier) + `--font-mono`
  for figures/times/IDs. `tabular-nums` everywhere numbers appear.
- Scale: page title `text-xl font-semibold` · card/section title `text-[15px]
  font-semibold` · body `text-[13px]` · secondary `text-[12px]` · micro `[11px]`.

## Spacing & shape

Dense. Card padding 16–20px · grid gaps `gap-3` · list rows `py-2`–`2.5` with
`rule-hair` dividers. Radius `sm 5 / md 7 / lg 9 / xl 12`.

## Key components

`PageHeader` (in-content title + subtitle + actions) · slim global top bar (theme
toggle only) · grouped collapsible `Sidebar` with quick-search · metric tiles
(`StatLedger`) · panel cards with header + `rule-hair` + rows · `EmptyState` ·
`Card` · `Button` · `Badge` (subtle chip) · `Select` · data tables (small gray
headers, hairline rows). Collection cards for course grids.

## States (mandatory)

Loading (`<Skeleton>`) · empty (`EmptyState`) · error (Chinese message + retry).

## Accessibility

WCAG AA · `:focus-visible` blue outline · ≥44px touch targets · `aria-label` on
icon-only buttons · `prefers-reduced-motion` degraded.
