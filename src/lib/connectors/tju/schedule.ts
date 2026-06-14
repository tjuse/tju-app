/**
 * TJU 教务系统课表 connector — Phase 2 占位
 * 上层 API 依赖此接口类型，Phase 1 的 MVP 手动/ICS/OCR 路径走 db 层，不经此 connector。
 */
import type { CasSession } from "./cas";

export interface TjuCourse {
  name: string;
  teacher?: string;
  location?: string;
  weekday: number; // 1-7
  startSlot: number; // 1-11
  endSlot: number; // 1-11
  weeks: number[];
  semester: string;
}

/**
 * 从教务系统抓取课表。Phase 2 实现。
 * 端点：classes.tju.edu.cn / oaa.tju.edu.cn
 */
export async function fetchScheduleFromTju(
  _session: CasSession,
  _semester?: string,
): Promise<TjuCourse[]> {
  throw new Error("Phase 2 not implemented — see docs/CONNECTORS.md");
}
