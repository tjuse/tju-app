/**
 * Minimal file-based JSON cache (no database). Server-only.
 * Files are stored at `data/cache/<key>.json` with a write-time timestamp.
 * Supports an optional TTL; omitting it means "never expire" (manual-refresh
 * model).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

interface CacheEnvelope<T> {
  cachedAt: string; // ISO timestamp
  data: T;
}

function cachePath(key: string): string {
  // Strip non-alphanumeric characters to prevent path traversal.
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(CACHE_DIR, `${safe}.json`);
}

/**
 * Read from the cache. Returns null on miss or when the entry is older than
 * maxAgeMs. Omitting maxAgeMs means "never expire" (manual-refresh model).
 */
export async function readCache<T>(key: string, maxAgeMs?: number): Promise<T | null> {
  try {
    const raw = await readFile(cachePath(key), "utf-8");
    const env = JSON.parse(raw) as CacheEnvelope<T>;
    if (maxAgeMs != null) {
      const age = Date.now() - new Date(env.cachedAt).getTime();
      if (age > maxAgeMs) return null;
    }
    return env.data;
  } catch {
    return null;
  }
}

/** Read the cached value together with the write-time timestamp (for "last updated" UI). */
export async function readCacheWithMeta<T>(
  key: string,
): Promise<{ data: T; cachedAt: string } | null> {
  try {
    const raw = await readFile(cachePath(key), "utf-8");
    const env = JSON.parse(raw) as CacheEnvelope<T>;
    return { data: env.data, cachedAt: env.cachedAt };
  } catch {
    return null;
  }
}

/** Write a value to the cache. */
export async function writeCache<T>(key: string, data: T): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const env: CacheEnvelope<T> = { cachedAt: new Date().toISOString(), data };
  await writeFile(cachePath(key), JSON.stringify(env, null, 2), "utf-8");
}
