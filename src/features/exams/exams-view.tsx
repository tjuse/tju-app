"use client";

import { SEMESTER } from "@tju-app/eams-parsers";
import { Calendar, Clock, MapPin, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { SemesterOption } from "@/features/courses/semesters";
import {
  fetchExam,
  isExtensionAvailable,
  loadExamCache,
  saveExamCache,
} from "@/lib/extension-bridge";
import type { TjuExamEntry } from "@/lib/tju/types";
import { cn } from "@/lib/utils";

interface Props {
  semesters: SemesterOption[];
  initialSemester: string;
}

interface ClientExamData {
  exams: TjuExamEntry[];
  cachedAt: string;
}

export function ExamsView({ semesters, initialSemester }: Props) {
  const [semester, setSemester] = useState(initialSemester);
  const [data, setData] = useState<ClientExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionReady, setExtensionReady] = useState<boolean | null>(null);

  // Hydrate from sessionStorage + detect the extension when the semester changes.
  useEffect(() => {
    const cached = loadExamCache(semester);
    setData(cached ? { exams: cached, cachedAt: "" } : null);
    isExtensionAvailable().then(setExtensionReady);
  }, [semester]);

  const refresh = useCallback(async (sem: string) => {
    setLoading(true);
    setError(null);
    try {
      const available = await isExtensionAvailable();
      setExtensionReady(available);
      if (!available) {
        setError("未检测到 tju.app 浏览器扩展，请先安装扩展并登录教务系统。");
        return;
      }
      const semesterId = SEMESTER[sem] ?? "";
      const exams = await fetchExam(semesterId);
      saveExamCache(sem, exams);
      setData({ exams, cachedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取失败，请重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleSemesterChange(sem: string) {
    setSemester(sem);
    setData(null);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={semester}
          onChange={(e) => handleSemesterChange(e.target.value)}
          aria-label="选择学期"
          className="min-w-44"
        >
          {semesters.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </Select>

        <Button variant="outline" size="sm" onClick={() => refresh(semester)} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {loading ? "获取中…" : "从教务刷新"}
        </Button>

        {data?.cachedAt && (
          <span className="text-[12px] text-[var(--color-text-low)]">
            更新于{" "}
            {new Date(data.cachedAt).toLocaleString("zh-CN", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data ? (
        <EmptyState extensionReady={extensionReady} onRefresh={() => refresh(semester)} />
      ) : data.exams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-16 text-center">
          <p className="text-[var(--color-text-mid)]">该学期暂无考试安排</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.exams.map((exam, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable list
            <ExamCard key={i} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({ exam }: { exam: TjuExamEntry }) {
  const dateStr = exam.exam_date
    ? new Date(exam.exam_date).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : null;
  const timeStr = exam.exam_time ? exam.exam_time.join(" – ") : null;
  const isPast = exam.exam_date ? new Date(exam.exam_date) < new Date() : false;

  return (
    <Card className={cn("p-4", isPast && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-[var(--color-text-high)]">{exam.name ?? "—"}</h3>
          {exam.class_id && (
            <p className="mt-0.5 font-mono text-[12px] text-[var(--color-text-low)]">
              {exam.class_id}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {exam.exam_type && <Badge variant="outline">{exam.exam_type}</Badge>}
          {exam.status && (
            <Badge variant={exam.status === "正常" ? "default" : "secondary"}>{exam.status}</Badge>
          )}
          {isPast && <Badge variant="secondary">已结束</Badge>}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[var(--color-text-mid)]">
        {dateStr && (
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {dateStr}
          </span>
        )}
        {timeStr && (
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {timeStr}
          </span>
        )}
        {exam.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5" />
            {exam.location}
            {exam.seat && <span className="text-[var(--color-text-low)]">· 座位 {exam.seat}</span>}
          </span>
        )}
      </div>

      {exam.exam_category && (
        <p className="mt-2 text-[12px] text-[var(--color-text-low)]">{exam.exam_category}</p>
      )}
      {exam.notice && (
        <p className="mt-1 text-[12px] text-[var(--color-text-low)]">{exam.notice}</p>
      )}
    </Card>
  );
}

function EmptyState({
  extensionReady,
  onRefresh,
}: {
  extensionReady: boolean | null;
  onRefresh: () => void;
}) {
  const notInstalled = extensionReady === false;
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-20 text-center">
      <p className="font-medium text-[var(--color-text-high)]">暂无考试数据</p>
      {notInstalled ? (
        <p className="max-w-sm text-[13px] text-[var(--color-text-mid)] text-pretty">
          需要安装 tju.app 浏览器扩展，并在浏览器中登录教务系统后，才能查看个人考试安排。
        </p>
      ) : (
        <>
          <p className="text-[13px] text-[var(--color-text-mid)]">
            点击「从教务刷新」通过浏览器扩展获取考试安排（需已登录教务系统）。
          </p>
          <Button onClick={onRefresh}>从教务获取考试安排</Button>
        </>
      )}
    </div>
  );
}
