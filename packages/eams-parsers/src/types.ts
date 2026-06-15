/**
 * TypeScript types for the data returned by each EAMS parser.
 * Field names and types match the serialized output of the Python tju library
 * (tju-python/src/tju/models/), so the extension can feed data directly to the
 * tju-app without extra translation.
 */

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface Student {
  id: string | null;
  name: string | null;
  type: string | null; // "UNDERGRADUATE" | "GRADUATE" etc.
  semester: string | null; // current semester code, e.g. "25262"
}

// ---------------------------------------------------------------------------
// Personal schedule
// ---------------------------------------------------------------------------

/** One scheduled slot (day / class-periods / teaching-weeks) for a course. */
export interface Arrange {
  teacher: string[];
  week: number[]; // teaching weeks (1-indexed)
  unit: number[]; // class-period slots (1-indexed)
  weekday: number; // 1=Monday … 7=Sunday
  location: string;
}

/** A course entry on the personal timetable. */
export interface ScheduleEntry {
  class_id: string; // 课程序号 (section identifier)
  course_id: string; // 课程代码 (course code)
  name: string; // 课程名称
  credit: string; // raw string, e.g. "3.0" — matches Python str(float(credit))
  teacher: string[]; // course teachers
  weeks: string; // raw week-range string, e.g. "1-16"
  campus: string; // campus name or ""
  arrange: Arrange[]; // scheduled slots (may be empty for fully-online courses)
}

// ---------------------------------------------------------------------------
// Exam schedule
// ---------------------------------------------------------------------------

/** A single exam entry from the personal exam table. */
export interface ExamEntry {
  class_id: string | null; // 课程序号
  name: string | null; // 课程名称
  exam_type: string | null; // 考试类别, e.g. "期末考试"
  exam_date: string | null; // "YYYY-MM-DD"
  exam_category: string | null; // 批次, e.g. "公共课期末考试"
  exam_time: [string, string] | null; // ["09:00", "11:00"]
  location: string | null; // 考试地点
  seat: string | null; // 考场座位号
  status: string | null; // 考试情况
  notice: string | null; // 其它说明
}

// ---------------------------------------------------------------------------
// Academic scores — undergraduate
// ---------------------------------------------------------------------------

export interface UGScoreRecord {
  semester: string | null; // "2024-2025 1"
  course_id: string | null;
  name: string | null;
  course_type: string | null;
  course_props: string | null; // 课程性质 (必修/选修/…)
  credit: number | null;
  score: string | null; // raw score string (e.g. "95" or "通过")
  gpa: string; // Python GPAField: "" for None/0.0, else "4.0"-style string
}

// ---------------------------------------------------------------------------
// Academic scores — graduate
// ---------------------------------------------------------------------------

export interface GSScoreRecord {
  semester: string | null;
  class_id: string | null; // 课程序号
  course_id: string | null;
  name: string | null;
  course_type: string | null;
  credit: number | null;
  exam_status: string | null; // 考试情况
  score: string | null;
  is_in_plan: boolean | null; // 是否方案内课程
  is_credited: boolean | null; // 选修课是否认定学分
}

// ---------------------------------------------------------------------------
// Experiment / lab scores
// ---------------------------------------------------------------------------

export interface ExpScoreRecord {
  semester: string | null; // "20242025学年1学期" → "24251" via ExpScoreSemesterField
  course_id: string | null;
  class_id: string | null;
  course_name: string | null;
  project_id: string | null;
  project_name: string | null;
  sub_score: string | null;
  score: number | null; // 项目成绩 (numeric)
}

// ---------------------------------------------------------------------------
// Public course library
// ---------------------------------------------------------------------------

export interface CourseArrangeRaw {
  teacher: string[];
  weekday: number;
  unit: number[];
  week: number[];
  location: string;
}

/** A course entry from the public EAMS course library. */
export interface CourseEntry {
  semester: string; // e.g. "24251"
  lession_id: string; // stable course instance ID
  class_id: string | null; // 课程序号
  course_id: string | null; // 课程代码
  name: string | null; // 课程名称
  credit: number | null; // 学分
  campus: string | null; // 开课校区
  weeks: string | null; // 起止周
  teacher: string[]; // 教师
  course_type: string[]; // 课程类别
  teaching_class: string[]; // 教学班
  selected: number | null; // 实际 (enrolled count; null for GS)
  limit: number | null; // 总上限
  extra_limit: number | null; // 计划外人数上限
  is_extra_open: boolean | null; // 是否开放计划外
  hours: number | null; // 总学时
  week_hours: number | null; // 周学时
  has_syllabus: boolean | null; // 课程大纲: "有"→true, "无"→false
  arrange: CourseArrangeRaw[];
}

export interface CoursePageResult {
  list: CourseEntry[];
  page_no: number;
  page_size: number;
  total: number;
}

export interface CourseInfo {
  semester: string;
  faculty: string;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/** Raw key-value profile fields as returned by EAMS. */
export type ProfileResult = Record<string, string>;

// ---------------------------------------------------------------------------
// Free classrooms
// ---------------------------------------------------------------------------

export type FreeClassroomEntry = Record<string, string>;
