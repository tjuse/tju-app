"use client";

import { SEMESTER } from "@tju-app/eams-parsers";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSchedule,
  isExtensionAvailable,
  loadScheduleCache,
  saveScheduleCache,
} from "@/lib/extension-bridge";
import type { Course } from "@/types";
import { mapScheduleEntries } from "./mapping";
import { ScheduleEmpty } from "./schedule-empty";
import { ScheduleView } from "./schedule-view";

interface Props {
  /** 5-digit semester code, e.g. "25261". */
  semesterCode: string;
  /** Human-readable semester name for display. */
  semesterName: string;
  currentWeek: number;
}

/**
 * Client container for the personal timetable. Reads from the browser
 * extension (and sessionStorage) — no server-side EAMS fetching, so it works on
 * any deployment (Vercel / Netlify) without Python or campus-network access.
 */
export function ScheduleClient({ semesterCode, semesterName, currentWeek }: Props) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [cachedAt, setCachedAt] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionReady, setExtensionReady] = useState<boolean | null>(null);

  // On mount: hydrate from sessionStorage + detect the extension.
  useEffect(() => {
    const cached = loadScheduleCache(semesterCode);
    if (cached) setCourses(mapScheduleEntries(cached, semesterCode));
    isExtensionAvailable().then(setExtensionReady);
  }, [semesterCode]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const available = await isExtensionAvailable();
      setExtensionReady(available);
      if (!available) {
        setError("未检测到 tju.app 浏览器扩展，请先安装扩展并登录教务系统。");
        return;
      }
      const semesterId = SEMESTER[semesterCode] ?? "";
      const entries = await fetchSchedule(semesterId);
      saveScheduleCache(semesterCode, entries);
      setCourses(mapScheduleEntries(entries, semesterCode));
      setCachedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "抓取失败，请重试。");
    } finally {
      setRefreshing(false);
    }
  }, [semesterCode]);

  // Let the extension popup's "刷新" button trigger a refresh on this page.
  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener("tju-extension:refresh", handler);
    return () => window.removeEventListener("tju-extension:refresh", handler);
  }, [refresh]);

  if (courses && courses.length > 0) {
    return (
      <ScheduleView
        courses={courses}
        semester={semesterName}
        currentWeek={currentWeek}
        cachedAt={cachedAt}
        onRefresh={refresh}
        refreshing={refreshing}
        error={error}
      />
    );
  }

  return (
    <ScheduleEmpty
      onRefresh={refresh}
      refreshing={refreshing}
      error={error}
      extensionReady={extensionReady}
    />
  );
}
