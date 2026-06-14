/**
 * tju Python 库 `Course.Schema(many=True).dump()` 输出的形状（TS 镜像）。
 * 对应 src/tju/models/schedule.py 的 Course / CourseArrange。
 * 所有字段在 marshmallow 缺省时可能为 null。
 */

export interface TjuArrange {
  teacher: string[] | null; // 该次安排的教师
  week: number[] | null; // 上课周次，如 [1,2,...,16]
  unit: number[] | null; // 节次，如 [1,2]（第 1~2 节）
  weekday: number | null; // 1=周一 … 7=周日
  location: string | null; // 上课地点
}

export interface TjuCourse {
  class_id: string | null; // 课程序号
  course_id: string | null; // 课程代码
  name: string | null; // 课程名称
  credit: number | null; // 学分
  campus: string | null; // 开课校区
  weeks: string | null; // 起止周原始字符串，如 "1-16"
  teacher: string[] | null; // 课程教师
  arrange: TjuArrange[] | null; // 上课安排（可能多段）
}

export interface TjuStudent {
  id: string | null;
  name: string | null;
  type: string | null;
  semester: string | null;
}

/** 公开课程库条目（LibCourse dump），扩展 TjuCourse。 */
export interface TjuLibCourse extends TjuCourse {
  semester: string | null;
  lession_id: string | null; // 用于查详情/大纲
  course_type: string[] | null; // 如 ["专业核心课程"]
  teaching_class: string[] | null;
  selected: number | null; // 已选（本科有，研究生为 null）
  limit: number | null; // 上限
  extra_limit: number | null;
  is_extra_open: boolean | null;
  hours: number | null; // 总学时
  week_hours: number | null; // 周学时
  has_syllabus: boolean | null; // 有无课程大纲
  student_type: "undergraduate" | "graduate";
}

/** courses 子命令返回 */
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

/** Python CLI 的统一返回包裹 */
export type TjuCliResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: TjuErrorCode };

export type TjuErrorCode = "login" | "network" | "parse" | "usage" | "unknown";

/** TS 侧抛出的错误，带 code 便于上层映射 HTTP 状态/文案 */
export class TjuError extends Error {
  code: TjuErrorCode;
  constructor(message: string, code: TjuErrorCode = "unknown") {
    super(message);
    this.name = "TjuError";
    this.code = code;
  }
}
