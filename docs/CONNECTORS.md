# Data Connectors — tju.app

## Schedule / Grades / Exams — via `tju` library (integrated)

We reuse the community library **[`tju`](https://github.com/tjuse/tju-python)** (PyPI: `tju`, GPL-3.0), which wraps:
- TJU SSO single sign-on (`sso.tju.edu.cn`) + EAMS academic system (`classes.tju.edu.cn`)
- CAS authentication, CAPTCHA handling, HTML parsing

**No reinventing the wheel**: we only write a thin bridge `scripts/tju_cli.py`, called by Next.js via spawn.

### Capabilities provided by `tju` (`Client`)

| Method | Description | CLI integrated |
|---|---|---|
| `client.schedule(semester)` | Personal schedule | ✅ `schedule` |
| `client.profile` | Student profile | ✅ `profile` |
| `client.exam(semester)` | Exam schedule | ✅ `exam` |
| `client.score()` | Academic grades | ✅ `score` |
| `client.query_courses(stu_type, semester, page_no, page_size)` | Public course catalog (UG + GS, paginated) | ✅ `courses` |
| `client.free_classrooms(...)` | Free classroom query | ⏳ can be added |

### Data shape (schedule)

`client.schedule()` returns `Course[]`. Each course has: `class_id / course_id / name / credit / campus / weeks (raw string e.g. "1-16") / teacher[] / arrange[]`.
Each `arrange` segment: `weekday (1–7) / unit[] (period numbers) / week[] (week numbers) / location / teacher[]`.

See `src/features/schedule/mapping.ts` for the mapping: each course is expanded by its arrange segments into multiple flat `Course` records.

### Adding a new query (steps)

1. `scripts/tju_cli.py`: add a sub-command to `choices`, call the corresponding `client.xxx()`, output with `_ok(...)`.
2. `src/lib/tju/types.ts`: add the return type.
3. `src/lib/tju/client.ts`: add `fetchXxx()`.
4. If persistence is needed, write to file via `lib/cache`.

### Public course catalog (implemented)

- Sub-command: `courses --semester 25262 [--stu-type ug|gs|both]` — crawls UG (project 1) + GS (project 22) full paginated results, each record tagged with `student_type`.
- ~5,000+ courses per semester, ~3.7 MB → **cached per semester** (`data/cache/courses-<sem>.json`); **server-side filtered and paginated** (`src/features/courses/filter.ts`) — the full JSON is never sent to the client.
- Page `/courses`: semester selector + keyword (name/id/teacher) + UG/GS / campus / category filters + pagination, via `CoursesBrowser`.
- Semester codes: see `src/features/courses/semesters.ts` (same format as tju `consts.SEMESTER`, e.g. `25262` = 2025–2026 Spring).

### Credentials (prerequisites)

Two modes:
- **A**: set `TJU_USER` / `TJU_PASS` in `.env.local` + run `pnpm py:setup` (creates `.venv` with tju installed in this repo).
- **B (current dev setup)**: reuse an existing environment, **without duplicating credentials**:
  - `TJU_ENV_FILE=/data/workspace/tju-python/.env` (reads credentials from there, read-only)
  - `TJU_PYTHON=/data/workspace/tju-python/.venv/bin/python` (already has tju installed)
- Shared requirement: **campus network or VPN**.
- CLI debug: `.venv/bin/python scripts/tju_cli.py courses --semester 25262`.

## Campus Card / Electricity — future connectors

**`tju` does not cover** campus card balance or electricity (separate systems outside EAMS). Placeholders exist at `src/lib/connectors/tju/{card,electricity}.ts` — calling them throws "not implemented". Future implementation can reference Beiyang Wiki (`wiki.tjubot.cn`) and follow the same "spawn + file cache" pattern.

## Security

- Credentials only in `.env.local`, passed to child process via environment; never printed, never written to cache files.
- Only fetch data authorized by the user themselves; low frequency, cache-backed, respectful of school systems.
