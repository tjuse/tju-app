# AGENTS.md — tju.app

> Working conventions for AI coding agents (and human collaborators). Read before making any changes.

## Project Overview

**tju.app** is a modern campus dashboard for Tianjin University. It consolidates five high-frequency campus systems into one polished, interactive interface: **public course library, personal schedule, academic calendar, grades, exams, and quick links**. Goal: world-class UI/UX on par with mainstream SaaS products.

Current phase: **self-use first, architecture designed for future multi-user open access.**

## Tech Stack

- **Framework:** Next.js 16 (App Router) · React 19 · TypeScript (strict)
- **Styling:** Tailwind CSS v4 (design-token driven; see `src/app/globals.css`)
- **Components:** shadcn-style custom components (`src/components/ui`, based on Radix UI) + `lucide-react`
- **Animations:** pure CSS keyframes (`animate-fade-in-up` in `globals.css`) via `src/components/motion/fade-in.tsx`
- **Themes:** `next-themes` (default: **dark**)
- **State:** Zustand (lightweight client state, e.g. favorites); `persist` middleware for localStorage
- **Charts:** Recharts (stats, trends)
- **Validation:** Zod (API inputs, forms, env vars)
- **Data source (public):** **[`tju`](https://github.com/tjuse/tju-python)** Python library (wraps SSO + EAMS). Bridged via `scripts/tju_cli.py`, called by `child_process.spawn` in `src/lib/tju/client.ts`. Used for public data crawl only (course catalog); personal data (schedule/grades/exams) goes via the browser extension.
- **Data source (private):** **`@tju-app/extension`** — MV3 browser extension that reuses the user's logged-in EAMS session. No credential storage; no CAS re-login needed.
- **`@tju-app/eams-parsers`** — workspace-local TS library: pure HTML parsers (schedule, exam, score, course, profile, classroom, syllabus). 39 parity tests vs tju-python fixtures.
- **Storage:** **No database.** File JSON cache (`data/cache/`, see `src/lib/cache/file-cache.ts`) for public data. Browser `sessionStorage` (via `src/lib/extension-bridge.ts`) for extension-fetched private data. Browser `localStorage` for favorites.
- **PWA:** Serwist (`src/app/sw.ts`)
- **AI:** `@anthropic-ai/sdk`, default model `claude-opus-4-8` (schedule screenshot recognition)
- **Quality:** Biome (lint + format) · Vitest (unit) · Playwright (e2e)
- **Package manager:** pnpm workspace (JS) · venv + pip (Python, `requirements.txt`)

> ⚠️ **Build uses webpack:** Next 16 defaults to Turbopack, but Serwist is incompatible. Both `dev` and `build` scripts pass `--webpack`.
>
> ⚠️ **Two-wall problem:** Vercel cannot fetch private TJU data — (1) no Python runtime and (2) no campus-network access. The browser extension solves both: it runs on the user's own machine with their existing EAMS session, bypassing both walls. Public data (course catalog) is still crawled offline and committed as static JSON.
>
> ⚠️ **Public data** goes through the Python path. **Private data** (schedule/grades/exams) goes through the browser extension. Do not mix the two paths.

## Directory Layout

```
pnpm-workspace.yaml      pnpm workspace root
packages/
  eams-parsers/          ★ @tju-app/eams-parsers — pure TS HTML parsers (no fetch, 39 tests)
    src/parsers/         schedule, exam, score, course, profile, classroom, syllabus
    src/consts.ts        EAMS URLs + SEMESTER map + weekday map
    src/types.ts         Typed parser output interfaces
    tests/               Parity tests vs tju-python fixtures (vitest)
  extension/             ★ @tju-app/extension — MV3 browser extension
    src/background/      Service worker: fetches EAMS via session cookies, parses with eams-parsers
    src/content/         Content script: window.postMessage ↔ chrome.runtime bridge
    src/popup/           Status popup + manual refresh trigger
    src/shared/          messages.ts (protocol) + flows.ts (EAMS step descriptors)
    manifest.json        MV3 manifest (host_permissions: *.tju.edu.cn)
    build.mjs            esbuild bundler → dist/
scripts/tju_cli.py       Python bridge: wraps tju, emits unified {ok,data} JSON (public data only)
requirements.txt         Python deps (tju)
data/cache/              File cache — public caches committed, personal ones git-ignored
src/
  app/                   Routes + Route Handlers (backend)
    (dashboard)/         Main dashboard layout + feature pages
    api/                 Backend endpoints (courses, schedule, score, exam, syllabus, calendar, links, import/ocr)
    globals.css          Design system tokens + CSS keyframes
    manifest.ts  sw.ts   PWA
  components/
    ui/                  Base UI components (button/card/badge/skeleton/dialog…)
    dashboard/           Layout components (sidebar/header/widgets/nav-config)
    motion/              Animation wrappers
  features/              Feature business logic
    courses/             Course browser, filter, stats, trends, conflicts, favorites
    schedule/            Timetable mapping, view, import
    calendar/            Academic calendar utils
    grades/              Grades view
    exams/               Exam view
  lib/
    tju/                 ★ Data access: client.ts (spawn) / types.ts / *-store.ts (fetch+cache)
    cache/               File JSON cache (file-cache.ts)
    extension-bridge.ts  ★ Client-side bridge to the browser extension (isExtensionAvailable, fetchSchedule, …)
    connectors/tju/      Card / electricity placeholders (not yet implemented)
    ai/                  Anthropic client + OCR schema
    runtime.ts           ★ Demo mode detection (isLiveFetchAvailable / isDemoMode)
    env.ts  utils.ts
  types/                 Shared TypeScript types
```

**Data flow — public (courses):** SSR page calls `readCachedCourses()` (reads file, no network) → client `CoursesBrowser` calls `GET /api/courses?...` for filter/paginate → user clicks refresh → `GET /api/courses?refresh=1` → guarded by `isLiveFetchAvailable()` → `refreshCourses()` → `client.ts` spawns `tju_cli.py` → writes cache → `router.refresh()`.

**Data flow — private (schedule/grades/exams via extension):** page client calls `isExtensionAvailable()` → if present, calls `fetchSchedule/fetchUGScore/fetchExam()` in `extension-bridge.ts` → `window.postMessage` → content script → `chrome.runtime.sendMessage` → background service worker fetches EAMS with existing cookies → parses with `eams-parsers` → returns typed data → page stores in `sessionStorage` and renders.

**Demo mode:** `src/lib/runtime.ts` exports `isDemoMode()`. When `process.env.VERCEL` is set (or `TJU_LIVE=0`), all spawn-based routes return 503 with a user-friendly message instead of attempting to spawn Python.

**Core principle:** new features follow the **feature module** pattern. UI must not depend directly on data-source details — only on types and functions exported by `lib/tju`, `lib/extension-bridge`, and `features/*`.

## Design System (must follow)

**Light, neutral, high-density console** (modeled on the Cloudflare dashboard) · **light-first** (neutral gray ground, white cards) · **Beiyang Blue is the sole accent** · **less is more**. Full design language: the skill **`.claude/skills/tju-ui-design/SKILL.md`** (read it before building UI); token/spec reference: `docs/DESIGN_SYSTEM.md`.

- **Less is more — no decorative micro-text (forbidden).** No redundant eyebrows, no bilingual EN/CN captions next to a CN heading (`校园卡 · Card`), no figure/coordinate tags (`FIG.01 · Today`), no ornamental index numbers (`01 02 03`). Show the heading + real data only.
- **No left-edge accent bars (forbidden).** Never highlight a block with a colored *left border / edge stripe* (`border-l-*`, `borderLeft`). Use a full low-opacity tint + subtle border, or a small inline color dot.
- **No native form controls for selection.** Use the custom `Select` (`src/components/ui/select.tsx`).
- **One accent.** Beiyang Blue only (`--color-accent`, light `#00468c` / dark brighter `#4f8fe0` — “深底亮版”), swappable as the future theme color. No second decorative hue.
- All colors via CSS variables (`var(--color-*)`). **Never hardcode hex** (chart palettes in `stats-charts.tsx` / `timetable.tsx` are the only exception).
- Surfaces: page = `--color-bg-base` (gray), cards = white `--color-bg-subtle` + `--shadow-card`. Spacing dense; gaps `gap-3`; radius `lg 9px`.
- Text: three levels `--color-text-high/mid/low`. Headings `.font-display font-semibold`; numbers `tabular-nums`.
- **Layout.** Slim global top bar (theme toggle only) lives in the dashboard layout; each page renders `<PageHeader>` (title + subtitle + actions) as its first content element. Centered `max-w-*` wrapper, tiers: dense data pages `max-w-7xl`; standard (home/grades/links) `max-w-6xl`; reading (calendar/exams) `max-w-5xl`; placeholders `max-w-4xl`.
- Reusable: `PageHeader`, `EmptyState`, `StatLedger` (metric tiles), grouped collapsible `Sidebar` (width + opacity animation only — no per-label `max-width`).
- States: every feature must have loading (`<Skeleton>`), empty (`EmptyState`), and error states. Entrance: `<FadeIn>` with `delay` stagger. Accessibility: WCAG AA, `:focus-visible`, keyboard reachable, `prefers-reduced-motion` degraded.

## Commands

```bash
pnpm dev          # development (webpack)
pnpm build        # production build (webpack)
pnpm typecheck    # tsc --noEmit (root app + all packages)
pnpm lint         # biome check (do NOT pass "." as argument)
pnpm lint:fix     # biome check --write
pnpm test         # vitest run (root app)
pnpm test:e2e     # playwright
pnpm py:setup     # create .venv and install tju (first run / new machine)
pnpm tju:courses  # CLI: fetch public course catalog (debug, requires campus net)

# Workspace package commands
pnpm --filter @tju-app/eams-parsers test      # 39 parity tests
pnpm --filter @tju-app/eams-parsers typecheck
pnpm --filter @tju-app/extension build        # bundle → packages/extension/dist/
pnpm --filter @tju-app/extension typecheck
```

> **Biome 2.x:** do NOT pass a `.` path argument (the dot is treated as ignored); relies on `.gitignore`, must be run inside the git repo.
>
> **Python:** `.venv` is created by `pnpm py:setup`. `scripts/tju_cli.py` always emits exactly one JSON line (`{ok,data}` or `{ok:false,error,code}`), exits 0 on success, exits 1 on failure.
>
> **Extension:** load `packages/extension/` as an unpacked extension in Chrome. Requires campus network / VPN in the browser to reach `http://classes.tju.edu.cn`. The extension never stores credentials — it reuses the browser's existing EAMS session cookies.

## Commit & Push Checklist (mandatory — do not skip steps)

Before every commit:
1. `pnpm typecheck` — must pass (root + all packages)
2. `pnpm lint` — must pass
3. `pnpm test && pnpm --filter @tju-app/eams-parsers test` — all tests green
4. `pnpm --filter @tju-app/extension build` — bundle must succeed
5. `git status` — verify no unintended files are staged (no node_modules, no dist/, no .env)
6. After commit: `git push` immediately and confirm CI passes before reporting done to user

**Never report "done" until CI is green.** A commit that fails CI is not done.

## Git Hygiene — Hard Rules

These mistakes have already been made once. Never repeat them:

- **`.gitignore` must cover all levels.** In a pnpm workspace, `/node_modules` only ignores the repo root. Use bare `node_modules` (no leading slash) so all nested packages are covered.
- **Never commit build artifacts.** `dist/`, `build/`, `.next/`, `*.js.map` generated by bundlers must be in `.gitignore`. When adding a new package, immediately add its output dir to `.gitignore`.
- **Never commit test/vite caches.** `.vite/`, `coverage/`, `playwright-report/` are artifacts — gitignore them.
- **Verify manifest permissions before committing.** Every `chrome.*` API call needs the matching permission declared in `manifest.json`. Check: `chrome.tabs.*` → `"tabs"`, `chrome.scripting.*` → `"scripting"`, `chrome.cookies.*` → `"cookies"`. Permissions not used must be removed.
- **Never reference files that don't exist.** Icon paths, asset imports, fixture paths — verify they exist before committing. Chrome will fail to load an extension that references missing icon files.
- **Every committed fixture needs a test.** If you add an HTML or JSON fixture to `tests/fixtures/`, there must be a corresponding `*.test.ts` that uses it. Orphan fixtures rot silently.
- **Check all packages when adding a new workspace member.** When creating `packages/X`, immediately: (1) add its output dir to root `.gitignore`, (2) run `git status` to confirm nothing unintended is tracked.

## Coding Conventions

- TypeScript **strict**; prefer **Server Components** and only add `"use client"` where interaction is needed.
- All API inputs validated with **Zod**; error responses must not leak internal details.
- UI display text in **Chinese** (this is a TJU campus app). Code comments, doc files, and commit messages in **English**.
- Every commit must pass: `pnpm typecheck && pnpm lint && pnpm test`.
- Reuse existing utilities (`cn`, `slotToTime`, `formatCNY` in `lib/utils`, components in `components/ui`). Don't reinvent.
- Server-only modules (file cache, spawn) go in `lib/tju`, `lib/cache`; add `import "server-only"` where needed.

## Phase Boundaries

| Phase | Status | Notes |
|---|---|---|
| Public course library | ✅ Done | `query_courses`, per-semester cache, filter/stats/trends/conflicts/favorites |
| Personal schedule (server) | ✅ Done | `schedule` CLI command, weekly timetable view (local only) |
| Calendar + quick links | ✅ Done | Static data |
| Grades + Exams (server) | ✅ Done | `score`/`exam` CLI commands; local only (demo mode on Vercel) |
| **eams-parsers library** | ✅ Done | `packages/eams-parsers` — TS port of all tju-python parsers, 39 tests |
| **Browser extension** | ✅ Done | `packages/extension` — MV3 extension + `extension-bridge.ts` client bridge |
| Schedule screenshot import | 🚧 Partial | Backend OCR done (`/api/import/ocr`), frontend upload UI pending |
| Extension → page wiring | 🚧 Partial | Bridge done; pages need to call `isExtensionAvailable()` and render extension data |
| Card / electricity | 📋 Planned | Not covered by tju or the extension; independent connectors needed |

Credentials are always resolved via `TJU_ENV_FILE` (local read-only .env). **Never write to `/data/workspace/tju-python` or any tju-python file.**

## Security Red Lines (mandatory)

- TJU credentials (`TJU_USER`/`TJU_PASS`) only in `.env.local` (gitignored). **Never** logged, cached to disk in readable form, or committed.
- Only fetch data **authorized by the user themselves**. Low frequency, cache-backed, respectful of school systems.
- Secrets only in `.env.local` (gitignored); repo only keeps `.env.example`.
- Before opening to multi-user access: add privacy notice, data minimization, user deletion, rate limiting, session isolation.

## AI Model

Default: `claude-opus-4-8` (strong vision capability for schedule recognition). Schedule screenshot import uses **vision + tool use** (structured JSON schema); see `src/lib/ai/index.ts`. Model ID is configurable via `ANTHROPIC_MODEL`.
