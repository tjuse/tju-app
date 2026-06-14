import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names, resolving conflicts via tailwind-merge.
 * Usage: cn("px-4", condition && "text-blue-500", ...)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an amount as Chinese yuan, e.g. 42.5 → "¥42.50"
 */
export function formatCNY(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert a class-period number (节次) to a start/end time string using
 * TJU's official timetable. Period 1 starts at 08:30; each period is 45 min
 * with 10-min breaks and a 30-min midday break between periods 4 and 5.
 */
const TJU_SLOT_START: Record<number, string> = {
  1: "08:30",
  2: "09:20",
  3: "10:15",
  4: "11:05",
  5: "14:00",
  6: "14:50",
  7: "15:45",
  8: "16:35",
  9: "19:00",
  10: "19:50",
  11: "20:40",
};

const TJU_SLOT_END: Record<number, string> = {
  1: "09:15",
  2: "10:05",
  3: "11:00",
  4: "11:50",
  5: "14:45",
  6: "15:35",
  7: "16:30",
  8: "17:20",
  9: "19:45",
  10: "20:35",
  11: "21:25",
};

export function slotToTime(slot: number): { start: string; end: string } {
  return {
    start: TJU_SLOT_START[slot] ?? "--:--",
    end: TJU_SLOT_END[slot] ?? "--:--",
  };
}

/**
 * Calculate the current week number relative to a semester start date.
 */
export function getCurrentWeek(semesterStart: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - semesterStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil((diffDays + 1) / 7));
}

/**
 * Return today's weekday as 1=Monday … 7=Sunday.
 */
export function getTodayWeekday(): number {
  const day = new Date().getDay(); // 0=周日
  return day === 0 ? 7 : day;
}
