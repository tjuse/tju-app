/**
 * 把 tju 库返回的课表（TjuCourse[]，每门课可有多段 arrange）
 * 映射为本应用的扁平 Course[]（每段一条，便于 timetable 渲染）。
 */
import type { TjuCourse, TjuScheduleResult } from "@/lib/tju/types";
import type { Course } from "@/types";

/**
 * 解析起止周字符串为周次数组。支持：
 *   "1-16"、"1-16周"、"1-8,10-16"、"1-15单"、"2-16双"
 * 解析失败返回空数组。
 */
export function parseWeeksString(raw: string | null | undefined): number[] {
  if (!raw) return [];
  const weeks = new Set<number>();
  // 判断单双周
  const isOdd = /单/.test(raw);
  const isEven = /双/.test(raw);
  // 提取所有 "a-b" 或单个 "a"
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

/** 稳定 id：课程标识 + 星期 + 起始节 + 段序号 */
function makeId(course: TjuCourse, weekday: number, startSlot: number, idx: number): string {
  const base = course.class_id || course.course_id || course.name || "course";
  return `${base}-${weekday}-${startSlot}-${idx}`;
}

/** 把单门 tju 课程展开为多条 Course（按 arrange）。 */
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
        name: course.name ?? "未知课程",
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

/** 把整张 tju 课表映射为 Course[]。 */
export function mapTjuSchedule(result: TjuScheduleResult): Course[] {
  return result.courses.flatMap((c) => mapTjuCourse(c, result.semester));
}
