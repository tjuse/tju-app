/**
 * HTML parsers for the academic score pages (UG / GS / experiment).
 * Ported from tju-python/src/tju/parser/score.py + models/score.py + fields.py
 */

import type { ExpScoreRecord, GSScoreRecord, UGScoreRecord } from "../types.js";

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ParseError";
  }
}

// ---------------------------------------------------------------------------
// Field transformers (mirror tju-python/src/tju/fields.py)
// ---------------------------------------------------------------------------

/**
 * Format a GPA value to a string matching Python's GPAField._serialize.
 *
 * Python: `return str(value) if value else ""`
 *   - None → ""
 *   - 0.0  → "" (0.0 is falsy in Python!)
 *   - 4.0  → "4.0"
 *   - 3.7  → "3.7"
 *
 * JS `String(4.0)` → "4" (no decimal for integers) — we add ".0" for whole numbers.
 */
function formatGPA(raw: string | undefined): string {
  if (!raw) return "";
  const n = Number.parseFloat(raw);
  // NaN or zero → "" (mirrors Python falsy check on the float)
  if (Number.isNaN(n) || n === 0) return "";
  return n % 1 === 0 ? `${n}.0` : String(n);
}

/** Parse Chinese boolean "是" → true; empty/other → null. */
function chineseBool(raw: string | undefined): boolean | null {
  if (raw === undefined || raw === "") return null;
  return raw === "是";
}

/** Parse Chinese "有/无" bool: "有" → true; empty/other → null. */
// (not used in score but exported for reuse)
export function chineseHasBool(raw: string | undefined): boolean | null {
  if (raw === undefined || raw === "") return null;
  return raw === "有";
}

/**
 * ScoreSemesterField._serialize: the semester in the HTML is already in the
 * display format "2024-2025 1", so no transformation needed.
 */
function scoreSemester(raw: string | undefined): string | null {
  return raw || null;
}

// ---------------------------------------------------------------------------
// Raw HTML table parser (shared for UG/GS/exp)
// ---------------------------------------------------------------------------

/**
 * Split HTML on gridtable markers and return a list of (keys[], rows[]) pairs.
 * One pair per <table class="gridtable"> in the page.
 */
function parseGridTables(html: string): Array<{ keys: string[]; rows: Record<string, string>[] }> {
  const tables = html.split('<table class="gridtable">');
  const results: Array<{ keys: string[]; rows: Record<string, string>[] }> = [];

  for (const tableHtml of tables.slice(1)) {
    const parts = tableHtml.split("</thead>");
    const headHtml = parts[0] ?? "";
    const bodyHtml = parts[1] ?? "";

    const keys = [...headHtml.matchAll(/<th.*?>(.+?)<\/th>/g)].map((m) =>
      (m[1] ?? "").trim(),
    );

    const rowHtmls = bodyHtml.split("</tr>");
    const rows: Record<string, string>[] = [];

    for (let rowHtml of rowHtmls) {
      // Fix broken <td\n> tags (EAMS quirk)
      if (rowHtml.includes("<td\n")) rowHtml = rowHtml.replace(/<td\n/g, "<td>");

      // Collapse <sup style=...> annotations: "value<sup ...>note</sup>" → "value note"
      rowHtml = rowHtml.replace(
        /(\S+)\t*<sup style=.*?>(.*?)<\/sup>/g,
        (_m, main, sup) => `${main} ${sup}`,
      );

      const values = [...rowHtml.matchAll(/<td.*?>\s*(.*?)\s*<\/td>/g)].map((m) =>
        (m[1] ?? "").trim(),
      );

      if (values.length !== keys.length) continue;
      const row: Record<string, string> = {};
      for (let i = 0; i < keys.length; i++) {
        row[keys[i] ?? ""] = values[i] ?? "";
      }
      rows.push(row);
    }

    results.push({ keys, rows });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Undergraduate score parser
// ---------------------------------------------------------------------------

/**
 * Parse an undergraduate score history page.
 *
 * UG pages have two gridtables: a summary table (GPA etc.) followed by
 * a course list table.  We ignore the summary (the CLI does the same) and
 * return only the course list.
 *
 * Field mapping mirrors UGScore marshmallow dataclass (data_key annotations
 * in tju-python/src/tju/models/score.py).
 */
export function parseUGScore(html: string): UGScoreRecord[] {
  const tables = parseGridTables(html);
  if (tables.length < 1) throw new ParseError("Score data format Error");

  // UG has summary table + courses table; GS has only courses table.
  // Detect by checking if the first table has a "总评成绩" column.
  const isUG = (tables[0]?.keys ?? []).includes("总评成绩");
  const courseTable = isUG ? (tables[0] ?? tables[tables.length - 1]) : tables[0];
  if (!courseTable) throw new ParseError("Score data format Error");

  // If there are two tables, the courses are in the last one
  const coursesTable =
    tables.length >= 2 ? (tables[tables.length - 1] ?? courseTable) : courseTable;

  return (coursesTable.rows ?? []).map((raw) => ({
    semester: scoreSemester(raw["学年学期"]),
    course_id: raw["课程代码"] || null,
    name: raw["课程名称"] || null,
    course_type: raw["课程类别"] || null,
    course_props: raw["课程性质"] ?? null,
    credit: raw["学分"] ? Number.parseFloat(raw["学分"]) : null,
    score: raw["总评成绩"] || null,
    gpa: formatGPA(raw["绩点"]),
  }));
}

// ---------------------------------------------------------------------------
// Graduate score parser
// ---------------------------------------------------------------------------

/**
 * Parse a graduate score search page.
 *
 * GS pages have a single gridtable with different column names.
 *
 * Field mapping mirrors GSScore marshmallow dataclass.
 */
export function parseGSScore(html: string): GSScoreRecord[] {
  const tables = parseGridTables(html);
  if (tables.length < 1) throw new ParseError("Score data format Error");

  // Use the last table (in case there is a summary-like preamble)
  const coursesTable = tables[tables.length - 1];
  if (!coursesTable) throw new ParseError("Score data format Error");

  return coursesTable.rows.map((raw) => ({
    semester: scoreSemester(raw["学年学期"]),
    class_id: raw["课程序号"] || null,
    course_id: raw["课程代码"] || null,
    name: raw["课程名称"] || null,
    course_type: raw["课程类别"] || null,
    credit: raw["学分"] ? Number.parseFloat(raw["学分"]) : null,
    exam_status: raw["考试情况"] || null,
    score: raw["最终"] || null,
    is_in_plan: chineseBool(raw["是否方案内课程"]),
    is_credited: chineseBool(raw["选修课是否认定学分"]),
  }));
}

// ---------------------------------------------------------------------------
// Experiment / lab score parser
// ---------------------------------------------------------------------------

/**
 * Parse the experiment score page.
 *
 * Field mapping mirrors ExpScore marshmallow dataclass.
 * Semester field: "2024-2025学年1学期" stays as the display form
 * (the CLI does the reverse mapping via ExpScoreSemesterField._serialize,
 * but for the extension we keep the display string).
 */
export function parseExpScore(html: string): ExpScoreRecord[] {
  const tableMatch = /<table.*?class="gridtable">([\s\S]*?)<\/table>/.exec(html);
  if (!tableMatch) return [];

  const tableHtml = tableMatch[1] ?? "";
  const headMatch = /<thead class="gridhead">([\s\S]*?)<\/thead>/.exec(tableHtml);
  const keys = headMatch
    ? [...headMatch[1]!.matchAll(/<th.*?>(.+?)<\/th>/g)].map((m) => (m[1] ?? "").trim())
    : [];

  const bodyHtml = tableHtml.split("</thead>")[1] ?? "";
  const rowHtmls = bodyHtml.split("</tr>");
  const result: ExpScoreRecord[] = [];

  for (const rowHtml of rowHtmls) {
    const values = [...rowHtml.matchAll(/<td.*?>\s*(.*?)\s*<\/td>/g)].map((m) =>
      (m[1] ?? "").trim(),
    );
    if (values.length !== keys.length) continue;

    const raw: Record<string, string> = {};
    for (let i = 0; i < keys.length; i++) {
      raw[keys[i] ?? ""] = values[i] ?? "";
    }

    const scoreNum = raw["项目成绩"] ? Number.parseFloat(raw["项目成绩"]) : null;
    result.push({
      semester: raw["学年学期"] || null,
      course_id: raw["课程代码"] || null,
      class_id: raw["课程序号"] || null,
      course_name: raw["课程名称"] || null,
      project_id: raw["项目代码"] || null,
      project_name: raw["项目名称"] || null,
      sub_score: raw["分项成绩"] || null,
      score: Number.isNaN(scoreNum) ? null : scoreNum,
    });
  }

  return result;
}
