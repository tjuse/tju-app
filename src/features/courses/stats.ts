/**
 * Aggregate statistics for the public course catalog.
 * Pure functions — computed server-side on the cached course list; also unit-tested.
 */
import type { TjuLibCourse } from "@/lib/tju/types";

export interface NameCount {
  name: string;
  count: number;
}

export interface CourseStats {
  total: number;
  undergraduate: number;
  graduate: number;
  byCampus: NameCount[];
  byCourseType: NameCount[]; // top N + "其他"
  byCredit: NameCount[]; // bucketed by credit value
  byWeekday: NameCount[]; // Mon … Sun
  topTeachers: NameCount[]; // teachers with the most offerings
}

const WEEKDAY = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function topN(map: Map<string, number>, n: number, withOther = false): NameCount[] {
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, n).map(([name, count]) => ({ name, count }));
  if (withOther && sorted.length > n) {
    const other = sorted.slice(n).reduce((s, [, c]) => s + c, 0);
    if (other > 0) top.push({ name: "其他", count: other });
  }
  return top;
}

export function computeStats(courses: TjuLibCourse[]): CourseStats {
  const campus = new Map<string, number>();
  const ctype = new Map<string, number>();
  const credit = new Map<string, number>();
  const teacher = new Map<string, number>();
  const weekday = new Array(7).fill(0);
  let ug = 0;
  let gs = 0;

  for (const c of courses) {
    if (c.student_type === "undergraduate") ug++;
    else if (c.student_type === "graduate") gs++;

    if (c.campus) campus.set(c.campus, (campus.get(c.campus) ?? 0) + 1);

    for (const t of c.course_type ?? []) ctype.set(t, (ctype.get(t) ?? 0) + 1);

    if (c.credit != null) {
      const key = String(c.credit);
      credit.set(key, (credit.get(key) ?? 0) + 1);
    }

    for (const t of c.teacher ?? []) {
      const name = t.trim();
      if (name) teacher.set(name, (teacher.get(name) ?? 0) + 1);
    }

    // Count each course on a given weekday at most once (de-dup by day).
    const days = new Set<number>();
    for (const a of c.arrange ?? []) {
      if (a.weekday && a.weekday >= 1 && a.weekday <= 7) days.add(a.weekday);
    }
    for (const d of days) weekday[d - 1]++;
  }

  return {
    total: courses.length,
    undergraduate: ug,
    graduate: gs,
    byCampus: topN(campus, 8),
    byCourseType: topN(ctype, 10, true),
    byCredit: [...credit.entries()]
      .map(([name, count]) => ({ name, count, sortKey: Number(name) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ name, count }) => ({ name: `${name}学分`, count })),
    byWeekday: weekday.map((count, i) => ({ name: WEEKDAY[i], count })),
    topTeachers: topN(teacher, 10),
  };
}
