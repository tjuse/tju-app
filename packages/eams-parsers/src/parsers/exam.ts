/**
 * HTML parsers for the exam schedule page.
 * Ported from tju-python/src/tju/parser/exam.py + models/exam.py
 */

import type { ExamEntry } from "../types.js";

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ParseError";
  }
}

/**
 * Extract the examBatch.id from the stdExamTable POST response HTML.
 *
 * The page loads the selected semester's exam table via a script call like:
 *   bg.Go('/eams/stdExamTable!examTable.action?examBatch.id=322','contentDiv')
 * We prefer that bg.Go batch id (it reflects the currently-selected semester),
 * and fall back to the first generic examBatch.id occurrence.
 */
export function parseExamBatchId(html: string): string {
  const go = /!examTable\.action\?examBatch\.id=(\d+)/.exec(html);
  if (go) return go[1] ?? "";
  const m = /examBatch\.id=(\d+)/.exec(html);
  if (!m) throw new ParseError("Cannot find examBatch.id in response");
  return m[1] ?? "";
}

/** Convert "09:00~11:00" → ["09:00", "11:00"]. Returns null on bad input. */
function parseExamTime(raw: string | undefined): [string, string] | null {
  if (!raw) return null;
  const parts = raw.split("~");
  if (parts.length !== 2) return null;
  return [parts[0]?.trim() ?? "", parts[1]?.trim() ?? ""];
}

/**
 * Parse the exam table HTML into a typed array of ExamEntry objects.
 *
 * Mapping from Chinese HTML column headers to English field names matches
 * tju-python/src/tju/models/exam.py (Exam dataclass data_key annotations).
 */
export function parseExam(html: string): ExamEntry[] {
  // Extract column headers
  const keys = [...html.matchAll(/<th.*?>(.+?)<\/th.*?>/g)].map((m) => (m[1] ?? "").trim());

  const tbodyMatch = /<tbody([\s\S]+?)<\/tbody>/.exec(html);
  if (!tbodyMatch) return [];

  const courses = [...(tbodyMatch[1] ?? "").matchAll(/<tr>([\s\S]+?)<\/tr>/g)];
  const exams: ExamEntry[] = [];

  for (const courseMatch of courses) {
    const tr = courseMatch[1] ?? "";
    const cells = [...tr.matchAll(/<td>([\s\S]+?)<\/td>/g)].map((m) => m[1] ?? "");
    if (cells.length === 0) continue;

    // Some cells wrap text in <font color="...">text</font>; unwrap those
    const arr = cells.map((cell) => {
      if (cell.includes("color")) {
        const inner = />(.+?)<\/font/.exec(cell);
        return inner ? (inner[1] ?? cell) : cell;
      }
      return cell;
    });

    if (arr.length !== keys.length) {
      throw new ParseError(
        `Failed to parse exam: expected ${keys.length} columns, got ${arr.length}`,
      );
    }

    // Build raw Chinese-keyed object
    const raw: Record<string, string> = {};
    for (let i = 0; i < keys.length; i++) {
      raw[keys[i] ?? ""] = (arr[i] ?? "").trim();
    }

    // Map to English-keyed ExamEntry (mirrors Exam dataclass data_key mappings)
    const entry: ExamEntry = {
      class_id: raw.课程序号 ?? null,
      name: raw.课程名称 ?? null,
      exam_type: raw.考试类别 ?? null,
      exam_date: raw.考试日期 || null,
      exam_category: raw.批次 ?? null,
      exam_time: parseExamTime(raw.考试安排),
      location: raw.考试地点 ?? null,
      seat: raw.考场座位号 ?? null,
      status: raw.考试情况 ?? null,
      notice: raw.其它说明 ?? null,
    };

    exams.push(entry);
  }

  return exams;
}
