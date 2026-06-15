/**
 * Parity tests for parseProfile.
 * Tests against parsed_profile_ug.json (raw Chinese-keyed output).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseProfile } from "../src/parsers/profile.js";
import type { ProfileResult } from "../src/types.js";

const FIXTURES = join(import.meta.dirname, "fixtures");

function readHtml(name: string) {
  return readFileSync(join(FIXTURES, name), "utf8");
}

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(join(FIXTURES, name), "utf8")) as T;
}

describe("parseProfile — profile_ug fixture", () => {
  const html = readHtml("profile_ug.html");
  const expected = readJson<ProfileResult>("parsed_profile_ug.json");
  const result = parseProfile(html);

  it("contains the expected number of fields", () => {
    expect(Object.keys(result).length).toBe(Object.keys(expected).length);
  });

  it("学号 (student ID) matches expected", () => {
    expect(result.学号).toBe(expected.学号);
  });

  it("姓名 (name) matches expected", () => {
    expect(result.姓名).toBe(expected.姓名);
  });

  it("full output matches expected JSON", () => {
    expect(result).toEqual(expected);
  });
});
