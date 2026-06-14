/**
 * Global shared type definitions.
 */

// ─── API response wrapper ─────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── User ────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

// ─── Schedule ────────────────────────────────────────────────────

export interface Course {
  id: string; // Synthetic stable id (no database)
  name: string;
  teacher?: string | null;
  location?: string | null;
  weekday: number; // 1=Monday … 7=Sunday
  startSlot: number; // 1–11
  endSlot: number; // 1–11 (inclusive)
  weeks: number[]; // Teaching weeks
  color?: string | null;
  source: "manual" | "ics" | "ocr" | "tju"; // tju = fetched via tju library
  semester?: string | null;
  courseId?: string | null; // Course code
  classId?: string | null; // Class ID
  credit?: number | null;
  note?: string | null;
}

// Extended for timetable view — includes formatted time strings
export interface CourseWithTime extends Course {
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:15"
}

// ─── Links ───────────────────────────────────────────────────────

export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  category?: string | null;
  order: number;
  isBuiltIn: boolean;
}

// ─── Academic Calendar ───────────────────────────────────────────

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  startDate: string; // ISO date "2025-09-01"
  endDate: string;
  type: "holiday" | "exam" | "holiday_break" | "important" | "semester_start" | "semester_end";
  description?: string;
}

export interface Semester {
  id: string; // e.g. "2025-2026-1"
  name: string; // e.g. "2025-2026 学年第一学期"
  startDate: string;
  endDate: string;
  totalWeeks: number;
  events: AcademicCalendarEvent[];
}

// ─── Weather (placeholder, can connect a public API in Phase 1) ──

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
  city: string;
}

// ─── Theme ──────────────────────────────────────────────────────

export type Theme = "dark" | "light" | "system";
