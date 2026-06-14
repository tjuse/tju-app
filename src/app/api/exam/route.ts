import { type NextRequest, NextResponse } from "next/server";
import { isValidSemester } from "@/features/courses/semesters";
import { readCachedExam, refreshExam } from "@/lib/tju/exam-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/exam?semester=25262           → Return cached exam schedule (null if none).
 * GET /api/exam?semester=25262&refresh=1 → Live fetch from EAMS and refresh cache.
 *   Returns 503 in demo / Vercel mode.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") ?? "";
  const refresh = searchParams.get("refresh") === "1";

  if (semester && !isValidSemester(semester)) {
    return NextResponse.json({ error: "无效的学期代码" }, { status: 400 });
  }

  if (!refresh) {
    const cached = semester ? await readCachedExam(semester) : null;
    return NextResponse.json({ data: cached });
  }

  try {
    const data = await refreshExam(semester || undefined);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TjuError) {
      const status = err.code === "login" ? 401 : err.code === "usage" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[exam] unexpected:", err);
    return NextResponse.json({ error: "考试获取失败" }, { status: 500 });
  }
}
