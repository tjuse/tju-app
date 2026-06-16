"use client";

import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Course } from "@/types";
import { Timetable } from "./timetable";

interface ScheduleViewProps {
  courses: Course[];
  semester: string;
  currentWeek: number;
  studentName?: string | null;
  cachedAt?: string;
  onRefresh: () => void;
  refreshing: boolean;
  error: string | null;
}

const MAX_WEEK = 25;

export function ScheduleView({
  courses,
  semester,
  currentWeek,
  studentName,
  cachedAt,
  onRefresh,
  refreshing,
  error,
}: ScheduleViewProps) {
  const [week, setWeek] = useState(Math.min(Math.max(currentWeek, 1), MAX_WEEK));

  const cachedLabel = cachedAt
    ? new Date(cachedAt).toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* 周次切换 */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="上一周"
            onClick={() => setWeek((w) => Math.max(1, w - 1))}
            disabled={week <= 1}
          >
            <ChevronLeft />
          </Button>
          <div className="flex min-w-20 flex-col items-center">
            <span className="font-semibold text-[var(--color-text-high)] text-sm">
              第 {week} 周
            </span>
            {week === currentWeek && (
              <span className="text-[10px] text-[var(--color-accent)]">本周</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="下一周"
            onClick={() => setWeek((w) => Math.min(MAX_WEEK, w + 1))}
            disabled={week >= MAX_WEEK}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* 元信息 + 刷新 */}
        <div className="flex items-center gap-3">
          {cachedLabel && (
            <span className="text-[12px] text-[var(--color-text-low)]">更新于 {cachedLabel}</span>
          )}
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            {refreshing ? "抓取中…" : "从教务刷新"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <Card className="p-4">
        <Timetable courses={courses} week={week} />
      </Card>

      <p className="mt-3 text-[12px] text-[var(--color-text-low)]">
        {semester} · {courses.length} 段课程
        {studentName ? ` · ${studentName}` : ""}
      </p>
    </div>
  );
}
