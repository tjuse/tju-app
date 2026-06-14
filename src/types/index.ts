/**
 * 全局共享类型定义
 */

// ─── API 响应通用包装 ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── 用户 ─────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

// ─── 课程表 ───────────────────────────────────────────────────────

export interface Course {
  id: string;
  userId: string;
  name: string;
  teacher?: string | null;
  location?: string | null;
  weekday: number; // 1=周一 … 7=周日
  startSlot: number; // 1-11
  endSlot: number; // 1-11（含）
  weeks: number[]; // 上课周次
  color?: string | null;
  source: "manual" | "ics" | "ocr" | "sync";
  semester?: string | null;
  note?: string | null;
}

// 课表视图用 —— 带时间字符串
export interface CourseWithTime extends Course {
  startTime: string; // 如 "08:30"
  endTime: string; // 如 "09:15"
}

// ─── 链接 ─────────────────────────────────────────────────────────

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  category?: string | null;
  order: number;
  isBuiltIn: boolean;
}

// ─── 校历 ─────────────────────────────────────────────────────────

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO 日期 "2025-09-01"
  endDate: string;
  type: "holiday" | "exam" | "holiday_break" | "important" | "semester_start" | "semester_end";
  description?: string;
}

export interface Semester {
  id: string; // 如 "2025-2026-1"
  name: string; // 如 "2025-2026 学年第一学期"
  startDate: string;
  endDate: string;
  totalWeeks: number;
  events: AcademicCalendarEvent[];
}

// ─── 天气（占位，Phase 1 可接公开 API） ─────────────────────────────

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
}

// ─── 主题 ─────────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";
