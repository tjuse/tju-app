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
