import { describe, expect, it } from "vitest";
import { currentSemesterCode, isValidSemester, listSemesters, semesterLabel } from "./semesters";

describe("listSemesters", () => {
  it("按时间倒序，最新在前", () => {
    const s = listSemesters(2024, 2025);
    expect(s[0].code).toBe("25262"); // 2025-2026 spring
    expect(s.map((x) => x.code)).toEqual(["25262", "25261", "24252", "24251"]);
  });

  it("code 格式正确（起止年后两位 + 学期）", () => {
    const s = listSemesters(2025, 2025);
    expect(s.find((x) => x.term === 1)?.code).toBe("25261");
    expect(s.find((x) => x.term === 2)?.code).toBe("25262");
  });

  it("label 含学年与季节", () => {
    const fall = listSemesters(2025, 2025).find((x) => x.term === 1);
    expect(fall?.label).toBe("2025-2026 学年 秋季学期");
  });
});

describe("currentSemesterCode", () => {
  it("9月→秋季学期(term1)", () => {
    expect(currentSemesterCode(new Date("2025-09-15"))).toBe("25261");
  });
  it("1月→上学年秋季(term1)", () => {
    expect(currentSemesterCode(new Date("2026-01-10"))).toBe("25261");
  });
  it("6月→上学年春季(term2)", () => {
    expect(currentSemesterCode(new Date("2026-06-14"))).toBe("25262");
  });
  it("3月→春季(term2)", () => {
    expect(currentSemesterCode(new Date("2026-03-01"))).toBe("25262");
  });
});

describe("isValidSemester / semesterLabel", () => {
  it("有效学期", () => {
    expect(isValidSemester("25262")).toBe(true);
  });
  it("无效学期", () => {
    expect(isValidSemester("99999")).toBe(false);
    expect(isValidSemester("")).toBe(false);
  });
  it("未知 code 回退为原值", () => {
    expect(semesterLabel("99999")).toBe("99999");
    expect(semesterLabel("25262")).toContain("2025-2026");
  });
});
