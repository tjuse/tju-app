/**
 * Public course catalog: server-only. Combines live tju fetching, file caching,
 * and server-side filtering + pagination. One cache file per semester
 * (courses-<semester>.json), keeping large payloads off the client.
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

/** Read the full cached course list for a semester. Returns null on cache miss. */
export async function readCachedCourses(
  semester: string,
): Promise<{ result: TjuCoursesResult; cachedAt: string } | null> {
  const hit = await readCacheWithMeta<TjuCoursesResult>(cacheKey(semester));
  if (!hit) return null;
  return { result: hit.data, cachedAt: hit.cachedAt };
}

/** Live crawl all courses for a semester and write to cache. Requires campus net / VPN. Throws TjuError. */
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

/** Filter + paginate + compute facets from a semester's cache. Returns null on cache miss. */
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
