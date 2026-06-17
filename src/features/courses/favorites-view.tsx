"use client";

import { Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { TjuLibCourse } from "@/lib/tju/types";
import { CourseCard } from "./course-card";
import { CourseDetailDialog } from "./course-detail-dialog";
import { useFavorites } from "./favorites-store";
import { semesterLabel } from "./semesters";

export function FavoritesView() {
  const favorites = useFavorites((s) => s.favorites);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<TjuLibCourse | null>(null);
  const [detailSemester, setDetailSemester] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const items = useMemo(() => {
    const list = Object.values(favorites).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((f) => {
      const c = f.course;
      return [c.name, c.course_id, ...(c.teacher ?? [])].some((h) =>
        h?.toLowerCase().includes(needle),
      );
    });
  }, [favorites, q]);

  if (!mounted) {
    return (
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)]" />
    );
  }

  const total = Object.keys(favorites).length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]">
          <Star className="size-6 text-[var(--color-text-low)]" />
        </div>
        <div>
          <p className="font-medium text-[var(--color-text-high)]">还没有收藏课程</p>
          <p className="mt-1 text-[13px] text-[var(--color-text-mid)]">
            在「浏览」中点课程卡右上角的 ☆ 即可收藏，方便随时查看与对比。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--color-text-low)]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="在收藏中搜索"
            className="pl-9"
          />
        </div>
        <span className="text-[13px] text-[var(--color-text-mid)]">共 {total} 门收藏</span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.lessionId} className="flex flex-col gap-1">
            <CourseCard
              course={f.course}
              semester={f.semester}
              onOpen={(c) => {
                setDetail(c);
                setDetailSemester(f.semester);
                setOpen(true);
              }}
            />
            <span className="px-1 text-[11px] text-[var(--color-text-low)]">
              {semesterLabel(f.semester)}
            </span>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-12 text-center text-[var(--color-text-mid)] text-sm">没有匹配的收藏</p>
      )}

      <CourseDetailDialog
        course={detail}
        semester={detailSemester}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}
