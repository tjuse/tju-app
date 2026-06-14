/**
 * Score cache (server-only). Stores the full grade history in a per-user file
 * cache. Personal data — never committed to the repository.
 */
import "server-only";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import { DEMO_MODE_MESSAGE, isLiveFetchAvailable } from "@/lib/runtime";
import { fetchScore } from "./client";
import type { TjuScoreResult } from "./types";
import { TjuError } from "./types";

const CACHE_KEY = "score-current";

export interface ScoreWithMeta extends TjuScoreResult {
  cachedAt: string;
}

/** Read cached scores. Returns null when no cache exists. Never spawns. */
export async function readCachedScore(): Promise<ScoreWithMeta | null> {
  const hit = await readCacheWithMeta<TjuScoreResult>(CACHE_KEY);
  if (!hit) return null;
  return { ...hit.data, cachedAt: hit.cachedAt };
}

/**
 * Fetch grades from EAMS and write to cache.
 * Throws TjuError("usage") in demo mode instead of spawning.
 */
export async function refreshScore(): Promise<ScoreWithMeta> {
  if (!isLiveFetchAvailable()) {
    throw new TjuError(DEMO_MODE_MESSAGE, "usage");
  }
  const result = await fetchScore();
  await writeCache(CACHE_KEY, result);
  const hit = await readCacheWithMeta<TjuScoreResult>(CACHE_KEY);
  return { ...result, cachedAt: hit?.cachedAt ?? new Date().toISOString() };
}
