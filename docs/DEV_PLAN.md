# Development Plan — tju.app

Use alongside `ROADMAP.md` (phases) and `ARCHITECTURE.md` (structure).

## Current Status

**Core pipeline complete**: `tju` library → `scripts/tju_cli.py` → Next.js spawn → mapping → file cache → schedule weekly view + today-courses widget. Database/Docker removed. Four new features added: grades, exams, course conflict detection, course offering trends.

> This environment has no campus network; end-to-end live fetching cannot be tested here. Code layer (typecheck/lint/test/build) is fully green. **Validate with a real TJU account on campus network/VPN** for live features.

## Immediate Verification (on a campus-network machine)

1. `pnpm install && pnpm py:setup`
2. Set `TJU_USER` / `TJU_PASS` in `.env.local`
3. `pnpm tju:schedule` — confirm login succeeds and prints schedule JSON (`{"ok":true,...}`)
4. `pnpm dev` → open schedule page → click "Refresh from EAMS" → confirm schedule renders, week switching works, today-courses widget on home page is correct
5. If field mapping is off, adjust `src/features/schedule/mapping.ts` (TJU period/week format)

## Next Tasks (recommended order)

### 1. Schedule screenshot import (frontend closure)
- Upload image → `POST /api/import/ocr` (Claude parsing already implemented) → preview / edit recognition result → merge into cache
- `mapping.ts` already has `parseWeeksString` that can be reused

### 2. Manual schedule edit / ICS
- Manual add/edit of individual courses (overwrite or supplement tju data), `source` field to distinguish origin
- ICS import (node-ical) / export (ics package)

### 3. Quick links customization
- User-defined add/remove + drag reorder, localStorage persist

### 4. Polish pass
- Weather card widget, full empty/error/loading state coverage for all pages, mobile polish, Lighthouse PWA audit

## Quality Gate (every commit)

```bash
pnpm typecheck && pnpm lint && pnpm test
```

CI (`.github/workflows/ci.yml`) runs the same checks + `pnpm build`.

## Adding a New tju Query (pattern)

1. `scripts/tju_cli.py`: add sub-command (call `client.xxx()`, output with `_ok(...)`)
2. `lib/tju/types.ts`: add types; `lib/tju/client.ts`: add `fetchXxx()`
3. If persistence needed → write via `lib/cache`; SSR page reads cache + client-side refresh button
4. Personal data (score, exam, schedule): cache key goes in git-ignored pattern; public data (courses, syllabus): commit cache files

## Future: Campus Card / Electricity

`tju` does not cover these — they are independent systems. Placeholders at `lib/connectors/tju/{card,electricity}.ts`. Follow the same "fetch + file cache" pattern when implementing.
