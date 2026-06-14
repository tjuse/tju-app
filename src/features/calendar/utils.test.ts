import { describe, expect, it } from "vitest";
import type { Semester } from "@/types";
import { daysUntil, getUpcomingEvents, getWeekOfSemester } from "./utils";

const mockSemester: Semester = {
  id: "test-2025-1",
  name: "测试学期",
  startDate: "2025-09-01", // 周一
  endDate: "2026-01-18",
  totalWeeks: 20,
  events: [
    {
      id: "e1",
      title: "国庆节",
      startDate: "2025-10-01",
      endDate: "2025-10-07",
      type: "holiday",
    },
    {
      id: "e2",
      title: "期末考试",
      startDate: "2026-01-05",
      endDate: "2026-01-18",
      type: "exam",
    },
  ],
};

describe("getWeekOfSemester", () => {
  it("第一天返回第 1 周", () => {
    expect(getWeekOfSemester(mockSemester, new Date("2025-09-01"))).toBe(1);
  });

  it("第 8 天返回第 2 周", () => {
    expect(getWeekOfSemester(mockSemester, new Date("2025-09-08"))).toBe(2);
  });

  it("学期开始前返回 null", () => {
    expect(getWeekOfSemester(mockSemester, new Date("2025-08-01"))).toBeNull();
  });

  it("学期结束后返回 null", () => {
    expect(getWeekOfSemester(mockSemester, new Date("2026-02-01"))).toBeNull();
  });
});

describe("getUpcomingEvents", () => {
  it("过滤掉已结束事件并按日期排序", () => {
    const events = getUpcomingEvents(mockSemester, new Date("2025-10-10"));
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("e2");
  });

  it("限制返回数量", () => {
    const events = getUpcomingEvents(mockSemester, new Date("2025-09-01"), 1);
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe("e1");
  });
});

describe("daysUntil", () => {
  it("计算未来天数", () => {
    expect(daysUntil("2025-09-11", new Date("2025-09-01"))).toBe(10);
  });

  it("过去日期返回负数", () => {
    expect(daysUntil("2025-08-22", new Date("2025-09-01"))).toBe(-10);
  });
});
