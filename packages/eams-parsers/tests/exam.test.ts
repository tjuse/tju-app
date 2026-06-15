/**
 * Parity tests for parseExamBatchId and parseExam.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseExam, parseExamBatchId } from "../src/parsers/exam.js";
import type { ExamEntry } from "../src/types.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readHtml(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as T;
}

describe("parseExamBatchId", () => {
  it("extracts a numeric batch ID from the POST response HTML", () => {
    const html = readHtml("exam_post.html");
    const id = parseExamBatchId(html);
    expect(id).toMatch(/^\d+$/);
    expect(Number.parseInt(id, 10)).toBeGreaterThan(0);
  });
});

describe("parseExam — exam fixture", () => {
  const html = readHtml("exam.html");
  const expected = readJson<ExamEntry[]>("serialized_exam.json");
  const result = parseExam(html);

  it("returns the same number of exam entries", () => {
    expect(result.length).toBe(expected.length);
  });

  it("class_id matches expected for every entry", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.class_id).toBe(expected[i]?.class_id);
    }
  });

  it("name matches expected", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.name).toBe(expected[i]?.name);
    }
  });

  it("exam_date is a YYYY-MM-DD string", () => {
    for (const entry of result) {
      if (entry.exam_date !== null) {
        expect(entry.exam_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("exam_time is split into [start, end] strings", () => {
    for (const entry of result) {
      if (entry.exam_time !== null) {
        expect(Array.isArray(entry.exam_time)).toBe(true);
        expect(entry.exam_time).toHaveLength(2);
        expect(entry.exam_time[0]).toMatch(/^\d{2}:\d{2}$/);
        expect(entry.exam_time[1]).toMatch(/^\d{2}:\d{2}$/);
      }
    }
  });

  it("exam_time matches expected split", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.exam_time).toEqual(expected[i]?.exam_time);
    }
  });

  it("full output matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});
