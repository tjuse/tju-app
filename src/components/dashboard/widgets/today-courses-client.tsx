"use client";

import { useEffect, useState } from "react";
import { mapScheduleEntries } from "@/features/schedule/mapping";
import { getTodayCourses } from "@/features/schedule/utils";
import { loadScheduleCache } from "@/lib/extension-bridge";
import type { CourseWithTime } from "@/types";
import { TodayCoursesWidget } from "./today-courses-widget";

interface Props {
  /** 5-digit semester code, e.g. "25261". */
  semesterCode: string;
  currentWeek: number;
}

/**
 * Client wrapper that reads the personal schedule from the browser extension's
 * sessionStorage cache (populated on the /schedule page) and renders today's
 * courses. No server-side data — works on any deployment.
 */
export function TodayCoursesClient({ semesterCode, currentWeek }: Props) {
  const [courses, setCourses] = useState<CourseWithTime[]>([]);
  const [hasSchedule, setHasSchedule] = useState(false);

  useEffect(() => {
    const cached = loadScheduleCache(semesterCode);
    if (!cached) return;
    setHasSchedule(true);
    setCourses(getTodayCourses(mapScheduleEntries(cached, semesterCode), currentWeek));
  }, [semesterCode, currentWeek]);

  return <TodayCoursesWidget courses={courses} hasSchedule={hasSchedule} />;
}
