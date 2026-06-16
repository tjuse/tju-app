# Changelog

All notable changes to **tju.app** (the web dashboard) and the **TJU App Bridge**
browser extension are documented here. Both ship together under a single version.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
