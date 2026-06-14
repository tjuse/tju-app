/**
 * Syllabus cache (server-only). Cached permanently per lession_id since
 * syllabi rarely change and the TJU system rate-limits rapid requests
 * ("请勿过快点击"). In demo mode a cache miss returns null instead of
 * attempting a live fetch.
 */
import "server-only";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import { DEMO_MODE_MESSAGE, isLiveFetchAvailable } from "@/lib/runtime";
import { fetchSyllabus } from "./client";
import { TjuError } from "./types";

const cacheKey = (lessionId: string) => `syllabus-${lessionId}`;

export interface SyllabusResult {
  lessionId: string;
  syllabus: string;
  cachedAt: string;
}

/**
 * Return the syllabus for a given lession_id.
 * Cache-first: reads from disk, falls back to live fetch (needs campus net).
 * In demo mode, throws TjuError("usage") on cache miss rather than spawning.
 * Throws TjuError on all other failures.
 */
export async function getSyllabus(lessionId: string): Promise<SyllabusResult> {
  const hit = await readCacheWithMeta<{ syllabus: string }>(cacheKey(lessionId));
  if (hit) {
    return { lessionId, syllabus: hit.data.syllabus, cachedAt: hit.cachedAt };
  }
  // Cache miss — guard against spawning in demo mode.
  if (!isLiveFetchAvailable()) {
    throw new TjuError(DEMO_MODE_MESSAGE, "usage");
  }
  const result = await fetchSyllabus(lessionId);
  await writeCache(cacheKey(lessionId), { syllabus: result.syllabus });
  return { lessionId, syllabus: result.syllabus, cachedAt: new Date().toISOString() };
}
