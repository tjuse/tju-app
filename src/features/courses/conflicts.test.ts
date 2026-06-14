import { describe, expect, it } from "vitest";
import type { TjuLibCourse } from "@/lib/tju/types";
import { detectConflicts } from "./conflicts";

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

function mkArrange(weekday: number, units: number[], weeks: number[]) {
  return { teacher: null, week: weeks, unit: units, weekday, location: null };
}

describe("detectConflicts", () => {
  it("returns empty for zero or one course", () => {
    expect(detectConflicts([])).toHaveLength(0);
    const c = mk({
      lession_id: "A",
      arrange: [mkArrange(1, [1, 2], [1, 2, 3])],
    });
    expect(detectConflicts([c])).toHaveLength(0);
  });

  it("detects a simple same-weekday same-period conflict", () => {
    const a = mk({
      lession_id: "A",
      weeks: "1-8",
      arrange: [mkArrange(2, [3, 4], [1, 2, 3, 4, 5, 6, 7, 8])],
    });
    const b = mk({
      lession_id: "B",
      weeks: "1-8",
      arrange: [mkArrange(2, [3, 4], [1, 2, 3, 4, 5, 6, 7, 8])],
    });
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictWeeks).toHaveLength(8);
  });

  it("ignores different weekdays", () => {
    const a = mk({
      lession_id: "A",
      arrange: [mkArrange(1, [1, 2], [1, 2, 3])],
    });
    const b = mk({
      lession_id: "B",
      arrange: [mkArrange(2, [1, 2], [1, 2, 3])],
    });
    expect(detectConflicts([a, b])).toHaveLength(0);
  });

  it("ignores non-overlapping time slots on the same day", () => {
    const a = mk({
      lession_id: "A",
      arrange: [mkArrange(3, [1, 2], [1, 2])],
    });
    const b = mk({
      lession_id: "B",
      arrange: [mkArrange(3, [3, 4], [1, 2])],
    });
    expect(detectConflicts([a, b])).toHaveLength(0);
  });

  it("ignores non-overlapping teaching weeks", () => {
    const a = mk({
      lession_id: "A",
      arrange: [mkArrange(1, [1, 2], [1, 2, 3, 4])],
    });
    const b = mk({
      lession_id: "B",
      arrange: [mkArrange(1, [1, 2], [5, 6, 7, 8])],
    });
    expect(detectConflicts([a, b])).toHaveLength(0);
  });

  it("reports only the overlapping weeks in conflictWeeks", () => {
    const a = mk({
      lession_id: "A",
      arrange: [mkArrange(1, [1, 2], [1, 2, 3, 4, 5])],
    });
    const b = mk({
      lession_id: "B",
      arrange: [mkArrange(1, [2, 3], [3, 4, 5, 6, 7])],
    });
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].conflictWeeks).toEqual([3, 4, 5]);
  });

  it("does not report different segments of the same course as a conflict", () => {
    const a = mk({
      lession_id: "A",
      arrange: [
        mkArrange(1, [1, 2], [1, 2, 3]),
        mkArrange(1, [1, 2], [1, 2, 3]), // duplicate slot — same course
      ],
    });
    expect(detectConflicts([a])).toHaveLength(0);
  });

  it("detects partial overlap when periods partially intersect", () => {
    const a = mk({
      lession_id: "A",
      arrange: [mkArrange(4, [1, 2, 3], [1, 2])],
    });
    const b = mk({
      lession_id: "B",
      arrange: [mkArrange(4, [3, 4, 5], [1, 2])],
    });
    // Periods overlap at slot 3.
    const conflicts = detectConflicts([a, b]);
    expect(conflicts).toHaveLength(1);
  });
});
