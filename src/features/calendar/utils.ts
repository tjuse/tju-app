import { differenceInCalendarDays } from "date-fns";
import type { AcademicCalendarEvent, Semester } from "@/types";

/**
 * 计算给定日期是学期第几周（1-based）。超出学期范围返回 null。
 */
export function getWeekOfSemester(semester: Semester, now: Date = new Date()): number | null {
  const start = new Date(semester.startDate);
  const end = new Date(semester.endDate);
  if (now < start || now > end) return null;
  const days = differenceInCalendarDays(now, start);
  return Math.floor(days / 7) + 1;
}

/**
 * 获取即将到来的校历事件（按开始日期排序，取最近 N 个）。
 */
export function getUpcomingEvents(
  semester: Semester,
  now: Date = new Date(),
  limit = 3,
): AcademicCalendarEvent[] {
  return semester.events
    .filter((e) => new Date(e.endDate) >= now)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit);
}

/**
 * 距离某事件还有几天（负数表示已开始）。
 */
export function daysUntil(dateStr: string, now: Date = new Date()): number {
  return differenceInCalendarDays(new Date(dateStr), now);
}

const EVENT_TYPE_LABEL: Record<AcademicCalendarEvent["type"], string> = {
  holiday: "假期",
  exam: "考试",
  holiday_break: "假期",
  important: "重要",
  semester_start: "开学",
  semester_end: "学期结束",
};

export function eventTypeLabel(type: AcademicCalendarEvent["type"]): string {
  return EVENT_TYPE_LABEL[type] ?? "事件";
}
