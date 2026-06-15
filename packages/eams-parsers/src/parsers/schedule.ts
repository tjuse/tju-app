/**
 * HTML parser for the personal timetable (course table) page.
 * Ported from tju-python/src/tju/parser/schedule.py
 */

import type { Arrange, ScheduleEntry } from "../types.js";

export class ParseError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "ParseError";
  }
}

/**
 * Parse the EAMS personal timetable HTML into an array of ScheduleEntry objects.
 *
 * The page embeds course-slot data as a series of JS snippets inside the HTML,
 * one `TaskActivity` block per slot.  The function first extracts all slot
 * descriptors, then reads the course table rows to assemble the final list.
 *
 * Matches the output of tju-python parse_schedule (serialized form):
 * `Course.Schema(many=True).dump(schedule)`.
 */
export function parseSchedule(html: string): ScheduleEntry[] {
  // ── Step 1: extract arrange slots from embedded JS ────────────────────────
  // The page looks like: "...in TaskActivity ... fillTable..."
  const taskMatch = /in TaskActivity([\s\S]+?)fillTable/.exec(html);
  if (!taskMatch) throw new ParseError("Cannot find TaskActivity section");

  // Split on "var teachers" — each segment after the first is one slot block
  const arrangeHtmls = (taskMatch[1] ?? "").split("var teachers");

  // Map: classID → list of arrange objects
  const arrangePairMap = new Map<string, Arrange[]>();

  for (const arrangeItem of arrangeHtmls.slice(1)) {
    // Extract teacher names from: var actTeachers = [...];
    const rawTeachersMatch = /var actTeachers = ([^;]+);/.exec(arrangeItem);
    const teacherArray: string[] = rawTeachersMatch
      ? [...(rawTeachersMatch[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "")
      : [];

    // Extract classID from line 14 of the semicolon-split list
    const lineList = arrangeItem.split(";");
    const courseLine = (lineList[14] ?? "").split(",");
    const classIDMatch = /\((\w+)\)/.exec(courseLine[4] ?? "");
    if (!classIDMatch) continue;
    const classID = classIDMatch[1] ?? "";

    // Extract location and week-bitmask: '"name","","location","01010..."'
    const threePairMatch = /"([^"]+)","[^"]*","([^"]*)","([01]+)"/.exec(arrangeItem);
    if (!threePairMatch) continue;
    const location = (threePairMatch[2] ?? "").trim();
    const rawWeeks = (threePairMatch[3] ?? "").trim();

    // Convert bitmask to week-number array (1-indexed bit positions)
    const weekArray: number[] = [];
    for (let i = 0; i < rawWeeks.length; i++) {
      if (rawWeeks[i] === "1") weekArray.push(i);
    }

    // Extract weekday and unit slots: N*unitCount+M
    const twoPairs = [...arrangeItem.matchAll(/([0-9]+)\*unitCount\+([0-9]+)/g)];
    if (twoPairs.length === 0) continue;
    const weekday = Number.parseInt(twoPairs[0]?.[1] ?? "0", 10) + 1;
    const unitArray = twoPairs.map((m) => Number.parseInt(m[2] ?? "0", 10) + 1);

    const slots = arrangePairMap.get(classID) ?? [];
    slots.push({ teacher: teacherArray, week: weekArray, unit: unitArray, weekday, location });
    arrangePairMap.set(classID, slots);
  }

  // ── Step 2: parse course table rows ───────────────────────────────────────
  const tbodyMatch = /<tbody([\s\S]+?)<\/tbody>/.exec(html);
  if (!tbodyMatch) return [];

  const courses: ScheduleEntry[] = [];
  const trMatches = [...(tbodyMatch[1] ?? "").matchAll(/<tr([\s\S]+?)<\/tr>/g)];

  for (const trMatch of trMatches) {
    const tr = trMatch[0];
    const tds = [...tr.matchAll(/<td>([\s\S]+?)<\/td>/g)].map((m) => m[1] ?? "");
    if (tds.length <= 9) continue;

    // Column layout (0-indexed):
    // 0: checkbox, 1: serial/class_id link, 2: course_id, 3: name,
    // 4: credit, 5: teachers, 6: weeks, 7-8: other, 9: campus info
    const serialMatch = />(\d*)<\/a>/.exec(tds[1] ?? "");
    if (!serialMatch) continue;
    const serial = serialMatch[1] ?? "";

    const no = tds[2] ?? "";

    // Name may contain a <sup> for annotation; handle both cases.
    // Python: re.findall("(.+?)<sup", td)[0].strip() + " " + re.findall('">(.+?)</s', td)[0].strip()
    // Note: the Python '">(.+?)</s' uses ' as string delimiter; the pattern itself is ">(.+?)</s
    let name = tds[3] ?? "";
    if (name.includes("style")) {
      const nameMain = /(.+?)<sup/.exec(name);
      const nameSup = /">(.+?)<\/s/.exec(name);
      if (nameMain && nameSup) {
        name = `${(nameMain[1] ?? "").trim()} ${(nameSup[1] ?? "").trim()}`;
      }
    }

    // Credit: parse as float then back to string to match Python str(float(x)).
    // Python str(6.0)="6.0", str(0.5)="0.5"; JS String(6)="6" (no decimal) — fix integers.
    const creditNum = Number.parseFloat(tds[4] ?? "0");
    const credit = creditNum % 1 === 0 ? `${creditNum}.0` : String(creditNum);

    const teachers = (tds[5] ?? "").split(",");
    const weeks = (tds[6] ?? "").trim();

    const campusRaw = tds[9] ?? "";
    const campusMatch = /(.+?校区)/.exec(campusRaw);
    const campus = campusMatch ? (campusMatch[1] ?? "").trim() : "";

    courses.push({
      class_id: serial,
      course_id: no,
      name,
      credit,
      teacher: teachers,
      weeks,
      campus,
      arrange: arrangePairMap.get(serial) ?? [],
    });
  }

  return courses;
}
