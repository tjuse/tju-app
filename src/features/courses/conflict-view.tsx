"use client";

import { AlertTriangle, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TjuLibCourse } from "@/lib/tju/types";
import { cn } from "@/lib/utils";
import type { Conflict } from "./conflicts";
import { detectConflicts } from "./conflicts";
import { useFavorites } from "./favorites-store";
import { semesterLabel } from "./semesters";

const WEEKDAY = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export function ConflictView() {
  const favorites = useFavorites((s) => s.favorites);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const favList = useMemo(() => Object.values(favorites).map((f) => f.course), [favorites]);

  const conflicts = useMemo(() => (mounted ? detectConflicts(favList) : []), [mounted, favList]);

  if (!mounted) {
    return (
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)]" />
    );
  }

  const total = Object.keys(favorites).length;

  if (total === 0) {
    return <EmptyState kind="no-favorites" />;
  }

  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <Summary courses={favList} />
        <EmptyState kind="no-conflicts" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Summary courses={favList} />
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-[var(--color-warning)]" />
        <span className="font-medium text-[var(--color-text-high)] text-sm">
          发现 {conflicts.length} 处时间冲突
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {conflicts.map((c, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: conflict pairs are index-keyed
          <ConflictCard key={i} conflict={c} />
        ))}
      </div>
    </div>
  );
}

function Summary({ courses }: { courses: TjuLibCourse[] }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] px-3 py-2 text-[13px] text-[var(--color-text-mid)]">
      <Users className="size-4" />
      <span>
        正在分析 <span className="font-medium text-[var(--color-text-high)]">{courses.length}</span>{" "}
        门收藏课程
      </span>
    </div>
  );
}

function ConflictCard({ conflict }: { conflict: Conflict }) {
  const { a, b, conflictWeeks } = conflict;
  const weekStr =
    conflictWeeks.length <= 5
      ? `${conflictWeeks.join(", ")} 周`
      : `第 ${conflictWeeks[0]}-${conflictWeeks[conflictWeeks.length - 1]} 周（${conflictWeeks.length} 周）`;

  return (
    <Card className="border-[color-mix(in_srgb,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-bg-base)_97%,var(--color-warning)_3%)] p-3.5">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <CourseChip course={a.course} slot={a} />
            <span className="text-[13px] text-[var(--color-text-low)]">vs</span>
            <CourseChip course={b.course} slot={b} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[var(--color-text-mid)]">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {WEEKDAY[a.slot.weekday]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />第 {a.slot.startSlot}-{a.slot.endSlot} 节
            </span>
            <span>{weekStr}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CourseChip({ course, slot }: { course: TjuLibCourse; slot: Conflict["a"] }) {
  const isUG = course.student_type === "undergraduate";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <span className={cn("truncate font-medium text-sm", "text-[var(--color-text-high)]")}>
          {course.name ?? "未命名"}
        </span>
        <Badge variant={isUG ? "default" : "secondary"} className="shrink-0 text-[10px]">
          {isUG ? "本科" : "研究生"}
        </Badge>
      </div>
      <p className="mt-0.5 text-[11px] text-[var(--color-text-low)]">
        {semesterLabel(course.semester ?? "")}
        {slot.slot.location ? (
          <>
            {" "}
            <MapPin className="inline size-2.5" /> {slot.slot.location}
          </>
        ) : null}
      </p>
    </div>
  );
}

function EmptyState({ kind }: { kind: "no-favorites" | "no-conflicts" }) {
  if (kind === "no-favorites") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-20 text-center">
        <Users className="size-8 text-[var(--color-text-low)]" />
        <div>
          <p className="font-medium text-[var(--color-text-high)]">还没有收藏课程</p>
          <p className="mt-1 text-[13px] text-[var(--color-text-mid)]">
            先在「浏览」或「收藏」中收藏课程，再来检测时间冲突。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-base)_97%,var(--color-success)_3%)] py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]">
        <span className="text-2xl">✓</span>
      </div>
      <div>
        <p className="font-medium text-[var(--color-text-high)]">没有时间冲突</p>
        <p className="mt-1 text-[13px] text-[var(--color-text-mid)]">
          当前收藏的课程时间安排无冲突，可放心选课。
        </p>
      </div>
    </div>
  );
}
