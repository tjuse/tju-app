import { describe, expect, it } from "vitest";
import type { TjuArrange } from "@/lib/tju/types";
import { arrangeLabel } from "./course-card";

function arr(partial: Partial<TjuArrange>): TjuArrange {
  return { teacher: null, week: null, unit: null, weekday: null, location: null, ...partial };
}

describe("arrangeLabel", () => {
  it("连续节次显示区间", () => {
    expect(arrangeLabel(arr({ weekday: 1, unit: [1, 2] }))).toBe("周一 1-2节");
  });

  it("单节次不显示区间", () => {
    expect(arrangeLabel(arr({ weekday: 3, unit: [5] }))).toBe("周三 5节");
  });

  it("缺节次只显示星期", () => {
    expect(arrangeLabel(arr({ weekday: 2, unit: null }))).toBe("周二");
  });

  it("缺星期只显示节次", () => {
    expect(arrangeLabel(arr({ weekday: null, unit: [9, 11] }))).toBe("9-11节");
  });
});
