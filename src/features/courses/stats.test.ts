import { describe, expect, it } from "vitest";
import type { TjuLibCourse } from "@/lib/tju/types";
import { computeStats } from "./stats";

function mk(p: Partial<TjuLibCourse>): TjuLibCourse {
  return {
    class_id: null,
    course_id: null,
    name: null,
    credit: null,
    campus: null,
    weeks: null,
    teacher: null,
    arrange: null,
    semester: "25262",
    lession_id: null,
    course_type: null,
    teaching_class: null,
    selected: null,
    limit: null,
    extra_limit: null,
    is_extra_open: null,
    hours: null,
    week_hours: null,
    has_syllabus: null,
    student_type: "undergraduate",
    ...p,
  };
}

describe("computeStats", () => {
  const courses = [
    mk({
      student_type: "undergraduate",
      campus: "卫津路校区",
      credit: 3,
      teacher: ["张三"],
      course_type: ["公共基础课"],
      arrange: [{ teacher: null, week: null, unit: [1], weekday: 1, location: null }],
    }),
    mk({
      student_type: "undergraduate",
      campus: "北洋园校区",
      credit: 2,
      teacher: ["张三", "李四"],
      course_type: ["专业核心"],
      arrange: [
        { teacher: null, week: null, unit: [1], weekday: 1, location: null },
        { teacher: null, week: null, unit: [3], weekday: 1, location: null },
      ],
    }),
    mk({
      student_type: "graduate",
      campus: "卫津路校区",
      credit: 3,
      teacher: ["李四"],
      course_type: ["公共基础课"],
      arrange: [{ teacher: null, week: null, unit: [5], weekday: 3, location: null }],
    }),
  ];

  it("总数与本研计数", () => {
    const s = computeStats(courses);
    expect(s.total).toBe(3);
    expect(s.undergraduate).toBe(2);
    expect(s.graduate).toBe(1);
  });

  it("校区分布", () => {
    const s = computeStats(courses);
    expect(s.byCampus.find((x) => x.name === "卫津路校区")?.count).toBe(2);
  });

  it("教师开课数（按教师计次）", () => {
    const s = computeStats(courses);
    expect(s.topTeachers.find((x) => x.name === "张三")?.count).toBe(2);
    expect(s.topTeachers.find((x) => x.name === "李四")?.count).toBe(2);
  });

  it("星期分布按天去重（同一天多段算一次）", () => {
    const s = computeStats(courses);
    expect(s.byWeekday[0].count).toBe(2); // Monday: 2 courses
    expect(s.byWeekday[2].count).toBe(1); // Wednesday: 1 course
  });

  it("学分分布按学分值升序", () => {
    const s = computeStats(courses);
    expect(s.byCredit).toEqual([
      { name: "2学分", count: 1 },
      { name: "3学分", count: 2 },
    ]);
  });
});
