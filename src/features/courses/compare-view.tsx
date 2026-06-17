"use client";

/**
 * Course comparison view — side-by-side table for up to 4 selected courses.
 * Columns: one per course. Rows: key attributes for easy comparison.
 */

import { GitCompare, X } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TjuLibCourse } from "@/lib/tju/types";
import { MAX_COMPARE_COURSES, useCompare } from "./compare-store";

// ─── Arrange label helper ─────────────────────────────────────────────────────

const WEEKDAY_LABEL = ["一", "二", "三", "四", "五", "六", "日"];

function arrangeLabel(course: TjuLibCourse): string {
  if (!course.arrange?.length) return "—";
  return course.arrange
    .map((a) => {
      const day = a.weekday ? `周${WEEKDAY_LABEL[a.weekday - 1]}` : "?";
      const units = a.unit?.length ? `第 ${a.unit[0]}–${a.unit[a.unit.length - 1]} 节` : "";
      const weeks = a.week?.length ? `第 ${a.week[0]}–${a.week[a.week.length - 1]} 周` : "";
      return [day, units, weeks].filter(Boolean).join(" ");
    })
    .join(" / ");
}

// ─── Comparison rows definition ───────────────────────────────────────────────

interface CompareRow {
  label: string;
  render: (c: TjuLibCourse) => React.ReactNode;
}

const ROWS: CompareRow[] = [
  {
    label: "课程代码",
    render: (c) => <span className="font-mono text-[12px]">{c.course_id ?? "—"}</span>,
  },
  {
    label: "学分",
    render: (c) => (
      <span className="font-semibold text-[var(--color-accent)]">{c.credit ?? "—"}</span>
    ),
  },
  {
    label: "总学时",
    render: (c) => <span>{c.hours != null ? `${c.hours} 学时` : "—"}</span>,
  },
  {
    label: "周学时",
    render: (c) => <span>{c.week_hours != null ? `${c.week_hours} 学时/周` : "—"}</span>,
  },
  {
    label: "教师",
    render: (c) =>
      c.teacher?.length ? (
        <span>{c.teacher.join("、")}</span>
      ) : (
        <span className="text-[var(--color-text-low)]">—</span>
      ),
  },
  {
    label: "校区",
    render: (c) => <span>{c.campus ?? "—"}</span>,
  },
  {
    label: "课程类型",
    render: (c) =>
      c.course_type?.length ? (
        <div className="flex flex-wrap gap-1">
          {c.course_type.map((t) => (
            <Badge key={t} variant="outline" className="text-[11px]">
              {t}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-[var(--color-text-low)]">—</span>
      ),
  },
  {
    label: "适用对象",
    render: (c) => (
      <Badge variant={c.student_type === "undergraduate" ? "default" : "secondary"}>
        {c.student_type === "undergraduate" ? "本科" : "研究生"}
      </Badge>
    ),
  },
  {
    label: "上课安排",
    render: (c) => (
      <span className="text-[12px] text-[var(--color-text-mid)]">{arrangeLabel(c)}</span>
    ),
  },
  {
    label: "选课人数",
    render: (c) =>
      c.selected != null ? (
        <span>
          {c.selected}
          {c.limit != null ? ` / ${c.limit}` : ""}
        </span>
      ) : (
        <span className="text-[var(--color-text-low)]">—</span>
      ),
  },
  {
    label: "有大纲",
    render: (c) =>
      c.has_syllabus ? (
        <Badge className="border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[11px] text-[var(--color-success)]">
          有
        </Badge>
      ) : (
        <span className="text-[var(--color-text-low)]">无</span>
      ),
  },
  {
    label: "开课学期",
    render: (c) => <span className="font-mono text-[12px]">{c.semester ?? "—"}</span>,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export function CompareView() {
  const { courses, remove, clear } = useCompare();

  if (courses.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-20 text-center">
        <GitCompare className="size-8 text-[var(--color-text-low)]" />
        <p className="font-medium text-[var(--color-text-high)]">还没有选择要对比的课程</p>
        <p className="text-[13px] text-[var(--color-text-mid)]">
          在「浏览」或「收藏」页面点击课程卡片上的对比按钮（最多 {MAX_COMPARE_COURSES} 门）
        </p>
        <Link href="/courses" className="text-[13px] text-[var(--color-accent)] hover:underline">
          去浏览课程 →
        </Link>
      </Card>
    );
  }

  return (
    <FadeIn>
      <div className="flex flex-col gap-3">
        {/* Header: selected courses + clear */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-[var(--color-text-mid)]">
            已选 {courses.length} / {MAX_COMPARE_COURSES} 门课程
          </p>
          <button
            type="button"
            onClick={clear}
            className="text-[13px] text-[var(--color-text-low)] transition-colors hover:text-[var(--color-danger)]"
          >
            清空对比
          </button>
        </div>

        {/* Comparison table — scrollable horizontally on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                {/* Row label column */}
                <th className="w-24 py-2 pr-3 text-left text-[12px] font-medium text-[var(--color-text-low)]" />
                {courses.map((c) => (
                  <th
                    key={c.lession_id}
                    className="min-w-[180px] border-l border-[var(--color-border)] px-4 py-2 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[var(--color-text-high)] leading-snug">
                        {c.name}
                      </span>
                      <button
                        type="button"
                        aria-label={`移除 ${c.name}`}
                        onClick={() => remove(c.lession_id ?? "")}
                        className="mt-0.5 shrink-0 rounded p-0.5 text-[var(--color-text-low)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-high)]"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)]"
                >
                  <td className="py-2 pr-3 text-[12px] font-medium text-[var(--color-text-low)]">
                    {row.label}
                  </td>
                  {courses.map((c) => (
                    <td
                      key={c.lession_id}
                      className="border-l border-[var(--color-border)] px-4 py-2 text-[var(--color-text-high)]"
                    >
                      {row.render(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeIn>
  );
}
