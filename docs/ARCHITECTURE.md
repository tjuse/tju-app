# Architecture — tju.app

## Overview

Single-repo Next.js (App Router) application + one thin Python bridge script. **No database, no Docker, self-hosted** — intentionally minimal.

```
Browser (responsive Web + PWA)
   │
   ▼
Next.js (frontend + Route Handlers backend)
   │
   ├── features/*  business logic (calendar / links — static/built-in data)
   ├── lib/ai      schedule screenshot → Claude Vision parsing
   ├── lib/cache   file JSON cache (data/cache/*.json)
   └── lib/tju     TJU data access layer
          │  child_process.spawn
          ▼
       scripts/tju_cli.py  ──→  tju library  ──→  SSO + EAMS (requires campus network/VPN)
```

## Why this design

User requirement: **reuse the `tju` library (don't reinvent the wheel), no heavyweight database, no Docker, keep it minimal**. Therefore:

- **Schedule/grades/exams** (login-required data): all delegated to the mature `tju` Python library (wraps CAS login, CAPTCHA, HTML parsing). We only write a **thin bridge** `scripts/tju_cli.py`.
- **Integration pattern**: Next.js Route Handlers use `child_process.spawn` to call the Python script on demand and read its stdout JSON. No persistent Python service, no Docker.
- **Storage**: file JSON cache instead of a database. A schedule rarely changes during a semester — "fetch once + cache + manual refresh" is sufficient, with zero operational overhead.
- **Deployment**: tju requires campus network/VPN → **Vercel cannot run live fetching** (no campus network in cloud). For live features: self-host on a machine with campus-network access (personal computer / campus server / NAS with campus VPN). For read-only demo: a Vercel deployment works via bundled public cache data.

## Vercel Demo Mode

`src/lib/runtime.ts` exports `isLiveFetchAvailable()` and `isDemoMode()`. When `process.env.VERCEL` is set (or `TJU_LIVE=0`), all spawn-based API routes return HTTP 503 with a user-friendly message instead of attempting to spawn Python. Public cache files (`courses-*.json`, `syllabus-*.json`) are committed and bundled via `outputFileTracingIncludes` in `next.config.ts`.

## Key Modules

| Module | Responsibility |
|---|---|
| `scripts/tju_cli.py` | Reads `TJU_USER/TJU_PASS`, logs in, queries by sub-command, outputs unified JSON (`{ok,data}` / `{ok:false,error,code}`) |
| `src/lib/tju/client.ts` | Spawns Python, timeout control, parses JSON, throws `TjuError` (with code) |
| `src/lib/tju/types.ts` | TypeScript mirror types for tju dump output + `TjuError` |
| `src/lib/tju/schedule-store.ts` | `readCachedSchedule()` (read-only cache) / `refreshSchedule()` (fetch + map + write cache), `server-only` |
| `src/lib/tju/courses-store.ts` | `readCachedCourses(semester)` / `refreshCourses(semester)` — per-semester public catalog |
| `src/lib/tju/score-store.ts` | `readCachedScore()` / `refreshScore()` — personal grades (cache key: `score-current`) |
| `src/lib/tju/exam-store.ts` | `readCachedExam(semester)` / `refreshExam(semester)` — personal exams (cache key: `exam-<semester>`) |
| `src/lib/cache/file-cache.ts` | `readCache/writeCache/readCacheWithMeta`, optional TTL, directory-traversal guard |
| `src/features/schedule/mapping.ts` | Maps tju Course (multi-segment arrange) → flat `Course[]`; includes `parseWeeksString` |
| `src/lib/runtime.ts` | `isLiveFetchAvailable()` / `isDemoMode()` — Vercel demo mode detection |

## Schedule Data Flow

1. **SSR**: `schedule/page.tsx` (`dynamic`) calls `readCachedSchedule()` — reads file cache only, **no network**, instant.
2. Cache hit → `ScheduleView` (week switching + refresh button); cache miss → `ScheduleEmpty` (prompts user to fetch).
3. User clicks "Refresh from EAMS" → `useRefreshSchedule` → `GET /api/schedule?refresh=1`.
4. Route calls `refreshSchedule()` → `client.ts` spawns `tju_cli.py schedule` → `mapTjuSchedule` → `writeCache`.
5. Success → `router.refresh()` re-runs SSR, shows new data + "Updated at …".
6. Failure → `TjuError.code` maps to HTTP (login→401 / usage→503 / other→502); frontend shows Chinese error message.

The home page today-courses widget also reads from cache + `getTodayCourses(courses, currentWeek)`.

## Credentials & Security

- `TJU_USER/TJU_PASS` only in `.env.local` (gitignored), passed to the Python child process via environment.
- Cache files only store course/grade/exam data — **no credentials**.
- Single-user self-hosted scenario; no multi-user credential management required. Before opening to multiple users: add authentication, data isolation, privacy notice, rate limiting.

## PWA

Serwist (`app/sw.ts`) precaches + runtime caching; `manifest.ts` for installable metadata. Service worker is disabled in development.

## Known Constraints

- **Webpack build** (`--webpack`): Serwist is not yet compatible with Turbopack.
- **Python environment**: requires `pnpm py:setup` to create `.venv`; `TJU_PYTHON` can point to an alternative interpreter.
- **GPL-3.0**: `tju` is GPL-3.0. This project calls it via a separate process (spawn) — that is aggregation. `scripts/tju_cli.py` directly imports `tju`; if distributing externally, GPL compliance is required.
