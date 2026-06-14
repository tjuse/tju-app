<div align="center">

# tju.app

**Tianjin University Campus Dashboard** — Course Library · Schedule · Calendar · Grades · Exams · Quick Links

Polished, interactive, all-in-one. Minimal modern design, dark-first, PWA-ready.

[中文版 README](./README.zh-CN.md) · [AGENTS.md](./AGENTS.md) · [Roadmap](./docs/ROADMAP.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftjuse%2Ftju-app)

> **Demo note:** The Vercel deploy is read-only — public course catalog, statistics, trends, and conflict detection all work from bundled cache data. Personal features (schedule, grades, exams) require local setup with valid TJU credentials.

</div>

---

## ✨ Features

- 🎨 **World-class UI/UX** — minimal modern design (Linear/Vercel aesthetic), dark-first + Beiyang Blue accent, smooth micro-animations
- 📚 **Public Course Library** — full TJU course catalog (5,000+ courses per semester), semester history, advanced filters, statistics, trends across semesters
- ⭐ **Favorites + Conflict Detection** — star courses, then auto-detect schedule conflicts in your selection
- 📅 **Personal Schedule** — import via screenshot AI recognition (Claude Vision) or manual entry; weekly view
- 🗓 **Academic Calendar** — semester weeks, exam periods, holidays at a glance
- 🔗 **Quick Links** — curated TJU portals (EAMS, library, SSO, mail, …)
- 🎓 **Grades** — full grade history with GPA summary (requires credentials locally)
- 📝 **Exams** — upcoming exam schedule with date / time / location / seat (requires credentials locally)
- 📱 **PWA** — installable, offline-ready, responsive for mobile and desktop

## 🛠 Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · shadcn-style components · Zustand · Recharts · Serwist (PWA) · Anthropic SDK · Biome · Vitest / Playwright · pnpm

Data source: **[`tju`](https://github.com/tjuse/tju-python)** Python library (wraps TJU SSO + EAMS) via a thin `scripts/tju_cli.py` bridge. **No database, no Docker** — file-based JSON cache.

## 🚀 Quick Start

### Vercel (demo mode, read-only)

Click the "Deploy with Vercel" button above. The course catalog, statistics, trends, and conflict detection work immediately from the bundled demo data. Personal data features show a demo-mode notice until credentials are configured.

### Local (full features)

```bash
# 1. Install JS dependencies
pnpm install

# 2. Install Python dependencies (creates .venv + installs tju)
pnpm py:setup

# 3. Configure environment variables
cp .env.example .env.local
#   Edit .env.local:
#   - TJU_USER / TJU_PASS  — student ID and unified-auth password (for live EAMS fetching)
#   - TJU_ENV_FILE          — or point to an existing .env file with those credentials
#   - ANTHROPIC_API_KEY     — optional, for schedule-screenshot OCR import

# 4. Start development server
pnpm dev          # http://localhost:3000

# Fetch the current semester's public course catalog (requires campus network / VPN)
pnpm tju:courses

# Debug: run the Python CLI directly
TJU_ENV_FILE=... .venv/bin/python scripts/tju_cli.py score
```

## 📋 Commands

| Command | Description |
|---|---|
| `pnpm dev` | Development server (webpack) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` / `pnpm lint:fix` | Biome check / auto-fix |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright) |
| `pnpm py:setup` | Create .venv and install tju |
| `pnpm tju:schedule` | Fetch personal schedule (debug) |
| `pnpm tju:courses` | Fetch public course catalog (debug) |

> **Note:** Build uses `--webpack` because Serwist (PWA) is not yet compatible with Turbopack. Biome commands must not receive a `.` path argument.

## 📁 Project Structure

- [AGENTS.md](./AGENTS.md) — collaboration conventions (read first)
- [docs/ROADMAP.md](./docs/ROADMAP.md) — phased feature roadmap
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — architecture overview
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — design system tokens and rules
- [docs/CONNECTORS.md](./docs/CONNECTORS.md) — TJU data source integration details
- [docs/DEV_PLAN.md](./docs/DEV_PLAN.md) — development task breakdown

## ⚠️ Disclaimer

Unofficial project. Login-required features only fetch data authorized by the user; credentials are stored locally in `.env.local` only — never logged or cached to disk in readable form. Course data (`tju`) is GPL-3.0 licensed. Calendar data requires manual verification against official TJU publications each semester.
