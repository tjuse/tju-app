/**
 * HTML parser for the EAMS free-classroom search result fragment.
 * Ported from tju-python/src/tju/parser/classroom.py
 */

import type { FreeClassroomEntry } from "../types.js";

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ParseError";
  }
}

export class DataError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "DataError";
  }
}

// Known EAMS server-side error messages (keys quoted because some contain punctuation).
// Note: the permission-denied marker uses an ASCII comma (,), not a fullwidth comma (，).
const SERVER_ERRORS: Record<string, string> = {
  "借用教室小节错误":
    "借用教室小节错误: the EAMS class-period schedule is unavailable for the requested date/time (likely outside an active teaching week or project is unconfigured).",
  "请不要过快点击":
    "Rate-limited by EAMS: too many requests in a short time. Retry after a delay.",
  "对不起,您没有权限": "Permission denied (403): this account does not have access to the free classroom feature.",
};

// Mirrors FreeClassroom marshmallow model data_key mappings (classroom.py)
const KEY_MAP: Record<string, string> = {
  "校区": "campus",
  "教学楼": "building",
  "教室": "name",
  "教室类型": "room_type",
  "座位数": "seats",
};

/**
 * Parse the free-classroom search result HTML fragment.
 *
 * Raises DataError for known EAMS error messages, ParseError for unexpected
 * structure.  Returns an empty array when the result set is empty.
 */
export function parseFreeClassroom(html: string): FreeClassroomEntry[] {
  // Detect server-side error responses first
  for (const [marker, message] of Object.entries(SERVER_ERRORS)) {
    if (html.includes(marker)) throw new DataError(message);
  }

  // Extract column headers
  const keysRaw = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)];
  const keys = keysRaw.map((m) => (m[1] ?? "").replace(/<[^>]+>/g, "").trim());

  // Find tbody
  const tbodyMatches = [...html.matchAll(/<tbody[\s\S]*?<\/tbody>/g)];
  if (tbodyMatches.length === 0) {
    // No tbody: error if no grid at all, else empty result
    if (!html.includes("gridtable") && !html.includes("<th")) {
      throw new ParseError("Unexpected free classroom response: no grid table found.");
    }
    return [];
  }

  const tbody = tbodyMatches[0]?.[0] ?? "";
  const rows = [...tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
  const classrooms: FreeClassroomEntry[] = [];

  for (const rowMatch of rows) {
    const cells = [...(rowMatch[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)];
    if (cells.length === 0) continue;

    const values = cells.map((c) => (c[1] ?? "").replace(/<[^>]+>/g, "").trim());

    if (keys.length === 0) {
      classrooms.push({ row: values.join("|") });
      continue;
    }

    if (values.length !== keys.length) {
      throw new ParseError(
        `Free classroom column count mismatch: got ${values.length}, expected ${keys.length}`,
      );
    }

    const entry: FreeClassroomEntry = {};
    for (let i = 0; i < keys.length; i++) {
      const rawKey = keys[i] ?? "";
      const mappedKey = KEY_MAP[rawKey] ?? rawKey;
      entry[mappedKey] = values[i] ?? "";
    }
    classrooms.push(entry);
  }

  return classrooms;
}
