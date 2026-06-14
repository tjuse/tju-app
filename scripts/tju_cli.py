#!/usr/bin/env python3
"""tju.app — Python CLI bridge to the `tju` library.

被 Next.js 后端通过 child_process spawn 调用。读取 TJU_USER / TJU_PASS
环境变量登录，按子命令查询，并把结果以**统一 JSON** 打印到 stdout：

    {"ok": true,  "data": {...}}
    {"ok": false, "error": "...", "code": "login|network|parse|usage|unknown"}

约定：无论成功失败都打印一行 JSON 到 stdout；成功 exit 0，失败 exit 1。
这样 TS 侧只需读 stdout + JSON.parse，再看 ok 字段。

真实查询需校园网 / VPN 连接。

用法：
    python scripts/tju_cli.py schedule [--semester 24251]
    python scripts/tju_cli.py profile
    python scripts/tju_cli.py exam [--semester 24251]
    python scripts/tju_cli.py score
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any


def _emit(payload: dict[str, Any], *, ok: bool) -> None:
    """打印统一 JSON 并以对应退出码结束。"""
    sys.stdout.write(json.dumps(payload, ensure_ascii=False))
    sys.stdout.flush()
    sys.exit(0 if ok else 1)


def _ok(data: Any) -> None:
    _emit({"ok": True, "data": data}, ok=True)


def _fail(message: str, code: str = "unknown") -> None:
    _emit({"ok": False, "error": message, "code": code}, ok=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="tju.app Python bridge")
    parser.add_argument(
        "command",
        choices=["schedule", "profile", "exam", "score"],
        help="要执行的查询",
    )
    parser.add_argument(
        "--semester",
        default=None,
        help="学期，如 24251；缺省用 client.semester（当前学期）",
    )
    args = parser.parse_args()

    # 延迟导入，便于在未安装 tju 时给出清晰错误
    try:
        from tju import Session
        from tju.client import Client
        from tju.exceptions import DataError, HtmlParseError, LoginError
        from tju.models.schedule import Course
    except ImportError as exc:  # noqa: BLE001
        _fail(
            f"tju 库未安装或导入失败：{exc}。请运行 `pnpm py:setup`。",
            code="usage",
        )
        return

    try:
        session = Session()  # 读取 TJU_USER / TJU_PASS
        session.login()
        client = Client(session=session)
        semester = args.semester or client.semester

        student = {
            "id": getattr(client, "stu_id", None),
            "name": getattr(client, "stu_name", None),
            "type": getattr(getattr(client, "stu_type", None), "name", None),
            "semester": semester,
        }

        if args.command == "schedule":
            schedule = client.schedule(semester=semester)
            courses = Course.Schema(many=True).dump(schedule)
            _ok({"student": student, "semester": semester, "courses": courses})

        elif args.command == "profile":
            profile = client.profile
            # profile 可能是 dataclass，尽量序列化为 dict
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
        _fail(f"登录失败：{exc}。请检查 TJU_USER/TJU_PASS 是否正确，并确认已连校园网/VPN。", code="login")
    except (DataError, HtmlParseError) as exc:
        _fail(f"数据解析失败：{exc}", code="parse")
    except Exception as exc:  # noqa: BLE001
        # 网络类错误（连接超时等）多落在这里
        _fail(f"查询失败：{exc}", code="network")


if __name__ == "__main__":
    main()
