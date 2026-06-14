# Roadmap — tju.app

> Architecture: **tju Python library for data fetching + file-based JSON cache + self-hosted**. No database, no Docker. Live features require campus network / VPN; public course data is bundled for the Vercel read-only demo.

## Completed ✅

- [x] Next.js 16 + TS + Tailwind v4 + pnpm scaffold
- [x] Biome / Vitest / Playwright / GitHub Actions CI
- [x] Design system tokens + dark theme + light mode toggle
- [x] Dashboard layout shell (sidebar / mobile tab / header / theme toggle) + FadeIn animation
- [x] Base UI components (Button / Card / Badge / Skeleton / Dialog)
- [x] PWA (manifest + Serwist + icons)
- [x] Quick links page (built-in TJU portals, by category)
- [x] Academic calendar page (semester weeks / current week / event timeline) + `/api/calendar`
- [x] **Schedule pipeline:** `tju` library → `scripts/tju_cli.py` → spawn → mapping → file cache → weekly view + refresh
- [x] Dashboard today-courses widget reads real cached data
- [x] Schedule screenshot AI import backend (`/api/import/ocr` + Claude Vision)
- [x] Removed Postgres / Prisma / Auth.js / Docker; switched to file cache
- [x] **Public course library** (`courses` command): full-semester crawl → per-semester cache → server-side filter + pagination → `/courses` page (semester / search / type / campus / category / weekday / pagination)
- [x] Credential reuse: `TJU_ENV_FILE` reads external .env read-only (no credential duplication into repo)
- [x] **Course detail + syllabus:** click card → Dialog, full fields + lazy-load syllabus markdown (`query_syllabus`, cached per lession_id)
- [x] **Favorites:** localStorage (zustand persist) course snapshots, star button, `/courses/favorites` cross-semester view
- [x] **Advanced filters + sort:** weekday / has-syllabus / credit sort / name sort
- [x] **Course statistics:** `/courses/stats` — undergrad/grad breakdown / category / campus / credit / weekday / top teachers (Recharts) + browse/favorites/stats sub-nav
- [x] **Course offering trends:** `/courses/trends` — multi-semester total/campus/category trend charts (Line + Bar)
- [x] **Course conflict detection:** `/courses/conflict` — detects overlapping weekday+period+weeks among favorited courses
- [x] **Grades page:** `/grades` — full grade history table with semester grouping + summary (local only; demo notice on Vercel)
- [x] **Exams page:** `/exams` — exam schedule with date/time/location/seat (local only; demo notice on Vercel)
- [x] Historical semesters: semester dropdown (2021–2027), independent cache per semester
- [x] **Vercel deployability:** `outputFileTracingIncludes` bundles public caches; `isLiveFetchAvailable()` / `isDemoMode()` guard all spawn routes; `maxDuration` ≤ 60s
- [x] **English-ization:** all code comments, AGENTS.md, docs, .env.example in English; bilingual README (EN + ZH)

> Note: `query_course_info` (teaching department) has a broken parser in the current tju version (HtmlParseError). Workaround: use syllabus + LibCourse fields instead.

## In Progress 🚧

- [ ] Schedule screenshot import **frontend**: upload → OCR → preview / edit confirm → write cache (backend `/api/import/ocr` is done)
- [ ] Manual schedule entry / edit (overwrite individual courses)
- [ ] ICS import (node-ical) / export (ics package)
- [ ] Quick links: user-defined add/remove + drag-reorder (localStorage persist)
- [ ] Empty / error / loading states — full coverage + responsive polish + Lighthouse PWA audit

## Future 📋

- [ ] Campus card + electricity (not covered by `tju`; need independent connectors, see `lib/connectors/tju` placeholders)
- [ ] Free classroom query (`tju free_classrooms`)
- [ ] Notification / reminder (class start alerts), settings center, more widgets
- [ ] If opened to multi-user: auth, data isolation, privacy notice, rate limiting
