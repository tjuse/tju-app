/**
 * Tests for parseSyllabus — HTML → Markdown conversion.
 *
 * Guards the two ways turndown diverged from Python's markdownify:
 *   1. <script>/<style> content (e.g. the page toolbar's `window.$BG_LANG`
 *      JS and the `.docpring` style) must be stripped, not emitted as text.
 *   2. <table> must become a GitHub-flavoured pipe table, not collapsed text.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSyllabus } from "../src/parsers/course.js";

const FIXTURES = join(import.meta.dirname, "fixtures");
const html = readFileSync(join(FIXTURES, "syllabus.html"), "utf8");
const md = parseSyllabus(html);

describe("parseSyllabus — syllabus.html fixture", () => {
  it("strips <script> content (no leaked JS)", () => {
    expect(md).not.toContain("$BG_LANG");
    expect(md).not.toContain("bg.ui.toolbar");
    expect(md).not.toContain("require.baseUrl");
  });

  it("strips <style> content", () => {
    expect(md).not.toContain("docpring");
    expect(md).not.toContain("margin: auto");
  });

  it("renders tables as pipe tables", () => {
    expect(md).toMatch(/\|.*\|/);
    expect(md).toContain("| --- |");
  });

  it("keeps the real syllabus heading", () => {
    expect(md).toContain("课程基本信息");
  });
});
