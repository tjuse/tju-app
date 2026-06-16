# Changelog

All notable changes to **tju.app** (the web dashboard) and the **TJU App Bridge**
browser extension are documented here. Both ship together under a single version.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.1.4 - 2026-06-16

### tju.app (web dashboard)

#### Fixed
- Course syllabus showed "spawn .venv/bin/python ENOENT" on the deployed site.
  Root cause: `isLiveFetchAvailable()` keyed off `NETLIFY` / `VERCEL` env vars,
  which are only set at *build* time — at request time they were undefined, so
  the server wrongly tried to spawn Python. It now keys off `NODE_ENV`
  (production = deployed = no Python). This was also the original cause of the
  first schedule ENOENT.
- Course syllabus now falls back to the browser extension when it isn't in the
  committed cache, so syllabi load on the deployed site (converted to Markdown
  in-page) instead of failing.

### Browser Extension — TJU App Bridge

#### Fixed
- Exam returned the wrong semester's data. The EAMS `semesterForm` submits both
  `project.id` (UG=1 / GS=22) and `semester.id`; omitting `project.id` made EAMS
  ignore the semester switch and return the active batch. We now send both, and
  read the batch id from the page's `bg.Go(...examBatch.id=N...)` content loader
  (which reflects the selected semester).

#### Added
- Syllabus fetching (`tju:fetchSyllabus`): returns raw HTML for the page to
  convert to Markdown (turndown needs a DOM, unavailable in the service worker).

## v0.1.3 - 2026-06-16

### Browser Extension — TJU App Bridge

#### Fixed
- Schedule still failed with "Cannot find TaskActivity section": the
  `courseTable` POST sent its parameters in the request body, but EAMS expects
  them in the URL query string (tju-python uses `params=`, not `data=`). The
  parameters are now sent as the query string, so the timetable HTML returns
  correctly.

### tju.app (web dashboard)

#### Fixed
- Extension-fetched data (schedule / grades / exams / today's courses) is now
  persisted in `localStorage` instead of `sessionStorage`, so it survives tab
  closes and browser restarts instead of disappearing.

## v0.1.2 - 2026-06-16

Fixes graduate-account support across schedule and grades, where the flows had
diverged from the upstream Python client.

### Browser Extension — TJU App Bridge

#### Fixed
- Schedule fetch failed with "Cannot find TaskActivity section" for graduate
  accounts: the flow hardcoded the undergraduate `projectId=1` and read the
  course IDs from the wrong page. It now auto-detects undergraduate vs graduate
  (via `dataQuery.action`), uses `projectId=22` for graduates, performs the
  undergraduate-only warm-up request, and reads IDs from `!innerIndex.action` —
  matching tju-python.
- Grades fetch for graduate accounts returned `HTTP 500` from `person!search`
  because it sent an empty `semesterId`. Both undergraduate and graduate grades
  now use the all-history endpoint (`person!historyCourseGrade`) after the
  required warm-up request, as in tju-python.
- Grades no longer require a manual 本科/研究生 toggle (which defaulted to
  undergraduate and showed wrong columns for graduates). The student type is
  detected automatically and shown as a label.
- "Extension context invalidated" error after the extension was updated while a
  page stayed open: the content script now guards `chrome.runtime` calls and
  asks the user to refresh the page instead of throwing.

#### Changed
- Redesigned the popup to match the tju.app visual style (dark, Beiyang Blue
  accent, status indicator).

### tju.app (web dashboard)

#### Changed
- Grades page auto-detects undergraduate vs graduate from the extension instead
  of a manual toggle.

## v0.1.1 - 2026-06-16

### Browser Extension — TJU App Bridge

#### Fixed
- The popup showed "请在 TJU App 页面使用" on the deployed site
  (`*.netlify.app` / `*.vercel.app`) because it only recognised `tju.app`
  and `localhost`. It now derives the allowed origins from the manifest's
  content-script matches, so the popup and the actual injection can never
  drift apart again.
- The popup's "刷新我的数据" button was a no-op: it dispatched an event no
  page listened for. The popup now messages the content script, which
  relays a `tju-extension:refresh` event that the schedule / grades / exams
  pages listen for and act on.

#### Changed
- Replaced the `chrome.scripting.executeScript` refresh trigger with a
  message to the already-injected content script, and dropped the now
  unnecessary `scripting` permission.

## v0.1.0 - 2026-06-16

First public release. The web app serves the public course catalog with no login,
and an optional browser extension surfaces each student's private EAMS data
(schedule, grades, exams) entirely client-side — no passwords are ever stored or
sent to a server.

### tju.app (web dashboard)

#### Added
- Campus dashboard scaffold: Next.js 16 (App Router), React 19, TypeScript
  (strict), Tailwind CSS v4, PWA (installable, offline-ready).
- Public course library: full-semester catalog with semester search, advanced
  filters (campus / department / credit / weekday / student type), sorting and
  pagination.
- 20 years of bundled TJU course data (academic years 2005-2006 through
  2025-2026), served from a committed JSON cache so the catalog works on any
  deployment with no Python and no campus network at runtime.
- Course detail pages with syllabus rendering.
- Course favorites with automatic schedule conflict detection.
- Course comparison view.
- Course statistics and cross-semester trends.
- Personal schedule: weekly timetable view, fetched via the browser extension.
- Grades: full history with GPA, undergraduate / graduate toggle, fetched via
  the browser extension.
- Exam schedule: per-semester date / time / location / seat, fetched via the
  browser extension.
- Academic calendar: teaching weeks, exam period and holidays.
- Quick links to common TJU portals (EAMS, library, SSO, mail, …).
- Overview home with a live "today's courses" widget, greeting, current-week and
  upcoming-events widgets.
- claude.ai-style interface: collapsible sidebar, calm animations, tight layout,
  dark-first with Beiyang Blue accent.

#### Changed
- Private data (schedule / grades / exams) is now fetched in the browser via the
  extension instead of a server-side Python crawl, so these pages work on
  Vercel / Netlify without Python or campus-network access and never transmit
  credentials.
- Storage is a file-based JSON cache for public data and `sessionStorage` for
  extension-fetched private data — no database, no Docker.

#### Removed
- Dead server-side `/api/{schedule,score,exam}` routes and their Python-backed
  stores, which could never run on serverless deployments.

### Browser Extension — TJU App Bridge (MV3)

#### Added
- Manifest V3 extension that reuses the user's existing logged-in EAMS session,
  so there is no CAS re-login, no DES encryption and no captcha to solve.
- Background service worker that fetches EAMS over the user's campus session,
  detects session expiry and opens the CAS login page when needed.
- Content-script bridge relaying `window.postMessage` ↔ `chrome.runtime` between
  the web app and the service worker, restricted to the app's own origins.
- Popup with connection status and a manual refresh trigger.
- `@tju-app/eams-parsers`: a framework-agnostic TypeScript library of EAMS HTML
  parsers (schedule, course library, grades, exams, profile, free classrooms,
  syllabus), validated by 51 parity tests against the upstream Python library.
- Content script matches the production domains (`tju.app`, `*.netlify.app`,
  `*.vercel.app`) and localhost so the bridge connects on the deployed site.

#### Security
- No credentials are ever stored or transmitted; the extension piggybacks on the
  browser's own EAMS session and personal data stays in the browser.
