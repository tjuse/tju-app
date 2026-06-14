/**
 * 极简文件 JSON 缓存（替代数据库）。仅服务端使用。
 * 数据落在 `data/cache/<key>.json`，含写入时间戳，可选 TTL。
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

interface CacheEnvelope<T> {
  cachedAt: string; // ISO 时间戳
  data: T;
}

function cachePath(key: string): string {
  // 防目录穿越：只保留安全字符
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
  return path.join(CACHE_DIR, `${safe}.json`);
}

/**
 * 读取缓存。未命中或已过期（超过 maxAgeMs）返回 null。
 * maxAgeMs 省略表示永不过期（手动刷新模式）。
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

/** 读取缓存及其写入时间（用于在 UI 显示"最后更新于"）。 */
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

/** 写入缓存。 */
export async function writeCache<T>(key: string, data: T): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const env: CacheEnvelope<T> = { cachedAt: new Date().toISOString(), data };
  await writeFile(cachePath(key), JSON.stringify(env, null, 2), "utf-8");
}
