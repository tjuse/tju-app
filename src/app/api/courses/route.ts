import { type NextRequest, NextResponse } from "next/server";
import type { StuTypeFilter } from "@/features/courses/filter";
import { isValidSemester } from "@/features/courses/semesters";
import { queryCachedCourses, refreshCourses } from "@/lib/tju/courses-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
export const maxDuration = 300; // 全量爬取可能较久（自托管无硬限制）

/**
 * GET /api/courses?semester=25262[&q=&stuType=&campus=&courseType=&page=&pageSize=]
 *   → 在缓存上过滤分页返回（无缓存返回 data:null，提示去抓取）
 * GET /api/courses?semester=25262&refresh=1[&stuType=ug|gs|both]
 *   → 实时全量爬取并写缓存（需校园网/VPN），返回 meta
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") ?? "";

  if (!isValidSemester(semester)) {
    return NextResponse.json({ error: "无效的学期代码" }, { status: 400 });
  }

  // 刷新（抓取）
  if (searchParams.get("refresh") === "1") {
    const stuTypeRaw = searchParams.get("stuType");
    const crawl =
      stuTypeRaw === "ug" || stuTypeRaw === "gs" || stuTypeRaw === "both" ? stuTypeRaw : "both";
    try {
      const meta = await refreshCourses(semester, crawl);
      return NextResponse.json({ data: { meta } });
    } catch (err) {
      if (err instanceof TjuError) {
        const status = err.code === "login" ? 401 : err.code === "usage" ? 503 : 502;
        return NextResponse.json({ error: err.message, code: err.code }, { status });
      }
      console.error("[courses] unexpected:", err);
      return NextResponse.json({ error: "课程库抓取失败" }, { status: 500 });
    }
  }

  // 查询缓存
  const stuTypeParam = (searchParams.get("stuType") ?? "all") as StuTypeFilter;
  const page = await queryCachedCourses(semester, {
    q: searchParams.get("q") ?? undefined,
    stuType: ["all", "undergraduate", "graduate"].includes(stuTypeParam) ? stuTypeParam : "all",
    campus: searchParams.get("campus") ?? undefined,
    courseType: searchParams.get("courseType") ?? undefined,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 30,
  });

  return NextResponse.json({ data: page });
}
