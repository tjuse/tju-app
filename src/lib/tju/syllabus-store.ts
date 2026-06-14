/**
 * 课程大纲存取（服务端）。按 lession_id 永久缓存（大纲基本不变），
 * 避免对学校系统重复请求（其有「请勿过快点击」限流）。
 */
import "server-only";
import { readCacheWithMeta, writeCache } from "@/lib/cache/file-cache";
import { fetchSyllabus } from "./client";

const cacheKey = (lessionId: string) => `syllabus-${lessionId}`;

export interface SyllabusResult {
  lessionId: string;
  syllabus: string;
  cachedAt: string;
}

/** 取大纲：优先缓存，未命中则抓取并缓存。抛 TjuError。 */
export async function getSyllabus(lessionId: string): Promise<SyllabusResult> {
  const hit = await readCacheWithMeta<{ syllabus: string }>(cacheKey(lessionId));
  if (hit) {
    return { lessionId, syllabus: hit.data.syllabus, cachedAt: hit.cachedAt };
  }
  const result = await fetchSyllabus(lessionId);
  await writeCache(cacheKey(lessionId), { syllabus: result.syllabus });
  return { lessionId, syllabus: result.syllabus, cachedAt: new Date().toISOString() };
}
