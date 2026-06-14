#!/usr/bin/env python3
"""tju.app — Python CLI bridge to the `tju` library.

被 Next.js 后端通过 child_process spawn 调用。登录后按子命令查询，并把结果以
**统一 JSON** 打印到 stdout：

    {"ok": true,  "data": {...}}
    {"ok": false, "error": "...", "code": "login|network|parse|usage|unknown"}

约定：无论成功失败都打印一行 JSON 到 stdout；成功 exit 0，失败 exit 1。

凭据来源（按优先级）：
  1. TJU_ENV_FILE 指向的 .env 文件（KEY=VALUE，仅读取，不修改）
  2. 进程环境变量 TJU_USER / TJU_PASS
真实查询需校园网 / VPN。

用法：
    python scripts/tju_cli.py courses  [--semester 25262] [--stu-type ug|gs|both]
    python scripts/tju_cli.py schedule [--semester 25262]
    python scripts/tju_cli.py profile
    python scripts/tju_cli.py exam [--semester 25262]
    python scripts/tju_cli.py score
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
    """若设置了 TJU_ENV_FILE，从中读取 KEY=VALUE 注入环境（仅在未设置时）。只读。"""
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
        # 读取失败不致命：可能凭据已在进程环境里
        pass


# 全校课程库分页参数（对学校系统友好）
PAGE_SIZE = 1000
PAGE_DELAY = 0.8
PROJECT_DELAY = 1.2


def _fetch_project(client, StuType, semester, stu_type, label):
    """爬取某 project（本科/研究生）的全部分页，返回 dump 后的 dict 列表。"""
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
        "command", choices=["courses", "schedule", "profile", "exam", "score"]
    )
    parser.add_argument("--semester", default=None, help="学期代码，如 25262；缺省用当前学期")
    parser.add_argument(
        "--stu-type",
        choices=["ug", "gs", "both"],
        default="both",
        help="courses：本科 ug / 研究生 gs / 两者 both（默认）",
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

        if args.command == "courses":
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
            exams = client.exam(semester=semester)
            data = exams.Schema(many=True).dump(exams) if hasattr(exams, "Schema") else exams
            _ok({"student": student, "semester": semester, "exams": data})

        elif args.command == "score":
            scores = client.score()
            data = scores.Schema(many=True).dump(scores) if hasattr(scores, "Schema") else scores
            _ok({"student": student, "scores": data})

    except LoginError as exc:
        _fail(f"登录失败：{exc}。请检查 TJU_USER/TJU_PASS，并确认已连校园网/VPN。", code="login")
    except (DataError, HtmlParseError) as exc:
        _fail(f"数据解析失败：{exc}", code="parse")
    except Exception as exc:  # noqa: BLE001
        _fail(f"查询失败：{exc}", code="network")


if __name__ == "__main__":
    main()
