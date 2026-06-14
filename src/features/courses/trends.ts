/**
 * Course offering trend analysis across multiple semesters.
 *
 * Matches "same course" across semesters by course_id (the stable course code
 * that does not change between offerings). lession_id and class_id are
 * per-offering and must NOT be used as cross-semester identifiers.
 */
import type { TjuLibCourse } from "@/lib/tju/types";

export interface SemesterSnapshot {
  /** Semester code, e.g. "25262". */
  semester: string;
  /** Label for display, e.g. "2025-2026 春季学期". */
  label: string;
  courses: TjuLibCourse[];
}

/** Per-semester count data for a chart. */
export interface TrendPoint {
  semester: string;
  label: string;
  count: number;
  undergraduate: number;
  graduate: number;
}

/** Aggregate trend statistics for the whole catalog. */
export interface CatalogTrend {
  /** Total offerings per semester. */
  total: TrendPoint[];
  /** Top-N campuses by average offerings across semesters. */
  topCampuses: string[];
  /** Per-campus offering counts per semester. */
  byCampus: Record<string, TrendPoint[]>;
  /** Top-N course types by average offerings. */
  topCourseTypes: string[];
  /** Per-course-type offering counts per semester. */
  byCourseType: Record<string, TrendPoint[]>;
}

export function computeCatalogTrend(snapshots: SemesterSnapshot[]): CatalogTrend {
  // Sort oldest → newest for readable chart order.
  const sorted = [...snapshots].sort((a, b) => a.semester.localeCompare(b.semester));

  const total: TrendPoint[] = sorted.map((s) => ({
    semester: s.semester,
    label: s.label,
    count: s.courses.length,
    undergraduate: s.courses.filter((c) => c.student_type === "undergraduate").length,
    graduate: s.courses.filter((c) => c.student_type === "graduate").length,
  }));

  // Collect all campus and course-type names across semesters.
  const campusAvg = new Map<string, number>();
  const typeAvg = new Map<string, number>();

  for (const s of sorted) {
    const campusCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    for (const c of s.courses) {
      if (c.campus) campusCounts.set(c.campus, (campusCounts.get(c.campus) ?? 0) + 1);
      for (const t of c.course_type ?? []) {
        typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
      }
    }
    for (const [k, v] of campusCounts) campusAvg.set(k, (campusAvg.get(k) ?? 0) + v);
    for (const [k, v] of typeCounts) typeAvg.set(k, (typeAvg.get(k) ?? 0) + v);
  }

  const topCampuses = [...campusAvg.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const topCourseTypes = [...typeAvg.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  // Build per-campus and per-course-type trend series.
  const byCampus: Record<string, TrendPoint[]> = {};
  for (const campus of topCampuses) {
    byCampus[campus] = sorted.map((s) => ({
      semester: s.semester,
      label: s.label,
      count: s.courses.filter((c) => c.campus === campus).length,
      undergraduate: s.courses.filter(
        (c) => c.campus === campus && c.student_type === "undergraduate",
      ).length,
      graduate: s.courses.filter((c) => c.campus === campus && c.student_type === "graduate")
        .length,
    }));
  }

  const byCourseType: Record<string, TrendPoint[]> = {};
  for (const type of topCourseTypes) {
    byCourseType[type] = sorted.map((s) => ({
      semester: s.semester,
      label: s.label,
      count: s.courses.filter((c) => (c.course_type ?? []).includes(type)).length,
      undergraduate: s.courses.filter(
        (c) => (c.course_type ?? []).includes(type) && c.student_type === "undergraduate",
      ).length,
      graduate: s.courses.filter(
        (c) => (c.course_type ?? []).includes(type) && c.student_type === "graduate",
      ).length,
    }));
  }

  return { total, topCampuses, byCampus, topCourseTypes, byCourseType };
}
