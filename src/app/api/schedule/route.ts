import { type NextRequest, NextResponse } from "next/server";
import { DEMO_MODE_MESSAGE, isLiveFetchAvailable } from "@/lib/runtime";
import { readCachedSchedule, refreshSchedule } from "@/lib/tju/schedule-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
// TJU login + crawl can be slow; 60s is the Vercel Hobby ceiling.
export const maxDuration = 60;

/**
 * GET /api/schedule           → Return cached personal schedule (null if none).
 * GET /api/schedule?refresh=1 → Live crawl from EAMS and refresh the cache.
 *   Requires campus network / VPN. Returns 503 in demo / Vercel mode.
 *   Optional: ?semester=24251
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "1";
  const semester = searchParams.get("semester") ?? undefined;

  if (!refresh) {
    const cached = await readCachedSchedule();
    return NextResponse.json({ data: cached });
  }

  if (!isLiveFetchAvailable()) {
    return NextResponse.json({ error: DEMO_MODE_MESSAGE, code: "usage" }, { status: 503 });
  }

  try {
    const data = await refreshSchedule(semester);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TjuError) {
      const status = err.code === "login" ? 401 : err.code === "usage" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[schedule] unexpected:", err);
    return NextResponse.json({ error: "课表抓取失败" }, { status: 500 });
  }
}
