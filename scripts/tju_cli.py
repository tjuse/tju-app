#!/usr/bin/env python3
"""tju.app — Python CLI bridge to the `tju` library.

Called by the Next.js backend via child_process.spawn. Logs in to TJU, runs
the requested sub-command, and prints the result as a single JSON line on
stdout using the unified envelope:

    {"ok": true,  "data": {...}}
    {"ok": false, "error": "...", "code": "login|network|parse|usage|unknown"}

Contract: always exactly one JSON line on stdout; exit 0 on success, exit 1 on
failure.

Credential resolution order:
  1. TJU_ENV_FILE — path to an .env file (KEY=VALUE); read-only, never written.
  2. Process environment variables TJU_USER / TJU_PASS.

Live data requires campus network access or VPN.

Usage:
    python scripts/tju_cli.py courses  [--semester 25262] [--stu-type ug|gs|both]
    python scripts/tju_cli.py schedule [--semester 25262]
    python scripts/tju_cli.py profile
    python scripts/tju_cli.py exam [--semester 25262]
    python scripts/tju_cli.py score
    python scripts/tju_cli.py syllabus --lession-id <id>
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any


def _emit(payload: dict[str, Any], *, ok: bool) -> None:
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()
    sys.exit(0 if ok else 1)


def _ok(data: Any) -> None:
    _emit({"ok": True, "data": data}, ok=True)


def _fail(message: str, code: str = "unknown") -> None:
    _emit({"ok": False, "error": message, "code": code}, ok=False)


def _load_env_file() -> None:
    """If TJU_ENV_FILE is set, inject KEY=VALUE pairs into the environment.

    Values are only set when the key is not already present (os.environ.setdefault).
    The file is never modified — read-only access only.
    """
    path = os.environ.get("TJU_ENV_FILE")
    if not path:
        return
    try:
        for line in Path(path).read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key.strip(), value)
    except OSError:
        # Non-fatal: credentials may already be in the process environment.
        pass


# Pagination parameters for the public course catalog (be polite to the server).
PAGE_SIZE = 1000
PAGE_DELAY = 0.8
PROJECT_DELAY = 1.2


def _fetch_project(client, StuType, semester, stu_type, label):
    """Crawl all pages for one project (undergraduate or graduate) and return
    a list of serialised LibCourse dicts."""
    from tju.models.course import LibCourse

    collected = []
    first = client.query_courses(
        stu_type=stu_type, semester=semester, page_no=1, page_size=PAGE_SIZE
    )
    total = first["total"]
    collected.extend(first["list"])
    page_no = 2
    while len(collected) < total:
        time.sleep(PAGE_DELAY)
        page = client.query_courses(
            stu_type=stu_type, semester=semester, page_no=page_no, page_size=PAGE_SIZE
        )
        batch = page["list"]
        if not batch:
            break
        collected.extend(batch)
        page_no += 1

    data = LibCourse.Schema(many=True).dump(collected)
    for d in data:
        d["student_type"] = label
    return data


def _cmd_courses(client, StuType, semester, which):
    from tju.exceptions import DataError, HtmlParseError

    ug, gs = [], []
    warnings = []

    if which in ("ug", "both"):
        try:
            ug = _fetch_project(client, StuType, semester, StuType.UNDERGRADUATE, "undergraduate")
        except (DataError, HtmlParseError) as exc:
            warnings.append(f"本科课程库获取失败：{exc}")

    if which in ("gs", "both"):
        if which == "both":
            time.sleep(PROJECT_DELAY)
        try:
            gs = _fetch_project(client, StuType, semester, StuType.GRADUATE, "graduate")
        except (DataError, HtmlParseError) as exc:
            warnings.append(f"研究生课程库获取失败：{exc}")

    courses = ug + gs
    if not courses and warnings:
        _fail("；".join(warnings), code="parse")
        return

    _ok(
        {
            "semester": semester,
            "total": len(courses),
            "undergraduate": len(ug),
            "graduate": len(gs),
            "courses": courses,
            "warnings": warnings,
        }
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="tju.app Python bridge")
    parser.add_argument(
        "command", choices=["courses", "schedule", "profile", "exam", "score", "syllabus"]
    )
    parser.add_argument("--semester", default=None, help="semester code, e.g. 25262 (defaults to current)")
    parser.add_argument("--lession-id", default=None, help="syllabus: lession_id to fetch")
    parser.add_argument(
        "--stu-type",
        choices=["ug", "gs", "both"],
        default="both",
        help="courses: undergraduate=ug / graduate=gs / both (default)",
    )
    args = parser.parse_args()

    _load_env_file()

    try:
        from tju import Session
        from tju.client import Client
        from tju.exceptions import DataError, HtmlParseError, LoginError
        from tju.models import StuType
        from tju.models.schedule import Course
    except ImportError as exc:  # noqa: BLE001
        _fail(f"tju 库未安装或导入失败：{exc}。请运行 `pnpm py:setup`。", code="usage")
        return

    try:
        session = Session()
        session.login()
        client = Client(session=session)
        semester = args.semester or client.semester

        student = {
            "id": getattr(client, "stu_id", None),
            "name": getattr(client, "stu_name", None),
            "type": getattr(getattr(client, "stu_type", None), "name", None),
            "semester": semester,
        }

        if args.command == "syllabus":
            if not args.lession_id:
                _fail("syllabus 需要 --lession-id", code="usage")
                return
            md = client.query_syllabus(args.lession_id, format="md")
            _ok({"lession_id": args.lession_id, "syllabus": md})

        elif args.command == "courses":
            _cmd_courses(client, StuType, semester, args.stu_type)

        elif args.command == "schedule":
            schedule = client.schedule(semester=semester)
            courses = Course.Schema(many=True).dump(schedule)
            _ok({"student": student, "semester": semester, "courses": courses})

        elif args.command == "profile":
            profile = client.profile
            data = profile.Schema().dump(profile) if hasattr(profile, "Schema") else profile
            _ok({"student": student, "profile": data})

        elif args.command == "exam":
            from tju.models.exam import Exam
            exams = client.exam(semester=semester)
            rows = Exam.Schema(many=True).dump(list(exams))
            _ok({"student": student, "semester": semester, "exams": rows})

        elif args.command == "score":
            is_gs = client.stu_type == StuType.GRADUATE
            result = client.score()
            score_list = result.get("list", [])
            if is_gs:
                from tju.models.score import GSScore
                rows = GSScore.Schema(many=True).dump(list(score_list))
            else:
                from tju.models.score import UGScore
                rows = UGScore.Schema(many=True).dump(list(score_list))
            _ok({
                "student": student,
                "student_type": "graduate" if is_gs else "undergraduate",
                "scores": rows,
            })

    except LoginError as exc:
        _fail(f"登录失败：{exc}。请检查 TJU_USER/TJU_PASS，并确认已连校园网/VPN。", code="login")
    except (DataError, HtmlParseError) as exc:
        _fail(f"数据解析失败：{exc}", code="parse")
    except Exception as exc:  # noqa: BLE001
        _fail(f"查询失败：{exc}", code="network")


if __name__ == "__main__":
    main()
