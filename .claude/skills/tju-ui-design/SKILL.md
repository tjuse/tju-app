---
name: tju-ui-design
description: The tju.app UI/UX design language — a light, neutral, high-density console aesthetic modeled on the Cloudflare dashboard. Use when building or restyling any page, component, or layout in this project so everything stays visually consistent.
---

# tju.app Design Language — “Console” (Cloudflare-style)

A calm, professional, **information-dense control panel**. Light-first, neutral
grayscale surfaces, restrained color (blue only for primary actions / links),
hairline borders, small radii, subtle shadows. Everything is compact and legible.
Reference: the Cloudflare dashboard (Account home, Models, R2, Audit logs…).

## Hard rules (never break)

- **Less is more — no decorative micro-text.** No redundant eyebrows, no
  bilingual EN/CN captions next to a CN heading, no `FIG.01` tags, no ornamental
  index numbers. Show the heading + real data only.
- **No left-edge accent bars.** Convey category color with a full low-opacity
  tint + border, or a small inline dot — never a `border-l` stripe.
- **No native `<select>`.** Use the custom `Select`.
- **One accent = Beiyang Blue** (`--color-accent`). No second decorative hue.
  Light `#00468c`; dark uses a brighter sibling for contrast (“深底亮版”).
- **All color via tokens** (`var(--color-*)`); never hardcode hex (chart palettes
  in `stats-charts.tsx` / `timetable.tsx` excepted).

## Color & surfaces (tokens in `globals.css`)

- Page background = neutral gray (`--color-bg-base`), **cards = white**
  (`--color-bg-subtle`) with a 1px `--color-border` and a faint `--shadow-card`.
- Text three levels: `--color-text-high / mid / low`. Most secondary text is gray.
- Accent blue only for: primary buttons, links, active nav, selected state, key
  figures. Status: success / warning / danger.
- Dark mode = neutral dark gray (not navy), same structure, brighter accent.

## Type

- One neutral grotesk for UI + headings (`--font-display` = same family heavier),
  `--font-mono` for figures / times / IDs. `tabular-nums` for all numbers.
- Scale: page title `text-xl font-semibold`; card/section title `text-[15px]
  font-semibold`; body `text-[13px]`; secondary `text-[12px]`; micro `text-[11px]`.

## Spacing & shape

- Dense. Card padding 16–20px; grid gaps 12px (`gap-3`); list rows ~py-2–2.5 with
  hairline dividers; table rows ~36–40px. Radius: `sm 5 / md 7 / lg 9 / xl 12`.

## Component patterns (build these, reuse them)

1. **PageHeader** (`components/dashboard/page-header.tsx`): in-content, aligned
   with the content column. `title` (xl semibold) + optional `subtitle` (gray) on
   the left; optional `actions` on the right (secondary text links + a primary
   blue button). The global slim top bar only holds the theme toggle.
2. **Metric tile**: bordered white card — small gray label, big figure + unit
   below. Lay several in a `grid gap-3`. (`widgets/stat-ledger.tsx`)
3. **Panel card**: bordered card with an optional header row (title + a `全部`
   link or action) and a `rule-hair` divider, then dense rows.
4. **List rows**: `flex items-center justify-between` per row, hairline between,
   hover `bg-[--color-bg-muted]`; left = label/icon, right = value/meta (mono).
5. **Data table**: small gray column headers (sortable arrow if relevant), hairline
   row dividers, hover highlight, mono for IDs/times. Flat or inside a panel with a
   search header.
6. **Collection cards** (e.g. courses): grid of bordered cards — header (name +
   small tag/badge), compact meta lines, badge chips, footer link/actions.
7. **EmptyState** (`components/dashboard/empty-state.tsx`): centered icon in a
   subtle rounded square, bold title, gray description, optional primary action —
   placed inside a Card/panel.
8. **Badge / chip**: small, rounded, subtle gray fill (or tinted for status).
9. **Buttons**: primary = solid Beiyang-blue, compact, leading icon optional;
   secondary = outline/ghost; links = blue text. Sizes sm/default.
10. **Right rail** (detail/usage pages): a column of metric tiles + a key-value
    detail card (with copy buttons) beside the main panel.
11. **Tabs**: underline tabs for sub-views; segmented control for option switches.

## States (mandatory per data view)

Loading (`<Skeleton>` shaped like content) · empty (`EmptyState`) · error
(readable Chinese message + retry).

## Verify

`pnpm typecheck && pnpm lint && pnpm build`; spot-check light + dark; both must
look like the Cloudflare reference (dense, neutral, hairline, blue-only accent).
