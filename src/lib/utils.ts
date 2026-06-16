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
  3: "10:25",
  4: "11:15",
  5: "13:30",
  6: "14:20",
  7: "15:25",
  8: "16:15",
  9: "18:30",
  10: "19:20",
  11: "20:10",
  12: "21:00",
};

const TJU_SLOT_END: Record<number, string> = {
  1: "09:15",
  2: "10:05",
  3: "11:10",
  4: "12:00",
  5: "14:15",
  6: "15:05",
  7: "16:10",
  8: "17:00",
  9: "19:15",
  10: "20:05",
  11: "20:55",
  12: "21:45",
};

export function slotToTime(slot: number): { start: string; end: string } {
  return {
    start: TJU_SLOT_START[slot] ?? "--:--",
    end: TJU_SLOT_END[slot] ?? "--:--",
  };
}

/**
 * Return today's weekday as 1=Monday … 7=Sunday.
 */
export function getTodayWeekday(): number {
  const day = new Date().getDay(); // 0=周日
  return day === 0 ? 7 : day;
}
