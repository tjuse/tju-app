import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind 类名，处理冲突。
 * 用法：cn("px-4", condition && "text-blue-500", ...)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * 格式化金额（人民币），如 42.5 → "¥42.50"
 */
export function formatCNY(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * 将课程节次转换为时间字符串（天大课程时间表）
 * 第1节：08:30，每节 45min，间隔 10min；大课之间大课间 30min
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
 * 判断今天是学期第几周（基于学期开始日期）
 */
export function getCurrentWeek(semesterStart: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - semesterStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.ceil((diffDays + 1) / 7));
}

/**
 * 获取当前星期几（1=周一 … 7=周日）
 */
export function getTodayWeekday(): number {
  const day = new Date().getDay(); // 0=周日
  return day === 0 ? 7 : day;
}
