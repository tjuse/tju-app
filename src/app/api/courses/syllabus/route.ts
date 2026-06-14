import { type NextRequest, NextResponse } from "next/server";
import { getSyllabus } from "@/lib/tju/syllabus-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * GET /api/courses/syllabus?lessionId=465329
 * 返回课程大纲 markdown（缓存优先，未命中则抓取）。需校园网/VPN。
 */
export async function GET(req: NextRequest) {
  const lessionId = new URL(req.url).searchParams.get("lessionId");
  if (!lessionId || !/^\d+$/.test(lessionId)) {
    return NextResponse.json({ error: "缺少有效的 lessionId" }, { status: 400 });
  }
  try {
    const data = await getSyllabus(lessionId);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof TjuError) {
      const status = err.code === "login" ? 401 : err.code === "usage" ? 503 : 502;
      return NextResponse.json({ error: err.message, code: err.code }, { status });
    }
    console.error("[syllabus] unexpected:", err);
    return NextResponse.json({ error: "大纲获取失败" }, { status: 500 });
  }
}
