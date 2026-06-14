import { type NextRequest, NextResponse } from "next/server";
import { readCachedSchedule, refreshSchedule } from "@/lib/tju/schedule-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
// tju 登录+抓取较慢
export const maxDuration = 60;

/**
 * GET /api/schedule           → 返回缓存课表（无缓存返回 null）
 * GET /api/schedule?refresh=1 → 实时抓取并刷新缓存（需校园网/VPN）
 *   可选 ?semester=24251
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "1";
  const semester = searchParams.get("semester") ?? undefined;

  if (!refresh) {
    const cached = await readCachedSchedule();
    return NextResponse.json({ data: cached });
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
