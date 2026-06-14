import { getTodayWeekday, slotToTime } from "@/lib/utils";
import type { Course, CourseWithTime } from "@/types";

/** 过滤出某周、某天的课程，补上时间字符串并按节次排序。 */
export function getCoursesForDay(
  courses: Course[],
  week: number,
  weekday: number,
): CourseWithTime[] {
  return courses
    .filter((c) => c.weekday === weekday && c.weeks.includes(week))
    .sort((a, b) => a.startSlot - b.startSlot)
    .map((c) => ({
      ...c,
      startTime: slotToTime(c.startSlot).start,
      endTime: slotToTime(c.endSlot).end,
    }));
}

/** 今日课程（当前周 + 今天）。 */
export function getTodayCourses(courses: Course[], week: number): CourseWithTime[] {
  return getCoursesForDay(courses, week, getTodayWeekday());
}
