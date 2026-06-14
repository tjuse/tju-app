"use client";

import { ChevronLeft, ChevronRight, Download, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { CoursesPage } from "@/lib/tju/courses-store";
import { cn } from "@/lib/utils";
import { CourseCard } from "./course-card";
import type { StuTypeFilter } from "./filter";
import type { SemesterOption } from "./semesters";

const PAGE_SIZE = 30;

interface Props {
  semesters: SemesterOption[];
  initialSemester: string;
  initial: CoursesPage | null;
}

export function CoursesBrowser({ semesters, initialSemester, initial }: Props) {
  const [semester, setSemester] = useState(initialSemester);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [stuType, setStuType] = useState<StuTypeFilter>("all");
  const [campus, setCampus] = useState("");
  const [courseType, setCourseType] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<CoursesPage | null>(initial);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstRun = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  // 搜索防抖（关键词变化时回到第 1 页）
  useEffect(() => {
    const t = setTimeout(() => {
      setQDebounced(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        semester,
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (qDebounced) params.set("q", qDebounced);
      if (stuType !== "all") params.set("stuType", stuType);
      if (campus) params.set("campus", campus);
      if (courseType) params.set("courseType", courseType);
      const res = await fetch(`/api/courses?${params}`, { signal: ac.signal });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "加载失败");
      } else {
        setData(body.data as CoursesPage | null);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [semester, page, qDebounced, stuType, campus, courseType]);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return; // 首屏用 SSR 的 initial，避免重复请求
    }
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`/api/courses?semester=${semester}&refresh=1`);
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "抓取失败");
      } else {
        await load();
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setRefreshing(false);
    }
  }

  const facets = data?.facets;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const cachedLabel = data?.meta.cachedAt
    ? new Date(data.meta.cachedAt).toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div>
      {/* 工具栏 */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setPage(1);
            }}
            aria-label="选择学期"
            className="min-w-44"
          >
            {semesters.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </Select>

          <div className="relative min-w-52 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--color-text-low)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索课程名 / 课程号 / 教师"
              className="pl-9"
            />
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            {refreshing ? "抓取中…" : "从教务刷新"}
          </Button>
        </div>

        {/* 筛选 */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={stuType}
            onChange={(e) => {
              setStuType(e.target.value as StuTypeFilter);
              setPage(1);
            }}
            aria-label="学生类型"
          >
            <option value="all">全部类型</option>
            <option value="undergraduate">本科</option>
            <option value="graduate">研究生</option>
          </Select>

          <Select
            value={campus}
            onChange={(e) => {
              setCampus(e.target.value);
              setPage(1);
            }}
            aria-label="校区"
          >
            <option value="">全部校区</option>
            {facets?.campuses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            value={courseType}
            onChange={(e) => {
              setCourseType(e.target.value);
              setPage(1);
            }}
            aria-label="课程类别"
            className="max-w-52"
          >
            <option value="">全部类别</option>
            {facets?.courseTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="mt-4 flex items-center justify-between text-[13px] text-[var(--color-text-mid)]">
        <span>
          {data ? `共 ${data.total} 门` : "—"}
          {data && data.total > 0 ? ` · 第 ${data.page}/${totalPages} 页` : ""}
        </span>
        {cachedLabel && (
          <span className="text-[12px] text-[var(--color-text-low)]">更新于 {cachedLabel}</span>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* 内容 */}
      <div className="mt-4">
        {data === null ? (
          <EmptyNoCache refreshing={refreshing} onRefresh={handleRefresh} />
        ) : loading ? (
          <SkeletonGrid />
        ) : data.items.length === 0 ? (
          <p className="py-16 text-center text-[var(--color-text-mid)] text-sm">
            没有匹配的课程，试试调整筛选条件
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((c) => (
              <CourseCard key={`${c.course_id}-${c.class_id}-${c.lession_id}`} course={c} />
            ))}
          </div>
        )}
      </div>

      {/* 分页 */}
      {data && data.total > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="size-4" />
            上一页
          </Button>
          <span className="text-[13px] text-[var(--color-text-mid)] tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            下一页
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 静态骨架占位
        <Skeleton key={i} className="h-44 w-full" />
      ))}
    </div>
  );
}

function EmptyNoCache({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)]">
        <Download className="size-6 text-[var(--color-accent)]" />
      </div>
      <div>
        <p className="font-medium text-[var(--color-text-high)]">该学期尚未抓取</p>
        <p className="mt-1 max-w-sm text-[13px] text-[var(--color-text-mid)] text-pretty">
          点击「从教务抓取」获取该学期全校课程（本科 + 研究生，数千门，约需十几秒）。 需校园网或
          VPN。
        </p>
      </div>
      <Button onClick={onRefresh} disabled={refreshing}>
        <Download className={cn("size-4", refreshing && "animate-pulse")} />
        {refreshing ? "抓取中…" : "从教务抓取该学期课程"}
      </Button>
    </div>
  );
}
