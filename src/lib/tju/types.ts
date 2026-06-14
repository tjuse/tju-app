/**
 * TypeScript mirror of the shapes produced by
 * `Course.Schema(many=True).dump()` in the tju Python library
 * (src/tju/models/schedule.py — Course / CourseArrange).
 * All fields may be null when the marshmallow field is missing.
 */

export interface TjuArrange {
  teacher: string[] | null; // teachers for this slot
  week: number[] | null; // teaching weeks, e.g. [1,2,...,16]
  unit: number[] | null; // class periods (节次), e.g. [1,2] = periods 1-2
  weekday: number | null; // 1=Monday … 7=Sunday
  location: string | null; // classroom
}

export interface TjuCourse {
  class_id: string | null; // section number (课程序号)
  course_id: string | null; // course code (课程代码)
  name: string | null; // course name
  credit: number | null; // credits
  campus: string | null; // campus
  weeks: string | null; // raw week-range string, e.g. "1-16"
  teacher: string[] | null; // course teachers
  arrange: TjuArrange[] | null; // schedule segments (may be multiple)
}

export interface TjuStudent {
  id: string | null;
  name: string | null;
  type: string | null;
  semester: string | null;
}

/** Public course catalog entry (LibCourse dump), extending TjuCourse. */
export interface TjuLibCourse extends TjuCourse {
  semester: string | null;
  lession_id: string | null; // stable ID for detail/syllabus lookups
  course_type: string[] | null; // e.g. ["专业核心课程"]
  teaching_class: string[] | null;
  selected: number | null; // enrolled count (undergrad only; null for grad)
  limit: number | null; // enrollment cap
  extra_limit: number | null;
  is_extra_open: boolean | null;
  hours: number | null; // total teaching hours
  week_hours: number | null; // hours per week
  has_syllabus: boolean | null; // whether a syllabus is available
  student_type: "undergraduate" | "graduate";
}

/** A single score record (shared fields for both undergrad and grad). */
export interface TjuScoreRecord {
  semester: string | null; // e.g. "2025-2026 1"
  course_id: string | null;
  name: string | null;
  course_type: string | null;
  credit: number | null;
  score: string | null; // numeric string or "通过"/"未通过"
  // Undergraduate-only fields
  course_props?: string | null;
  gpa?: number | null;
  // Graduate-only fields
  class_id?: string | null;
  exam_status?: string | null;
  is_in_plan?: boolean | null;
  is_credited?: boolean | null;
}

/** Return shape of the `score` CLI sub-command. */
export interface TjuScoreResult {
  student: TjuStudent;
  student_type: "undergraduate" | "graduate";
  scores: TjuScoreRecord[];
}

/** A single exam schedule entry. */
export interface TjuExamEntry {
  class_id: string | null;
  name: string | null;
  exam_type: string | null; // e.g. "期末考试"
  exam_date: string | null; // ISO date string "2026-04-30"
  exam_category: string | null;
  exam_time: [string, string] | null; // ["18:00", "20:00"]
  location: string | null;
  seat: string | null;
  status: string | null;
  notice: string | null;
}

/** Return shape of the `exam` CLI sub-command. */
export interface TjuExamResult {
  student: TjuStudent;
  semester: string;
  exams: TjuExamEntry[];
}

/** Return shape of the `courses` CLI sub-command. */
export interface TjuCoursesResult {
  semester: string;
  total: number;
  undergraduate: number;
  graduate: number;
  courses: TjuLibCourse[];
  warnings: string[];
}

export interface TjuScheduleResult {
  student: TjuStudent;
  semester: string;
  courses: TjuCourse[];
}

/** Unified envelope produced by the Python CLI for every sub-command. */
export type TjuCliResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: TjuErrorCode };

export type TjuErrorCode = "login" | "network" | "parse" | "usage" | "unknown";

/** Error thrown on the TS side, carrying a code for HTTP-status mapping. */
export class TjuError extends Error {
  code: TjuErrorCode;
  constructor(message: string, code: TjuErrorCode = "unknown") {
    super(message);
    this.name = "TjuError";
    this.code = code;
  }
}
