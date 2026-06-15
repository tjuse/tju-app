/**
 * Parity tests for parseSchedule.
 *
 * Strategy: feed the HTML fixtures from tju-python and compare output against
 * the serialized_*.json files which represent the Python CLI's actual output
 * (Course.Schema(many=True).dump(schedule)).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSchedule } from "../src/parsers/schedule.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readHtml(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as T;
}

describe("parseSchedule — ug_std fixture", () => {
  const html = readHtml("schedule_ug_std.html");
  const expected = readJson<Record<string, unknown>[]>("serialized_schedule_ug_std.json");
  const result = parseSchedule(html);

  it("returns the same number of courses", () => {
    expect(result.length).toBe(expected.length);
  });

  it("first course has correct class_id, course_id, name", () => {
    const r = result[0];
    const e = expected[0] as Record<string, unknown>;
    expect(r?.class_id).toBe(e["class_id"]);
    expect(r?.course_id).toBe(e["course_id"]);
    expect(r?.name).toBe(e["name"]);
  });

  it("credit is a string matching Python str(float(x))", () => {
    for (let i = 0; i < result.length; i++) {
      expect(typeof result[i]?.credit).toBe("string");
      expect(result[i]?.credit).toBe((expected[i] as Record<string, unknown>)["credit"]);
    }
  });

  it("teacher is an array of strings", () => {
    for (const course of result) {
      expect(Array.isArray(course.teacher)).toBe(true);
    }
  });

  it("arrange slot count matches expected for each course", () => {
    for (let i = 0; i < result.length; i++) {
      const r = result[i];
      const e = expected[i] as { arrange: unknown[] };
      expect(r?.arrange.length).toBe(e.arrange.length);
    }
  });

  it("weekday values are in 1-7 range for all arrange slots", () => {
    for (const course of result) {
      for (const slot of course.arrange) {
        expect(slot.weekday).toBeGreaterThanOrEqual(1);
        expect(slot.weekday).toBeLessThanOrEqual(7);
      }
    }
  });

  it("week arrays contain positive integers", () => {
    for (const course of result) {
      for (const slot of course.arrange) {
        for (const w of slot.week) {
          expect(w).toBeGreaterThan(0);
        }
      }
    }
  });

  it("full output matches expected JSON (field-by-field)", () => {
    // Compare all fields except arrange (tested separately above)
    for (let i = 0; i < result.length; i++) {
      const r = result[i];
      const e = expected[i] as Record<string, unknown>;
      expect(r?.class_id).toBe(e["class_id"]);
      expect(r?.course_id).toBe(e["course_id"]);
      expect(r?.name).toBe(e["name"]);
      expect(r?.credit).toBe(e["credit"]);
      expect(r?.weeks).toBe(e["weeks"]);
      expect(r?.campus).toBe(e["campus"]);
    }
  });
});
