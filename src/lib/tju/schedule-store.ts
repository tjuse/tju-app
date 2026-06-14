/**
 * 课表存取（服务端）。组合 tju 抓取 + 文件缓存。
 * 自用单用户：当前课表缓存在固定 key 下；刷新即重新抓取覆盖。
 */
import "server-only";
import { mapTjuSchedule } from "@/features/schedule/mapping";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import type { Course } from "@/types";
import { fetchSchedule } from "./client";
import type { TjuStudent } from "./types";

const CACHE_KEY = "schedule-current";

export interface StoredSchedule {
  courses: Course[];
  student: TjuStudent;
  semester: string;
}

export interface ScheduleWithMeta extends StoredSchedule {
  cachedAt: string;
}

/** 仅读缓存，不触发网络。页面 SSR 用。无缓存返回 null。 */
export async function readCachedSchedule(): Promise<ScheduleWithMeta | null> {
  const hit = await readCacheWithMeta<StoredSchedule>(CACHE_KEY);
  if (!hit) return null;
  return { ...hit.data, cachedAt: hit.cachedAt };
}

/** 实时抓取 + 映射 + 写缓存。需校园网/VPN。抛 TjuError。 */
export async function refreshSchedule(semester?: string): Promise<ScheduleWithMeta> {
  const result = await fetchSchedule(semester);
  const stored: StoredSchedule = {
    courses: mapTjuSchedule(result),
    student: result.student,
    semester: result.semester,
  };
  await writeCache(CACHE_KEY, stored);
  const hit = await readCacheWithMeta<StoredSchedule>(CACHE_KEY);
  return { ...stored, cachedAt: hit?.cachedAt ?? new Date().toISOString() };
}
