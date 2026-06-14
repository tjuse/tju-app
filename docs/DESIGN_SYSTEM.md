# Design System — tju.app

**Style**: minimal modern (Linear / Vercel aesthetic) · dark-first · generous whitespace · restrained micro-animations · Beiyang Blue accent.

All tokens are defined in the `@theme` block of `src/app/globals.css` and used via `var(--*)`. **Never hardcode color hex values** (data palettes for charts are the only exception).

## Color

### Background layers (dark mode)
| Token | Value | Usage |
|---|---|---|
| `--color-bg-base` | `#0a0a0b` | Deepest page background |
| `--color-bg-subtle` | `#111113` | Card background |
| `--color-bg-muted` | `#18181b` | Hover state, secondary layer |
| `--color-bg-overlay` | `#1f1f24` | Modals, dropdowns |

### Text (three contrast levels)
| Token | Usage |
|---|---|
| `--color-text-high` | Primary content, headings, body |
| `--color-text-mid` | Secondary descriptions |
| `--color-text-low` | Placeholder / disabled / timestamps |

### Borders
`--color-border` (default low-contrast) · `--color-border-strong` (hover / emphasis)

### Accent (Beiyang Blue)
| Token | Dark value | Usage |
|---|---|---|
| `--color-accent` | `#3b82f6` | Primary actions, active state, icon highlight |
| `--color-accent-hover` | `#60a5fa` | Hover |
| `--color-accent-muted` | `#1d3a6e` | Low-saturation background |
| `--color-accent-subtle` | `#172554` | Very faint background (badges, current column) |

> Light mode redefines the same variable names under the `.light` class (accent uses deeper `#1d4ed8` for sufficient contrast).

### Status colors
`--color-success` · `--color-warning` · `--color-danger` · `--color-info`

## Spacing & Radius

- Spacing: **8px base grid** (matches Tailwind's default scale).
- Radius: `--radius-sm 6` · `md 10` · **`lg 16` (primary cards)** · `xl 24` · `full`.

## Typography

- Sans-serif: Geist → Inter → system → PingFang / Source Han Sans (Chinese fallback).
- Type scale (Tailwind): heading `text-2xl/lg font-semibold tracking-tight`, body `text-sm`, caption `text-[13px]`, micro `text-[12px]/[11px]`.
- Numbers use `tabular-nums` (time, amounts, counts — for alignment).

## Components

- Base components in `src/components/ui`: `Button` (6 variants), `Card`, `Badge`, `Skeleton`.
- Cards use `.card` + `.card-glow` (encapsulated in the `Card` component).
- Utility classes: `.gradient-text` (Beiyang Blue gradient heading), `.skeleton` (loading animation), `.text-pretty/.text-balance`.

## Animation

- Entrance: `<FadeIn delay={...}>` — opacity + translateY(8px), 220ms ease-out.
- Lists: stagger with the `delay` prop on each `<FadeIn>`.
- Micro-interactions: buttons `active:scale-[0.98]`; card hover lifts border brightness slightly.
- Principle: **restrained, fluid, no showboating**. Respects `prefers-reduced-motion` (globally degraded in `globals.css`).

## State Design (mandatory)

Every data view must cover:
1. **Loading**: `<Skeleton>` with a shape that matches the real content.
2. **Empty state**: friendly copy + a guiding action (e.g. "Add a course →").
3. **Error state**: readable Chinese message + retry entry point.

## Accessibility

- Contrast ≥ WCAG AA.
- `:focus-visible` globally has a 2px Beiyang Blue outline.
- Touch targets ≥ 44px (mobile).
- Icon-only buttons must have `aria-label`.

## Responsive

Mobile: single-column stack with bottom tab bar → `md` breakpoint: sidebar + multi-column Bento grid. Breakpoints use Tailwind defaults (`sm/md/lg`).
