import { type NextRequest, NextResponse } from "next/server";
import type { CourseSort, StuTypeFilter } from "@/features/courses/filter";
import { isValidSemester } from "@/features/courses/semesters";
import { DEMO_MODE_MESSAGE, isLiveFetchAvailable } from "@/lib/runtime";
import { queryCachedCourses, refreshCourses } from "@/lib/tju/courses-store";
import { TjuError } from "@/lib/tju/types";

export const runtime = "nodejs";
// Keep within Vercel Hobby's 60s limit. Local self-hosted instances have no
// platform cap so long crawls are still fine in practice.
export const maxDuration = 60;

/**
 * GET /api/courses?semester=25262[&q=&stuType=&campus=&courseType=&page=&pageSize=]
 *   → Filter + paginate from the in-memory cache. Returns data:null when no
 *     cache exists for the requested semester (prompts the user to crawl).
 * GET /api/courses?semester=25262&refresh=1[&stuType=ug|gs|both]
 *   → Live crawl the TJU EAMS and write to the cache. Requires campus network /
 *     VPN and valid credentials. Returns 503 in demo / Vercel mode.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const semester = searchParams.get("semester") ?? "";

  if (!isValidSemester(semester)) {
    return NextResponse.json({ error: "无效的学期代码" }, { status: 400 });
  }

  // Live crawl — unavailable in demo / Vercel mode.
  if (searchParams.get("refresh") === "1") {
    if (!isLiveFetchAvailable()) {
      return NextResponse.json({ error: DEMO_MODE_MESSAGE, code: "usage" }, { status: 503 });
    }
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

  // Read from the file cache and apply server-side filters + pagination.
  const stuTypeParam = (searchParams.get("stuType") ?? "all") as StuTypeFilter;
  const sortParam = (searchParams.get("sort") ?? "default") as CourseSort;
  const validSort: CourseSort[] = ["default", "credit-desc", "credit-asc", "name"];
  const weekdayNum = Number(searchParams.get("weekday"));
  const page = await queryCachedCourses(semester, {
    q: searchParams.get("q") ?? undefined,
    stuType: ["all", "undergraduate", "graduate"].includes(stuTypeParam) ? stuTypeParam : "all",
    campus: searchParams.get("campus") ?? undefined,
    courseType: searchParams.get("courseType") ?? undefined,
    weekday: weekdayNum >= 1 && weekdayNum <= 7 ? weekdayNum : undefined,
    hasSyllabus: searchParams.get("hasSyllabus") === "1" || undefined,
    sort: validSort.includes(sortParam) ? sortParam : "default",
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 30,
  });

  return NextResponse.json({ data: page });
}
