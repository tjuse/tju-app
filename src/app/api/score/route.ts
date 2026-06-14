import { type NextRequest, NextResponse } from "next/server";
import { readCachedScore, refreshScore } from "@/lib/tju/score-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/score           → Return cached grade history (null if none).
 * GET /api/score?refresh=1 → Live fetch from EAMS and refresh cache.
 *   Returns 503 in demo / Vercel mode.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "1";

  if (!refresh) {
    const cached = await readCachedScore();
    return NextResponse.json({ data: cached });
  }

  try {
    const data = await refreshScore();
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TjuError) {
      const status = err.code === "login" ? 401 : err.code === "usage" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[score] unexpected:", err);
    return NextResponse.json({ error: "成绩获取失败" }, { status: 500 });
  }
}
