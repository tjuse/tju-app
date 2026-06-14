/**
 * Server-only module that spawns `scripts/tju_cli.py` via child_process and
 * parses its unified {ok, data} JSON output. Must not be imported from client
 * components or edge runtime.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import {
  type TjuCliResponse,
  type TjuCoursesResult,
  TjuError,
  type TjuExamResult,
  type TjuScheduleResult,
  type TjuScoreResult,
} from "./types";

const PROJECT_ROOT = process.cwd();
const SCRIPT = path.join(PROJECT_ROOT, "scripts", "tju_cli.py");

// TJU login via CAS SSO + EAMS crawl is slow; allow 45 s by default.
const DEFAULT_TIMEOUT_MS = 45_000;

interface RunOptions {
  semester?: string;
  stuType?: "ug" | "gs" | "both";
  lessionId?: string;
  timeoutMs?: number;
}

/**
 * Run one tju CLI sub-command and return the parsed data on success, or throw
 * TjuError on failure (login / network / parse / usage errors).
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
      // Inherit process.env so TJU_USER/TJU_PASS and TJU_ENV_FILE are
      // forwarded. Do not set empty strings — that would shadow the fallback
      // that tju_cli.py reads from TJU_ENV_FILE.
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
      // Typically means the Python interpreter was not found.
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

/** Fetch the personal schedule in real time (not cached). Requires campus net / VPN. */
export function fetchSchedule(semester?: string): Promise<TjuScheduleResult> {
  return runTju<TjuScheduleResult>("schedule", { semester });
}

/**
 * Fetch the full public course catalog for a semester (not cached).
 * Crawls multiple pages — several thousand courses — so it is slow.
 * Requires campus network / VPN.
 */
export function fetchCourses(
  semester: string,
  stuType: "ug" | "gs" | "both" = "both",
): Promise<TjuCoursesResult> {
  return runTju<TjuCoursesResult>("courses", {
    semester,
    stuType,
    timeoutMs: 180_000, // full crawl needs generous timeout
  });
}

/** Fetch a course syllabus as Markdown. Requires campus network / VPN. */
export function fetchSyllabus(
  lessionId: string,
): Promise<{ lession_id: string; syllabus: string }> {
  return runTju<{ lession_id: string; syllabus: string }>("syllabus", { lessionId });
}

/** Fetch the current semester's grades. Requires campus network / VPN. */
export function fetchScore(): Promise<TjuScoreResult> {
  return runTju<TjuScoreResult>("score");
}

/** Fetch exam schedule for a semester. Requires campus network / VPN. */
export function fetchExam(semester?: string): Promise<TjuExamResult> {
  return runTju<TjuExamResult>("exam", { semester });
}
