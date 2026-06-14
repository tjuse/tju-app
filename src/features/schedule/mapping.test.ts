import { describe, expect, it } from "vitest";
import type { TjuCourse } from "@/lib/tju/types";
import { mapTjuCourse, parseWeeksString } from "./mapping";

describe("parseWeeksString", () => {
  it("解析连续区间", () => {
    expect(parseWeeksString("1-16")).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
  });

  it("忽略'周'字", () => {
    expect(parseWeeksString("1-4周")).toEqual([1, 2, 3, 4]);
  });

  it("解析单周", () => {
    expect(parseWeeksString("1-8单")).toEqual([1, 3, 5, 7]);
  });

  it("解析双周", () => {
    expect(parseWeeksString("2-8双")).toEqual([2, 4, 6, 8]);
  });

  it("解析多段", () => {
    expect(parseWeeksString("1-4,9-12")).toEqual([1, 2, 3, 4, 9, 10, 11, 12]);
  });

  it("空输入返回空数组", () => {
    expect(parseWeeksString(null)).toEqual([]);
    expect(parseWeeksString("")).toEqual([]);
  });
});

describe("mapTjuCourse", () => {
  const course: TjuCourse = {
    class_id: "C001",
    course_id: "MATH101",
    name: "高等数学",
    credit: 5,
    campus: "卫津路",
    weeks: "1-16",
    teacher: ["张三"],
    arrange: [
      {
        teacher: ["张三"],
        week: [1, 2, 3, 4],
        unit: [1, 2],
        weekday: 1,
        location: "第二教学楼 201",
      },
      {
        teacher: null,
        week: null, // 回退到 course.weeks
        unit: [3, 4],
        weekday: 3,
        location: "第二教学楼 202",
      },
    ],
  };

  it("把多段 arrange 展开为多条 Course", () => {
    const mapped = mapTjuCourse(course, "24251");
    expect(mapped).toHaveLength(2);
  });

  it("正确映射节次与星期", () => {
    const [first, second] = mapTjuCourse(course, "24251");
    expect(first.weekday).toBe(1);
    expect(first.startSlot).toBe(1);
    expect(first.endSlot).toBe(2);
    expect(first.weeks).toEqual([1, 2, 3, 4]);
    expect(first.location).toBe("第二教学楼 201");
    expect(first.teacher).toBe("张三");
    expect(second.weekday).toBe(3);
    // week 为 null 时回退到 course.weeks "1-16"
    expect(second.weeks).toHaveLength(16);
  });

  it("生成稳定且唯一的 id", () => {
    const [first, second] = mapTjuCourse(course, "24251");
    expect(first.id).not.toBe(second.id);
  });

  it("跳过缺 weekday 或 unit 的段", () => {
    const broken: TjuCourse = {
      ...course,
      arrange: [{ teacher: null, week: [1], unit: null, weekday: 2, location: null }],
    };
    expect(mapTjuCourse(broken)).toHaveLength(0);
  });
});
