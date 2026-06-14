/**
 * 公开课程库的纯过滤/分面/分页逻辑（服务端在缓存上调用，便于测试）。
 */
import type { TjuLibCourse } from "@/lib/tju/types";

export type StuTypeFilter = "all" | "undergraduate" | "graduate";

export type CourseSort = "default" | "credit-desc" | "credit-asc" | "name";

export interface CourseFilters {
  q?: string; // 关键词：课程名 / 课程代码 / 教师
  stuType?: StuTypeFilter;
  campus?: string; // 精确匹配校区
  courseType?: string; // 课程类别（course_type 列表含此项）
  weekday?: number; // 上课星期 1-7（任一 arrange 命中）
  hasSyllabus?: boolean; // 仅含有大纲
  sort?: CourseSort;
  page?: number; // 1-based
  pageSize?: number;
}

export interface CourseFacets {
  campuses: string[];
  courseTypes: string[];
  undergraduate: number;
  graduate: number;
}

export interface CourseQueryResult {
  items: TjuLibCourse[];
  total: number; // 过滤后总数
  page: number;
  pageSize: number;
}

function matchesQuery(course: TjuLibCourse, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const haystacks = [
    course.name,
    course.course_id,
    course.class_id,
    ...(course.teacher ?? []),
    ...(course.teaching_class ?? []),
  ];
  return haystacks.some((h) => h?.toLowerCase().includes(needle));
}

/** 应用过滤（不分页）。 */
export function filterCourses(courses: TjuLibCourse[], filters: CourseFilters): TjuLibCourse[] {
  const { q, stuType = "all", campus, courseType, weekday, hasSyllabus } = filters;
  return courses.filter((c) => {
    if (stuType !== "all" && c.student_type !== stuType) return false;
    if (campus && c.campus !== campus) return false;
    if (courseType && !(c.course_type ?? []).includes(courseType)) return false;
    if (hasSyllabus && !c.has_syllabus) return false;
    if (weekday && !(c.arrange ?? []).some((a) => a.weekday === weekday)) return false;
    if (q && !matchesQuery(c, q)) return false;
    return true;
  });
}

/** 排序（返回新数组，不改原数组）。 */
export function sortCourses(courses: TjuLibCourse[], sort: CourseSort = "default"): TjuLibCourse[] {
  if (sort === "default") return courses;
  const sorted = [...courses];
  if (sort === "name") {
    sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "zh"));
  } else {
    const dir = sort === "credit-desc" ? -1 : 1;
    sorted.sort((a, b) => ((a.credit ?? 0) - (b.credit ?? 0)) * dir);
  }
  return sorted;
}

/** 计算分面（用于筛选下拉），基于全量课程。 */
export function computeFacets(courses: TjuLibCourse[]): CourseFacets {
  const campuses = new Set<string>();
  const courseTypes = new Set<string>();
  let ug = 0;
  let gs = 0;
  for (const c of courses) {
    if (c.campus) campuses.add(c.campus);
    for (const t of c.course_type ?? []) courseTypes.add(t);
    if (c.student_type === "undergraduate") ug++;
    else if (c.student_type === "graduate") gs++;
  }
  return {
    campuses: [...campuses].sort(),
    courseTypes: [...courseTypes].sort(),
    undergraduate: ug,
    graduate: gs,
  };
}

/** 过滤 + 排序 + 分页。 */
export function queryCourses(courses: TjuLibCourse[], filters: CourseFilters): CourseQueryResult {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 30));
  const filtered = sortCourses(filterCourses(courses, filters), filters.sort);
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}
