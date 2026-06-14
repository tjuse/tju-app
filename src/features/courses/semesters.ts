/**
 * Semester list and helpers, matching the tju consts.SEMESTER code format.
 * Code format: last-2-digits of start year + last-2-digits of end year + term
 * (1 = autumn, 2 = spring). Example: 2025-2026 spring → "25262".
 */

export interface SemesterOption {
  code: string;
  label: string;
  year: number; // Start year of the academic year
  term: 1 | 2;
}

function makeCode(startYear: number, term: 1 | 2): string {
  const s = String(startYear).slice(2);
  const e = String(startYear + 1).slice(2);
  return `${s}${e}${term}`;
}

function makeLabel(startYear: number, term: 1 | 2): string {
  return `${startYear}-${startYear + 1} 学年 ${term === 1 ? "秋季" : "春季"}学期`;
}

/** Generate semester options between fromYear and toYear, newest first. */
export function listSemesters(fromYear = 2021, toYear = 2027): SemesterOption[] {
  const opts: SemesterOption[] = [];
  for (let y = toYear; y >= fromYear; y--) {
    for (const term of [2, 1] as const) {
      opts.push({ code: makeCode(y, term), label: makeLabel(y, term), year: y, term });
    }
  }
  return opts;
}

/** Infer the current semester code from the date. Sep-Jan=autumn(term1), Feb-Aug=spring(term2). */
export function currentSemesterCode(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 9) return makeCode(year, 1);
  if (month <= 1) return makeCode(year - 1, 1);
  return makeCode(year - 1, 2);
}

const ALL = listSemesters();

export function isValidSemester(code: string): boolean {
  return ALL.some((s) => s.code === code);
}

export function semesterLabel(code: string): string {
  return ALL.find((s) => s.code === code)?.label ?? code;
}
