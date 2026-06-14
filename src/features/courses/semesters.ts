/**
 * 可选学期列表（与 tju consts.SEMESTER 的代码格式一致）。
 * 代码格式：起始年后两位 + 结束年后两位 + 学期(1=秋,2=春)。
 * 例：2025-2026 春季学期 → "25262"。
 */

export interface SemesterOption {
  code: string;
  label: string;
  year: number; // 起始年
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

/** 生成 [fromYear, toYear] 间的学期选项（按时间倒序，最新在前）。 */
export function listSemesters(fromYear = 2021, toYear = 2027): SemesterOption[] {
  const opts: SemesterOption[] = [];
  for (let y = toYear; y >= fromYear; y--) {
    for (const term of [2, 1] as const) {
      opts.push({ code: makeCode(y, term), label: makeLabel(y, term), year: y, term });
    }
  }
  return opts;
}

/** 依据日期推断当前学期代码。9月-次年1月=秋季(term1)，2月-8月=春季(term2)。 */
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
