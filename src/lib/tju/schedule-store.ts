/**
 * Personal schedule cache (server-only). Combines live tju fetching with file
 * caching. Single-user: the current schedule is stored under a fixed cache key
 * and replaced on every refresh.
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

/** Read from cache only — no network call. Used by SSR pages. Returns null when empty. */
export async function readCachedSchedule(): Promise<ScheduleWithMeta | null> {
  const hit = await readCacheWithMeta<StoredSchedule>(CACHE_KEY);
  if (!hit) return null;
  return { ...hit.data, cachedAt: hit.cachedAt };
}

/** Live fetch + mapping + write cache. Requires campus network / VPN. Throws TjuError. */
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
