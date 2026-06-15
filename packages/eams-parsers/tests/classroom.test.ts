/**
 * Parity tests for parseFreeClassroom.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFreeClassroom } from "../src/parsers/classroom.js";
import type { FreeClassroomEntry } from "../src/types.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readHtml(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as T;
}

describe("parseFreeClassroom — free_classroom_1 fixture", () => {
  const html = readHtml("free_classroom_1.html");
  const expected = readJson<FreeClassroomEntry[]>("serialized_free_classroom_1.json");
  const result = parseFreeClassroom(html);

  it("returns the same number of entries", () => {
    expect(result.length).toBe(expected.length);
  });

  it("each entry has the same keys as expected", () => {
    if (result.length > 0 && expected.length > 0) {
      expect(Object.keys(result[0] ?? {})).toEqual(Object.keys(expected[0] ?? {}));
    }
  });

  it("full output matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});
