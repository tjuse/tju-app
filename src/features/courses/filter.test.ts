import { describe, expect, it } from "vitest";
import type { TjuLibCourse } from "@/lib/tju/types";
import { computeFacets, filterCourses, queryCourses, sortCourses } from "./filter";

function mk(partial: Partial<TjuLibCourse>): TjuLibCourse {
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
    ...partial,
  };
}

const courses: TjuLibCourse[] = [
  mk({
    course_id: "MATH101",
    name: "高等数学",
    teacher: ["张三"],
    campus: "卫津路校区",
    course_type: ["公共基础课"],
    student_type: "undergraduate",
  }),
  mk({
    course_id: "S131G006",
    name: "新时代中国特色社会主义",
    teacher: ["吴兆彤"],
    campus: "卫津路校区",
    course_type: ["公共基础课"],
    student_type: "graduate",
  }),
  mk({
    course_id: "CS201",
    name: "数据结构",
    teacher: ["李四"],
    campus: "北洋园校区",
    course_type: ["专业核心课程"],
    student_type: "undergraduate",
  }),
];

describe("filterCourses", () => {
  it("按关键词匹配课程名", () => {
    expect(filterCourses(courses, { q: "数学" })).toHaveLength(1);
  });

  it("按课程代码匹配（不区分大小写）", () => {
    expect(filterCourses(courses, { q: "cs201" })).toHaveLength(1);
  });

  it("按教师匹配", () => {
    expect(filterCourses(courses, { q: "李四" })[0].course_id).toBe("CS201");
  });

  it("按学生类型过滤", () => {
    expect(filterCourses(courses, { stuType: "graduate" })).toHaveLength(1);
  });

  it("按校区过滤", () => {
    expect(filterCourses(courses, { campus: "北洋园校区" })).toHaveLength(1);
  });

  it("按课程类别过滤", () => {
    expect(filterCourses(courses, { courseType: "专业核心课程" })).toHaveLength(1);
  });

  it("组合过滤", () => {
    expect(filterCourses(courses, { stuType: "undergraduate", campus: "卫津路校区" })).toHaveLength(
      1,
    );
  });

  it("按是否有大纲过滤", () => {
    const list = [
      mk({ has_syllabus: true }),
      mk({ has_syllabus: false }),
      mk({ has_syllabus: null }),
    ];
    expect(filterCourses(list, { hasSyllabus: true })).toHaveLength(1);
  });

  it("按上课星期过滤（任一安排命中）", () => {
    const list = [
      mk({ arrange: [{ teacher: null, week: null, unit: [1], weekday: 1, location: null }] }),
      mk({ arrange: [{ teacher: null, week: null, unit: [1], weekday: 3, location: null }] }),
    ];
    expect(filterCourses(list, { weekday: 1 })).toHaveLength(1);
  });
});

describe("sortCourses", () => {
  const list = [
    mk({ name: "B", credit: 2 }),
    mk({ name: "A", credit: 5 }),
    mk({ name: "C", credit: 1 }),
  ];

  it("default 不改变顺序", () => {
    expect(sortCourses(list, "default").map((c) => c.name)).toEqual(["B", "A", "C"]);
  });
  it("学分降序", () => {
    expect(sortCourses(list, "credit-desc").map((c) => c.credit)).toEqual([5, 2, 1]);
  });
  it("学分升序", () => {
    expect(sortCourses(list, "credit-asc").map((c) => c.credit)).toEqual([1, 2, 5]);
  });
  it("按课程名", () => {
    expect(sortCourses(list, "name").map((c) => c.name)).toEqual(["A", "B", "C"]);
  });
  it("不修改原数组", () => {
    sortCourses(list, "credit-desc");
    expect(list.map((c) => c.name)).toEqual(["B", "A", "C"]);
  });
});

describe("computeFacets", () => {
  it("汇总校区/类别/本研计数", () => {
    const f = computeFacets(courses);
    expect(f.campuses).toEqual(["北洋园校区", "卫津路校区"]);
    expect(f.courseTypes).toEqual(["专业核心课程", "公共基础课"]);
    expect(f.undergraduate).toBe(2);
    expect(f.graduate).toBe(1);
  });
});

describe("queryCourses", () => {
  it("分页返回正确总数与切片", () => {
    const r = queryCourses(courses, { page: 1, pageSize: 2 });
    expect(r.total).toBe(3);
    expect(r.items).toHaveLength(2);
    expect(r.page).toBe(1);
  });

  it("第二页返回剩余", () => {
    const r = queryCourses(courses, { page: 2, pageSize: 2 });
    expect(r.items).toHaveLength(1);
  });
});
