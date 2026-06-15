/**
 * HTML parsers for the public course library, course detail, and syllabus pages.
 * Ported from tju-python/src/tju/parser/course.py + models/course.py
 */

import TurndownService from "turndown";
import { CHINESE_WEEKDAY } from "../consts.js";
import type { CourseArrangeRaw, CourseEntry, CourseInfo, CoursePageResult } from "../types.js";

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ParseError";
  }
}

// ---------------------------------------------------------------------------
// _parse_week — convert EAMS week-string to sorted array of week numbers
// ---------------------------------------------------------------------------

function parseWeek(html: string): number[] {
  const chunks = html.includes(",") ? html.split(",") : [html];
  const result: number[] = [];

  for (const chunk of chunks) {
    const cleaned = chunk.trim();
    if (cleaned.includes("-")) {
      const isOdd = cleaned.includes("单");
      const isEven = cleaned.includes("双");
      const stripped = cleaned.replace("[", "").replace("]", "").replace("单", "").replace("双", "").trim();
      const parts = stripped.split("-").map((s) => Number.parseInt(s.trim(), 10));
      const from = parts[0] ?? 0;
      const to = parts[1] ?? 0;
      for (let w = from; w <= to; w++) {
        if (isOdd && w % 2 === 0) continue;
        if (isEven && w % 2 === 1) continue;
        result.push(w);
      }
    } else {
      const n = Number.parseInt(cleaned, 10);
      if (!Number.isNaN(n)) result.push(n);
    }
  }

  return result.sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// _parse_arrange — parse the per-course timetable snippet
// ---------------------------------------------------------------------------

function parseArrange(html: string): CourseArrangeRaw[] {
  const result: CourseArrangeRaw[] = [];
  const lines = html.trim().split("<br>");

  for (const rawLine of lines) {
    const line = rawLine.trim() + " "; // trailing space ensures location capture
    if (line.trim() === "") continue;

    // Pattern: "teacher 星期X  1-2  location  ..."
    const m = /(.*)\s*星期(\S*)\s+(\d+)-(\d+)\s+(\S*)\s+(\S*)/.exec(line);
    if (!m) continue;

    const [, teacherRaw, weekdayChar, startStr, endStr, weekStr, location] = m;
    const teacherStr = (teacherRaw ?? "").trim();
    const teachers = teacherStr ? teacherStr.split(",") : [];
    const weekday = CHINESE_WEEKDAY[weekdayChar ?? ""] ?? 0;
    const start = Number.parseInt(startStr ?? "0", 10);
    const end = Number.parseInt(endStr ?? "0", 10);
    const unit = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const week = parseWeek(weekStr ?? "");

    result.push({
      teacher: teachers,
      weekday,
      unit,
      week,
      location: (location ?? "").trim(),
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// parse_course
// ---------------------------------------------------------------------------

/** Parse Chinese boolean "是" → true, "否"/""/undefined → false/null. */
function parseBool(raw: string | undefined): boolean | null {
  if (!raw) return null;
  return raw === "是";
}

/** Parse Chinese has-bool "有" → true, "无"/"" → false/null. */
function parseHasBool(raw: string | undefined): boolean | null {
  if (!raw) return null;
  return raw === "有";
}

/**
 * Parse one page of the public course library search results.
 *
 * Handles both the 16-column (UG) and 12-column (GS) EAMS table variants
 * dynamically, matching the approach in tju-python/src/tju/parser/course.py.
 *
 * @param html     Full HTML of the search-results page.
 * @param semester Semester code, e.g. "24251" — stored on every returned entry.
 */
export function parseCourse(html: string, semester: string): CoursePageResult {
  // ── Extract lession_id → arrange HTML map ─────────────────────────────────
  const arrangeMap = new Map<string, string>();
  for (const m of html.matchAll(/contents\['(.*)'\]='(.*)'/g)) {
    arrangeMap.set(m[1] ?? "", m[2] ?? "");
  }

  // ── Split on the header sentinel ──────────────────────────────────────────
  const headerIdx = html.indexOf('<th  class="gridselect-top" >');
  if (headerIdx === -1) throw new ParseError("Cannot find course table header");

  const afterHeader = html.slice(headerIdx + '<th  class="gridselect-top" >'.length);
  const [keysAndContent, ...tail] = afterHeader.split("</thead>");
  const keysRaw = [...(keysAndContent ?? "").matchAll(/<th\s*[class]*.*?>(.*?)<\/th>/g)];
  const keys = ["lession_id", ...keysRaw.map((m) => (m[1] ?? "").trim())];
  const afterHead = tail.join("</thead>");
  const contentAndTail = afterHead.split("</table>");

  let content = contentAndTail[0] ?? "";
  // Fix ",\n" fragments and <sup> annotations
  content = content.replace(/,\n/g, ",");
  content = content.replace(
    />(\S+)<\/a>\s*<sup.*?>(\S+)<\/sup>\s/g,
    (_m, main, sup) => `>${main} ${sup}</a>`,
  );

  // ── Build dynamic row regex (12 or 16 columns) ───────────────────────────
  const nData = keys.length - 1; // number of data TDs per row
  const rowPattern = new RegExp(
    "<tr>\\s*<td[^>]*>" +
      '<input[^>]*\\bvalue="(\\d+)"[^>]*/>' +
      "</td>" +
      "<td[^>]*>([\\s\\S]*?)</td>".repeat(nData),
    "g",
  );

  const result: CourseEntry[] = [];

  for (const rowMatch of content.matchAll(rowPattern)) {
    const item: Partial<CourseEntry> & { [k: string]: unknown } = { semester };

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i] ?? "";
      const raw = rowMatch[i + 1] ?? "";

      // Extract text: prefer anchor text, else strip tags
      const aMatch = /<a[^>]*>([\s\S]*?)<\/a>/.exec(raw);
      let c: string = aMatch ? aMatch[1]!.trim() : raw.replace(/<[^>]+>/g, "").trim();

      if (key === "lession_id") {
        item.lession_id = c;
        continue;
      }
      if (key === "教学班") {
        c = c.startsWith("班级:") ? c.slice(3).trim() : c;
        item.teaching_class = c
          .split(" ")
          .flatMap((s) => s.split(";"))
          .filter(Boolean);
        continue;
      }
      if (key === "教师") {
        item.teacher = c.split(",").filter(Boolean);
        continue;
      }
      if (key === "课程类别") {
        item.course_type = c
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        continue;
      }
      if (key === "学时/周") {
        const parts = c.split("/");
        item.hours = parts[0] ? Number.parseFloat(parts[0]) : null;
        item.week_hours = parts[1] ? Number.parseFloat(parts[1]) : null;
        continue;
      }
      if (key === "课程名称") {
        item.name = c.replace(/\n/g, "");
        continue;
      }
      if (key === "课程序号") {
        item.class_id = c || null;
        continue;
      }
      if (key === "课程代码") {
        item.course_id = c || null;
        continue;
      }
      if (key === "学分") {
        item.credit = c ? Number.parseFloat(c) : null;
        continue;
      }
      if (key === "开课校区") {
        item.campus = c || null;
        continue;
      }
      if (key === "起止周") {
        item.weeks = c || null;
        continue;
      }
      if (key === "实际") {
        item.selected = c ? Number.parseInt(c, 10) : null;
        continue;
      }
      if (key === "总上限") {
        item.limit = c ? Number.parseInt(c, 10) : null;
        continue;
      }
      if (key === "计划外人数上限") {
        item.extra_limit = c ? Number.parseInt(c, 10) : null;
        continue;
      }
      if (key === "是否开放计划外") {
        item.is_extra_open = parseBool(c);
        continue;
      }
      if (key === "课程大纲") {
        item.has_syllabus = parseHasBool(c);
        continue;
      }
      if (key === "总学时") {
        item.hours = c ? Number.parseFloat(c) : null;
        continue;
      }
      if (key === "周学时") {
        item.week_hours = c ? Number.parseFloat(c) : null;
        continue;
      }
    }

    // Attach arrange (timetable) from the JS map
    const arrangeHtml = arrangeMap.get(item.lession_id as string ?? "") ?? "";
    item.arrange = arrangeHtml.trim() ? parseArrange(arrangeHtml) : [];

    result.push(item as CourseEntry);
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const tailContent = contentAndTail[1] ?? "";
  const pageMatch = /pageInfo\((\d+),(\d+),(\d+)\)/.exec(tailContent);
  const pageFrom = pageMatch ? Number.parseInt(pageMatch[1] ?? "1", 10) : 1;
  const pageTo = pageMatch ? Number.parseInt(pageMatch[2] ?? "1", 10) : 1;
  const total = pageMatch ? Number.parseInt(pageMatch[3] ?? "0", 10) : result.length;
  const pageSize = pageTo - pageFrom + 1;
  const pageNo = Math.floor((pageFrom - 1) / pageSize) + 1;

  return { list: result, page_no: pageNo, page_size: pageSize, total };
}

// ---------------------------------------------------------------------------
// parse_course_info
// ---------------------------------------------------------------------------

/**
 * Parse the course-detail page to extract semester and faculty.
 */
export function parseCourseInfo(html: string): CourseInfo {
  const semMatch = /学期:<\/td>\s+<td.*?>(.*?)<\/td>/.exec(html);
  const facMatch = /开课院系:<\/td>\s+<td.*?>(.*?)<\/td>/.exec(html);
  return {
    semester: (semMatch?.[1] ?? "").trim(),
    faculty: (facMatch?.[1] ?? "").trim(),
  };
}

// ---------------------------------------------------------------------------
// parse_syllabus
// ---------------------------------------------------------------------------

const _td = new TurndownService();

/**
 * Convert syllabus HTML to Markdown, matching Python's markdownify output.
 */
export function parseSyllabus(html: string): string {
  return _td.turndown(html).replace(/\n{3,}/g, "\n\n").trim();
}
