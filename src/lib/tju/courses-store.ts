/**
 * 公开课程库存取（服务端）。组合 tju 抓取 + 文件缓存 + 服务端过滤分页。
 * 每学期一份缓存：courses-<semester>.json（一学期数千门，避免下发整包给客户端）。
 */
import "server-only";
import {
  type CourseFacets,
  type CourseFilters,
  type CourseQueryResult,
  computeFacets,
  queryCourses,
} from "@/features/courses/filter";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import { fetchCourses } from "./client";
import type { TjuCoursesResult } from "./types";

const cacheKey = (semester: string) => `courses-${semester}`;

export interface CoursesMeta {
  semester: string;
  total: number;
  undergraduate: number;
  graduate: number;
  cachedAt: string;
}

/** 读某学期缓存（全量）。无缓存返回 null。 */
export async function readCachedCourses(
  semester: string,
): Promise<{ result: TjuCoursesResult; cachedAt: string } | null> {
  const hit = await readCacheWithMeta<TjuCoursesResult>(cacheKey(semester));
  if (!hit) return null;
  return { result: hit.data, cachedAt: hit.cachedAt };
}

/** 实时爬取某学期全校课程并写缓存。需校园网/VPN。抛 TjuError。 */
export async function refreshCourses(
  semester: string,
  stuType: "ug" | "gs" | "both" = "both",
): Promise<CoursesMeta> {
  const result = await fetchCourses(semester, stuType);
  await writeCache(cacheKey(semester), result);
  return {
    semester: result.semester,
    total: result.total,
    undergraduate: result.undergraduate,
    graduate: result.graduate,
    cachedAt: new Date().toISOString(),
  };
}

export interface CoursesPage extends CourseQueryResult {
  facets: CourseFacets;
  meta: CoursesMeta;
}

/** 在某学期缓存上做过滤分页 + 分面。无缓存返回 null（提示去抓取）。 */
export async function queryCachedCourses(
  semester: string,
  filters: CourseFilters,
): Promise<CoursesPage | null> {
  const hit = await readCachedCourses(semester);
  if (!hit) return null;
  const { result, cachedAt } = hit;
  const page = queryCourses(result.courses, filters);
  const facets = computeFacets(result.courses);
  return {
    ...page,
    facets,
    meta: {
      semester: result.semester,
      total: result.total,
      undergraduate: result.undergraduate,
      graduate: result.graduate,
      cachedAt,
    },
  };
}
