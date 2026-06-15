import type { Semester } from "@/types";

/**
 * 天津大学校历数据（静态）。
 * Phase 1 用静态数据驱动；后续可接官方源或后台维护。
 * 注：日期为示意值，实际应以学校发布的校历为准，需每学期更新。
 */
export const semesters: Semester[] = [
  {
    id: "2025-2026-1",
    name: "2025-2026 学年 秋季学期",
    startDate: "2025-09-01",
    endDate: "2026-01-18",
    totalWeeks: 20,
    events: [
      {
        id: "f25-start",
        title: "秋季学期开学",
        startDate: "2025-09-01",
        endDate: "2025-09-01",
        type: "semester_start",
      },
      {
        id: "f25-national",
        title: "国庆节",
        startDate: "2025-10-01",
        endDate: "2025-10-07",
        type: "holiday",
      },
      {
        id: "f25-finals",
        title: "期末考试周",
        startDate: "2026-01-05",
        endDate: "2026-01-18",
        type: "exam",
      },
      {
        id: "f25-winter",
        title: "寒假",
        startDate: "2026-01-19",
        endDate: "2026-02-22",
        type: "holiday_break",
      },
    ],
  },
  {
    id: "2025-2026-2",
    name: "2025-2026 学年 春季学期",
    startDate: "2026-03-09",
    endDate: "2026-07-12",
    totalWeeks: 18,
    events: [
      {
        id: "s26-start",
        title: "春季学期开学",
        startDate: "2026-03-09",
        endDate: "2026-03-09",
        type: "semester_start",
      },
      {
        id: "s26-qingming",
        title: "清明节",
        startDate: "2026-04-04",
        endDate: "2026-04-06",
        type: "holiday",
      },
      {
        id: "s26-labor",
        title: "劳动节",
        startDate: "2026-05-01",
        endDate: "2026-05-05",
        type: "holiday",
      },
      {
        id: "s26-dragon",
        title: "端午节",
        startDate: "2026-06-19",
        endDate: "2026-06-21",
        type: "holiday",
      },
      {
        id: "s26-finals",
        title: "期末考试周",
        startDate: "2026-06-29",
        endDate: "2026-07-12",
        type: "exam",
      },
      {
        id: "s26-summer",
        title: "暑假",
        startDate: "2026-07-13",
        endDate: "2026-08-30",
        type: "holiday_break",
      },
    ],
  },
];

/**
 * 根据当前日期判断所处学期。找不到则返回最近的一个。
 */
export function getCurrentSemester(now: Date = new Date()): Semester {
  const found = semesters.find((s) => {
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return now >= start && now <= end;
  });
  return found ?? semesters[semesters.length - 1];
}
