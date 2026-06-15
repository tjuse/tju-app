# Architecture — tju.app

## Overview

pnpm workspace with one Next.js app at the root and two support packages.

```
Browser (responsive Web + PWA)
   │
   ├─ Extension (MV3)          ← campus network / user session
   │     packages/extension/
   │     │  background.js      fetch EAMS using existing cookies → eams-parsers
   │     │  content.js         postMessage bridge (page ↔ background)
   │     └─ packages/eams-parsers/   pure TS HTML parsers, no fetch
   │
   ▼
Next.js app (frontend + Route Handlers)
   ├── features/*     business logic
   ├── lib/tju        Python bridge data layer (public data only)
   │      child_process.spawn
   │      ▼
   │   scripts/tju_cli.py ──→ tju library ──→ EAMS (campus net / VPN, public data)
   ├── lib/extension-bridge.ts   client bridge → extension
   └── lib/cache      file JSON cache (data/cache/*.json)
```

## Two-wall Problem (and the Solution)

Vercel (or any cloud host) cannot fetch private TJU data because of **two independent walls**:

1. **No Python runtime** — tju-python requires a Python interpreter
2. **No campus network** — EAMS (`http://classes.tju.edu.cn`) requires campus net or VPN

A pure TS rewrite fixes wall #1 but not wall #2. The browser extension fixes both: it runs
on the user's own machine, already on campus network/VPN, and reuses the existing logged-in
EAMS session — so no CAS login, no CAPTCHA, no credential storage required.

**Public data** (course catalog) has no login requirement; it is crawled once offline via
the Python path and committed as static JSON — both walls are irrelevant.

## Package Layout

```
packages/
  eams-parsers/         @tju-app/eams-parsers
    src/parsers/        schedule, exam, score (UG/GS/exp), course, profile, classroom, syllabus
    src/consts.ts       EAMS URLs, SEMESTER map, weekday map, PROJECT_ID
    src/types.ts        Typed output interfaces (ScheduleEntry, ExamEntry, UGScoreRecord, …)
    tests/              39 parity tests vs tju-python HTML fixtures (vitest)

  extension/            @tju-app/extension  (MV3)
    manifest.json       host_permissions: *://*.tju.edu.cn/* + https://sso.tju.edu.cn/*
    src/background/     Service worker: implements EAMS flows, detects session expiry
    src/content/        Content script: relays window.postMessage ↔ chrome.runtime
    src/popup/          Status popup + manual refresh button
    src/shared/
      messages.ts       Request / response protocol types
      flows.ts          Pure EAMS step descriptors (no fetch; caller provides HTTP)
    build.mjs           esbuild → dist/{background,content,popup}.js
```

## Vercel Demo Mode

`src/lib/runtime.ts` exports `isLiveFetchAvailable()` and `isDemoMode()`. When
`process.env.VERCEL` is set (or `TJU_LIVE=0`), all spawn-based API routes return HTTP 503
with a user-friendly message. Public cache files (`courses-*.json`, `syllabus-*.json`) are
committed and bundled via `outputFileTracingIncludes` in `next.config.ts`.

The extension path is entirely browser-side — Vercel demo mode does not affect it.

## Key Modules

| Module | Responsibility |
|---|---|
| `packages/eams-parsers` | Pure HTML parsers; the single source of truth for EAMS page parsing |
| `packages/extension/src/background` | Fetches EAMS with session cookies; calls eams-parsers; relays to content script |
| `src/lib/extension-bridge.ts` | Client-side: `isExtensionAvailable()`, `fetchSchedule/fetchUGScore/fetchExam()`, sessionStorage cache helpers |
| `scripts/tju_cli.py` | Reads `TJU_USER/TJU_PASS`, logs in via tju library, queries by sub-command, outputs `{ok,data}` JSON |
| `src/lib/tju/client.ts` | Spawns Python, timeout control, parses JSON, throws `TjuError` |
| `src/lib/tju/types.ts` | TypeScript mirror types for tju dump output + `TjuError` |
| `src/lib/tju/*-store.ts` | Per-feature read/refresh helpers (server-only) |
| `src/lib/cache/file-cache.ts` | `readCache/writeCache/readCacheWithMeta`, optional TTL, directory-traversal guard |
| `src/features/schedule/mapping.ts` | Maps tju Course (multi-segment arrange) → flat `Course[]` |
| `src/lib/runtime.ts` | `isLiveFetchAvailable()` / `isDemoMode()` — demo mode detection |

## Schedule Data Flow (server path, local only)

1. **SSR**: `schedule/page.tsx` calls `readCachedSchedule()` — reads file cache, **no network**.
2. Cache hit → `ScheduleView`; cache miss → empty state.
3. User clicks "Refresh from EAMS" → `useRefreshSchedule` → `GET /api/schedule?refresh=1`.
4. Route calls `refreshSchedule()` → `client.ts` spawns `tju_cli.py schedule` → `mapTjuSchedule` → `writeCache`.
5. Success → `router.refresh()` re-runs SSR.

## Schedule Data Flow (extension path)

1. Page client calls `isExtensionAvailable()` (1 s ping).
2. If present → `fetchSchedule(semesterId)` in `extension-bridge.ts`.
3. `window.postMessage` → content script → `chrome.runtime.sendMessage` → background.
4. Background runs `scheduleSteps()` (GET index → extract ids → POST table), parses with `parseSchedule()`.
5. Returns `ScheduleEntry[]` → bridge stores in `sessionStorage` → page renders.

## Credentials & Security

- `TJU_USER/TJU_PASS` only in `.env.local` (gitignored). **Never** logged or committed.
- Extension **never stores credentials** — it reads EAMS using the browser's existing session cookies only.
- Cache files store course/grade/exam data — no credentials.
- Extension-fetched private data lives in `sessionStorage` (tab-scoped, cleared on close) — never sent to the server.

## PWA

Serwist (`app/sw.ts`) precaches + runtime caching; `manifest.ts` for installable metadata. Service worker is disabled in development.

## Known Constraints

- **Webpack build** (`--webpack`): Serwist is not yet compatible with Turbopack.
- **Python environment**: requires `pnpm py:setup`; only used for public-data crawl.
- **Extension distribution**: MV3 requires Chrome/Edge store review or load-unpacked; desktop-only (mobile browsers don't support extensions).
- **GPL-3.0**: `tju` is GPL-3.0. Called via separate process (spawn) — aggregation only.
