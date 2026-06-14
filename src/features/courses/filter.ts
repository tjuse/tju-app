/**
 * Pure filter / facet / pagination logic for the public course catalog.
 * Called server-side on the in-memory cache; also unit-tested directly.
 */
import type { TjuLibCourse } from "@/lib/tju/types";

export type StuTypeFilter = "all" | "undergraduate" | "graduate";

export type CourseSort = "default" | "credit-desc" | "credit-asc" | "name";

export interface CourseFilters {
  q?: string; // keyword: course name / code / teacher
  stuType?: StuTypeFilter;
  campus?: string; // exact campus match
  courseType?: string; // course_type list must include this value
  weekday?: number; // day of week 1-7 (any matching arrange slot counts)
  hasSyllabus?: boolean; // restrict to courses with a syllabus
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
  total: number; // Total count after filtering
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

/** Apply filters (no pagination). */
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

/** Sort (returns a new array, does not mutate the input). */
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

/** Compute facets for filter dropdowns from the full unfiltered course list. */
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

/** Filter + sort + paginate. */
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
