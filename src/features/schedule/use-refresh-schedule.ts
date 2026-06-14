"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** 触发 /api/schedule?refresh=1 抓取，成功后刷新当前路由（重新 SSR）。 */
export function useRefreshSchedule() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/schedule?refresh=1");
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "刷新失败");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("网络错误，请重试");
      return false;
    } finally {
      setRefreshing(false);
    }
  }

  return { refreshing, error, refresh };
}
