/**
 * 通过 child_process spawn 调用 `scripts/tju_cli.py`，解析其统一 JSON 输出。
 * 仅在服务端（Route Handler / Server Component）使用。
 */
import { spawn } from "node:child_process";
import path from "node:path";
import {
  type TjuCliResponse,
  type TjuCoursesResult,
  TjuError,
  type TjuScheduleResult,
} from "./types";

const PROJECT_ROOT = process.cwd();
const SCRIPT = path.join(PROJECT_ROOT, "scripts", "tju_cli.py");

/** tju 登录 + 抓取较慢（CAS 流程），给足超时 */
const DEFAULT_TIMEOUT_MS = 45_000;

interface RunOptions {
  semester?: string;
  stuType?: "ug" | "gs" | "both";
  lessionId?: string;
  timeoutMs?: number;
}

/**
 * 运行一个 tju CLI 子命令，返回解析后的数据（成功）或抛 TjuError（失败）。
 */
async function runTju<T>(command: string, opts: RunOptions = {}): Promise<T> {
  const python = process.env.TJU_PYTHON || ".venv/bin/python";
  const args = [SCRIPT, command];
  if (opts.semester) args.push("--semester", opts.semester);
  if (opts.stuType) args.push("--stu-type", opts.stuType);
  if (opts.lessionId) args.push("--lession-id", opts.lessionId);

  return new Promise<T>((resolve, reject) => {
    const child = spawn(python, args, {
      cwd: PROJECT_ROOT,
      // 继承 process.env：透传 TJU_USER/TJU_PASS（若设置）与 TJU_ENV_FILE。
      // 不显式写空串，否则会顶掉 Python 侧从 TJU_ENV_FILE 读取的回退。
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new TjuError("查询超时（请确认已连校园网/VPN）", "network"));
    }, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      // 通常是 python 解释器找不到
      reject(
        new TjuError(
          `无法启动 Python（${python}）：${err.message}。请先运行 \`pnpm py:setup\`。`,
          "usage",
        ),
      );
    });

    child.on("close", (codeNum) => {
      clearTimeout(timer);
      const raw = stdout.trim();
      if (!raw) {
        reject(
          new TjuError(
            `Python 无输出（exit=${codeNum}）${stderr ? `：${stderr.trim()}` : ""}`,
            "unknown",
          ),
        );
        return;
      }
      let parsed: TjuCliResponse<T>;
      try {
        parsed = JSON.parse(raw) as TjuCliResponse<T>;
      } catch {
        reject(new TjuError(`无法解析 Python 输出：${raw.slice(0, 200)}`, "parse"));
        return;
      }
      if (parsed.ok) {
        resolve(parsed.data);
      } else {
        reject(new TjuError(parsed.error, parsed.code));
      }
    });
  });
}

/** 抓取个人课表（实时，未缓存）。需校园网/VPN。 */
export function fetchSchedule(semester?: string): Promise<TjuScheduleResult> {
  return runTju<TjuScheduleResult>("schedule", { semester });
}

/**
 * 抓取全校公开课程库（实时，未缓存）。一学期数千门、多页爬取，较慢。
 * 需校园网/VPN。
 */
export function fetchCourses(
  semester: string,
  stuType: "ug" | "gs" | "both" = "both",
): Promise<TjuCoursesResult> {
  return runTju<TjuCoursesResult>("courses", {
    semester,
    stuType,
    timeoutMs: 180_000, // 全量爬取给足时间
  });
}

/** 抓取课程大纲（markdown）。需校园网/VPN。 */
export function fetchSyllabus(
  lessionId: string,
): Promise<{ lession_id: string; syllabus: string }> {
  return runTju<{ lession_id: string; syllabus: string }>("syllabus", { lessionId });
}
