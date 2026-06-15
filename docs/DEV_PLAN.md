# Development Plan — tju.app

Use alongside `ROADMAP.md` (phases) and `ARCHITECTURE.md` (structure).

## Current Status

**Core pipeline complete.** The repo is now a pnpm workspace with three packages:

| Package | Status |
|---|---|
| Root Next.js app | Public course catalog, schedule/grades/exams (Python path), calendar, quick links, AI OCR import |
| `packages/eams-parsers` | TS HTML parsers (39 parity tests vs tju-python), typecheck clean |
| `packages/extension` | MV3 browser extension — background, content script, popup; esbuild bundles to `dist/` |
| `src/lib/extension-bridge.ts` | Client bridge for page ↔ extension communication, sessionStorage helpers |

> This environment has no campus network; end-to-end live fetching cannot be tested here. Code layer (typecheck/lint/test/build) is fully green. **Validate with a real TJU account on campus network/VPN** for live features.

## Immediate Verification (on a campus-network machine)

### Extension path (private data)
1. `pnpm --filter @tju-app/extension build`
2. Open Chrome → Extensions → Load unpacked → select `packages/extension/`
3. Log into EAMS (`http://classes.tju.edu.cn`) in the same browser profile
4. Open the app (`pnpm dev`) → check extension popup shows "已连接到 TJU App"
5. Call `fetchSchedule(semesterId)` from the browser console (via `extension-bridge`) — confirm data returns

### Python path (public data)
1. `pnpm install && pnpm py:setup`
2. Set `TJU_USER` / `TJU_PASS` in `.env.local`
3. `pnpm tju:courses` — confirm course catalog JSON is fetched and cached

## Next Tasks (recommended order)

### 1. Wire extension data into schedule / grades / exams pages

In each page's client component:
- Call `isExtensionAvailable()` on mount
- If present → show "用扩展刷新" button → call `fetchSchedule/fetchUGScore/fetchExam()`
- Store in sessionStorage via bridge helpers → render alongside existing Python-cache data
- If absent → keep current demo / empty state unchanged

### 2. Schedule screenshot import (frontend closure)
- Upload image → `POST /api/import/ocr` (Claude parsing already implemented) → preview / edit recognition result → merge into cache
- `mapping.ts` already has `parseWeeksString` that can be reused

### 3. Manual schedule edit / ICS
- Manual add/edit of individual courses (overwrite or supplement tju data), `source` field to distinguish origin
- ICS import (node-ical) / export (ics package)

### 4. Quick links customization
- User-defined add/remove + drag reorder, localStorage persist

### 5. Polish pass
- Weather card widget, full empty/error/loading state coverage for all pages, mobile polish, Lighthouse PWA audit

## Quality Gate (every commit)

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm --filter @tju-app/eams-parsers test
pnpm --filter @tju-app/extension build
```

CI (`.github/workflows/ci.yml`) runs the same checks + `pnpm build`.

## Adding a New EAMS Data Source (extension path)

1. Add parser to `packages/eams-parsers/src/parsers/` + export from `src/index.ts`
2. Add EAMS step descriptor to `packages/extension/src/shared/flows.ts`
3. Add message type to `src/shared/messages.ts`; handle in `src/background/index.ts`
4. Add `fetch*()` function to `src/lib/extension-bridge.ts`
5. Add test fixture + test file to `packages/eams-parsers/tests/`

## Adding a New tju Query (Python path, public data only)

1. `scripts/tju_cli.py`: add sub-command (call `client.xxx()`, output with `_ok(...)`)
2. `lib/tju/types.ts`: add types; `lib/tju/client.ts`: add `fetchXxx()`
3. Write via `lib/cache`; SSR page reads cache + client-side refresh button
4. Public data only — commit cache files; personal data cache keys go in `.gitignore`

## Future: Campus Card / Electricity

`tju` does not cover these — they are independent systems. Placeholders at `lib/connectors/tju/{card,electricity}.ts`. Follow the same "fetch + file cache" pattern when implementing.
