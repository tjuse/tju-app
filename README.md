<div align="center">

# tju.app

**A personal campus dashboard for Tianjin University students.**

Course Library · Schedule · Academic Calendar · Grades · Exams · Quick Links

[中文版](./README.zh-CN.md)

</div>

---

## What you can do

**No login required:**

- **Course Library** — Search all 5,000+ courses offered each semester. Filter by campus, department, credit, or teacher. View enrollment numbers, credit hours, and full syllabi.
- **Favorites & Conflict Detection** — Star courses and instantly see if any of them overlap in the weekly schedule.
- **Academic Calendar** — Week-by-week view of the semester: teaching weeks, exam period, and holidays.
- **Quick Links** — One-click access to EAMS, library, mail, SSO, and other TJU portals.

**With the browser extension (personal data, no password stored):**

- **Personal Schedule** — Your real timetable fetched directly from EAMS, displayed in a weekly view.
- **Grades** — Full course grade history and GPA.
- **Exam Schedule** — Date, time, location, and seat number for every upcoming exam.

## Privacy & security

The browser extension accesses EAMS using your existing browser session — the same session you use when you're already logged into EAMS in that browser tab. **No passwords are stored or transmitted anywhere.** The app cannot see your credentials.

Personal data (schedule, grades, exams) stays in your browser and is never sent to any server.

## Installing the browser extension

The extension runs in your browser and fetches your personal EAMS data on demand.

1. Download the latest release from the [Releases](../../releases) page and unzip it.
2. Open Chrome (or Edge) and go to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the unzipped folder.
5. Visit [tju.app](https://tju.app) — the extension will connect automatically.

> The extension requires you to be logged into EAMS in your browser (campus network or VPN). If your session expires, the extension will open the login page for you.

## Disclaimer

This is an unofficial project and is not affiliated with Tianjin University. It accesses only data that the logged-in user is authorized to view. Course catalog data is sourced from the open-source [tju](https://github.com/tjuse/tju-python) library (GPL-3.0). Please verify exam and calendar information against official TJU publications.
