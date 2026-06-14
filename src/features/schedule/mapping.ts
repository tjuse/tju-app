/**
 * Map the tju library's schedule (TjuCourse[], each with potentially multiple
 * arrange segments) to the app's flat Course[] (one entry per segment),
 * suitable for timetable rendering.
 */
import type { TjuCourse, TjuScheduleResult } from "@/lib/tju/types";
import type { Course } from "@/types";

/**
 * Parse a week-range string into an array of week numbers. Supports:
 *   "1-16", "1-16周", "1-8,10-16", "1-15单" (odd weeks), "2-16双" (even weeks)
 * Returns [] on parse failure.
 */
export function parseWeeksString(raw: string | null | undefined): number[] {
  if (!raw) return [];
  const weeks = new Set<number>();
  // Detect odd/even-week patterns.
  const isOdd = /单/.test(raw);
  const isEven = /双/.test(raw);
  // Extract all "a-b" or single "a" numeric segments.
  const segments = raw.replace(/[周单双\s]/g, "").split(/[,，]/);
  for (const seg of segments) {
    if (!seg) continue;
    const range = seg.split("-").map((s) => Number.parseInt(s, 10));
    if (range.length === 1 && Number.isFinite(range[0])) {
      weeks.add(range[0]);
    } else if (range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1])) {
      for (let w = range[0]; w <= range[1]; w++) {
        if (isOdd && w % 2 === 0) continue;
        if (isEven && w % 2 === 1) continue;
        weeks.add(w);
      }
    }
  }
  return [...weeks].sort((a, b) => a - b);
}

function joinTeachers(...lists: (string[] | null | undefined)[]): string | null {
  for (const list of lists) {
    if (list && list.length > 0) return list.join("、");
  }
  return null;
}

/** Stable ID: course identifier + weekday + start slot + segment index. */
function makeId(course: TjuCourse, weekday: number, startSlot: number, idx: number): string {
  const base = course.class_id || course.course_id || course.name || "course";
  return `${base}-${weekday}-${startSlot}-${idx}`;
}

/** Expand one tju course into multiple Course entries, one per arrange segment. */
export function mapTjuCourse(course: TjuCourse, semester?: string): Course[] {
  const arranges = course.arrange ?? [];
  if (arranges.length === 0) return [];

  return arranges
    .map((arr, idx) => {
      const units = arr.unit ?? [];
      const weekday = arr.weekday;
      if (weekday == null || units.length === 0) return null;

      const startSlot = units[0];
      const endSlot = units[units.length - 1];
      const weeks =
        arr.week && arr.week.length > 0 ? [...arr.week] : parseWeeksString(course.weeks);

      const mapped: Course = {
        id: makeId(course, weekday, startSlot, idx),
        name: course.name ?? "未命名课程",
        teacher: joinTeachers(arr.teacher, course.teacher),
        location: arr.location ?? null,
        weekday,
        startSlot,
        endSlot,
        weeks,
        source: "tju",
        semester: semester ?? null,
        courseId: course.course_id,
        classId: course.class_id,
        credit: course.credit,
      };
      return mapped;
    })
    .filter((c): c is Course => c !== null);
}

/** Map an entire tju schedule result to a flat Course[]. */
export function mapTjuSchedule(result: TjuScheduleResult): Course[] {
  return result.courses.flatMap((c) => mapTjuCourse(c, result.semester));
}
