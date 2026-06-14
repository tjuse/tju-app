/**
 * Exam schedule cache (server-only). Per-semester file cache.
 * Personal data — never committed to the repository.
 */
import "server-only";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import { DEMO_MODE_MESSAGE, isLiveFetchAvailable } from "@/lib/runtime";
import { fetchExam } from "./client";
import type { TjuExamResult } from "./types";
import { TjuError } from "./types";

const cacheKey = (semester: string) => `exam-${semester}`;

export interface ExamWithMeta extends TjuExamResult {
  cachedAt: string;
}

/**
 * Read cached exam schedule for a semester. Returns null when no cache exists.
 * Never spawns.
 */
export async function readCachedExam(semester: string): Promise<ExamWithMeta | null> {
  const hit = await readCacheWithMeta<TjuExamResult>(cacheKey(semester));
  if (!hit) return null;
  return { ...hit.data, cachedAt: hit.cachedAt };
}

/**
 * Fetch exam schedule from EAMS and write to cache.
 * Throws TjuError("usage") in demo mode instead of spawning.
 */
export async function refreshExam(semester?: string): Promise<ExamWithMeta> {
  if (!isLiveFetchAvailable()) {
    throw new TjuError(DEMO_MODE_MESSAGE, "usage");
  }
  const result = await fetchExam(semester);
  await writeCache(cacheKey(result.semester), result);
  const hit = await readCacheWithMeta<TjuExamResult>(cacheKey(result.semester));
  return { ...result, cachedAt: hit?.cachedAt ?? new Date().toISOString() };
}
