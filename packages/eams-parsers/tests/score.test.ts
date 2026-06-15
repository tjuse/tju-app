/**
 * Parity tests for parseUGScore, parseGSScore, parseExpScore.
 *
 * The expected output is taken from the serialized_*.json files (CLI output).
 * Note: the CLI omits the score summary; we only compare the list entries.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseExpScore, parseGSScore, parseUGScore } from "../src/parsers/score.js";
import type { ExpScoreRecord, GSScoreRecord, UGScoreRecord } from "../src/types.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readHtml(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as T;
}

// ---------------------------------------------------------------------------
// Undergraduate score
// ---------------------------------------------------------------------------

describe("parseUGScore — score_history_ug fixture", () => {
  const html = readHtml("score_history_ug.html");
  const serialized = readJson<{ summary: unknown[]; list: UGScoreRecord[] }>(
    "serialized_score_history_ug.json",
  );
  const expected = serialized.list;
  const result = parseUGScore(html);

  it("returns the same number of records", () => {
    expect(result.length).toBe(expected.length);
  });

  it("semester field matches for every record", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.semester).toBe(expected[i]?.semester);
    }
  });

  it("course_id matches", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.course_id).toBe(expected[i]?.course_id);
    }
  });

  it("credit is a number (float)", () => {
    for (const rec of result) {
      if (rec.credit !== null) expect(typeof rec.credit).toBe("number");
    }
  });

  it("credit values match expected", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.credit).toBe(expected[i]?.credit);
    }
  });

  it("score is a string", () => {
    for (const rec of result) {
      if (rec.score !== null) expect(typeof rec.score).toBe("string");
    }
  });

  it("gpa is a string with Python-style decimal (e.g. '4.0')", () => {
    for (const rec of result) {
      // gpa is always a string; "" means zero/absent (Python falsy → "")
      expect(typeof rec.gpa).toBe("string");
      if (rec.gpa !== "") {
        // Non-empty GPA must contain a decimal point (e.g. "4.0", "3.7")
        expect(rec.gpa).toMatch(/\./);
      }
    }
  });

  it("gpa values match expected", () => {
    for (let i = 0; i < result.length; i++) {
      expect(result[i]?.gpa).toBe(expected[i]?.gpa);
    }
  });

  it("full list matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// Graduate score
// ---------------------------------------------------------------------------

describe("parseGSScore — score_search_gs fixture", () => {
  const html = readHtml("score_search_gs.html");
  const serialized = readJson<{ list: GSScoreRecord[] }>("serialized_score_search_gs.json");
  const expected = serialized.list;
  const result = parseGSScore(html);

  it("returns the same number of records", () => {
    expect(result.length).toBe(expected.length);
  });

  it("is_in_plan is a boolean", () => {
    for (const rec of result) {
      if (rec.is_in_plan !== null) expect(typeof rec.is_in_plan).toBe("boolean");
    }
  });

  it("is_credited is a boolean", () => {
    for (const rec of result) {
      if (rec.is_credited !== null) expect(typeof rec.is_credited).toBe("boolean");
    }
  });

  it("full list matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});

// ---------------------------------------------------------------------------
// Experiment / lab score
// ---------------------------------------------------------------------------

describe("parseExpScore — score_exp fixture", () => {
  const html = readHtml("score_exp.html");
  const expected = readJson<ExpScoreRecord[]>("serialized_score_exp.json");
  const result = parseExpScore(html);

  it("returns the same number of records", () => {
    expect(result.length).toBe(expected.length);
  });

  it("score is a number", () => {
    for (const rec of result) {
      if (rec.score !== null) expect(typeof rec.score).toBe("number");
    }
  });

  it("full output matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});
