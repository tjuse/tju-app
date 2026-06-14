"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoreWithMeta } from "@/lib/tju/score-store";
import type { TjuScoreRecord } from "@/lib/tju/types";
import { cn } from "@/lib/utils";

interface Props {
  /** Server-side pre-fetched data (null in demo mode or on cache miss). */
  initial: ScoreWithMeta | null;
  /** True when the app is running in demo/Vercel mode. */
  demoMode: boolean;
}

export function GradesView({ initial, demoMode }: Props) {
  const [data, setData] = useState<ScoreWithMeta | null>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/score?refresh=1");
      const body = await res.json();
      if (!res.ok) setError(body.error ?? "获取失败");
      else setData(body.data as ScoreWithMeta);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {data ? (
            <p className="text-[13px] text-[var(--color-text-mid)]">
              <span className="font-medium text-[var(--color-text-high)]">{data.student.name}</span>
              {" · "}
              {data.student_type === "graduate" ? "研究生" : "本科生"}
              {data.cachedAt && (
                <span className="ml-2 text-[var(--color-text-low)]">
                  · 更新于{" "}
                  {new Date(data.cachedAt).toLocaleString("zh-CN", {
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          ) : (
            <p className="text-[13px] text-[var(--color-text-low)]">暂无成绩数据</p>
          )}
        </div>
        {demoMode ? (
          <Badge variant="secondary" className="text-[12px]">
            演示模式 · 仅本地可刷新
          </Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            {loading ? "获取中…" : "从教务刷新"}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : !data ? (
        <EmptyState demoMode={demoMode} onRefresh={refresh} />
      ) : (
        <ScoreTable scores={data.scores} studentType={data.student_type} />
      )}
    </div>
  );
}

function ScoreTable({
  scores,
  studentType,
}: {
  scores: TjuScoreRecord[];
  studentType: "undergraduate" | "graduate";
}) {
  // Group by semester.
  const bySemester = new Map<string, TjuScoreRecord[]>();
  for (const s of scores) {
    const key = s.semester ?? "未知学期";
    if (!bySemester.has(key)) bySemester.set(key, []);
    // biome-ignore lint/style/noNonNullAssertion: key was just set above
    bySemester.get(key)!.push(s);
  }

  const totalCredit = scores.reduce((s, r) => s + (r.credit ?? 0), 0);
  const ugScores = scores.filter((s) => {
    const n = Number(s.score);
    return Number.isFinite(n) && n > 0;
  });
  const avgScore =
    ugScores.length > 0
      ? (ugScores.reduce((s, r) => s + Number(r.score), 0) / ugScores.length).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-[12px] text-[var(--color-text-mid)]">课程数</p>
          <p className="mt-1 font-bold text-2xl text-[var(--color-text-high)] tabular-nums">
            {scores.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[12px] text-[var(--color-text-mid)]">总学分</p>
          <p className="mt-1 font-bold text-2xl text-[var(--color-text-high)] tabular-nums">
            {totalCredit.toFixed(1)}
          </p>
        </Card>
        {avgScore && (
          <Card className="p-4">
            <p className="text-[12px] text-[var(--color-text-mid)]">平均成绩</p>
            <p className="mt-1 font-bold text-2xl text-[var(--color-text-high)] tabular-nums">
              {avgScore}
            </p>
          </Card>
        )}
      </div>

      {/* Score list by semester */}
      {[...bySemester.entries()].map(([sem, list]) => (
        <div key={sem}>
          <h3 className="mb-2 font-medium text-[13px] text-[var(--color-text-mid)]">{sem}</h3>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-[var(--color-border)] border-b text-[12px] text-[var(--color-text-low)]">
                    <th className="px-4 py-2.5 text-left font-medium">课程名称</th>
                    <th className="px-4 py-2.5 text-left font-medium">课程代码</th>
                    {studentType === "undergraduate" && (
                      <th className="px-4 py-2.5 text-left font-medium">课程性质</th>
                    )}
                    <th className="px-4 py-2.5 text-right font-medium">学分</th>
                    <th className="px-4 py-2.5 text-right font-medium">成绩</th>
                    {studentType === "undergraduate" && (
                      <th className="px-4 py-2.5 text-right font-medium">绩点</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {list.map((s, i) => (
                    <tr
                      // biome-ignore lint/suspicious/noArrayIndexKey: stable list in render
                      key={i}
                      className="border-[var(--color-border)] border-b last:border-0 hover:bg-[var(--color-bg-subtle)]"
                    >
                      <td className="px-4 py-2.5 font-medium text-[var(--color-text-high)]">
                        {s.name ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[var(--color-text-low)]">
                        {s.course_id ?? "—"}
                      </td>
                      {studentType === "undergraduate" && (
                        <td className="px-4 py-2.5 text-[var(--color-text-mid)]">
                          {s.course_props ?? s.course_type ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text-mid)]">
                        {s.credit ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <ScoreBadge score={s.score} />
                      </td>
                      {studentType === "undergraduate" && (
                        <td className="px-4 py-2.5 text-right tabular-nums text-[var(--color-text-mid)]">
                          {s.gpa ?? "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score }: { score: string | null }) {
  if (!score) return <span className="text-[var(--color-text-low)]">—</span>;
  const n = Number(score);
  const high = Number.isFinite(n) && n >= 85;
  const mid = Number.isFinite(n) && n >= 60 && n < 85;
  const pass = score === "通过";
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        high && "text-emerald-500",
        mid && "text-[var(--color-text-high)]",
        !high && !mid && !pass && "text-[var(--color-danger)]",
        pass && "text-emerald-500",
      )}
    >
      {score}
    </span>
  );
}

function SkeletonTable() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function EmptyState({ demoMode, onRefresh }: { demoMode: boolean; onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] py-20 text-center">
      <p className="font-medium text-[var(--color-text-high)]">暂无成绩数据</p>
      {demoMode ? (
        <p className="max-w-sm text-[13px] text-[var(--color-text-mid)] text-pretty">
          演示模式下无法获取个人成绩。请在本地/校园网环境下配置凭据后刷新。
        </p>
      ) : (
        <>
          <p className="text-[13px] text-[var(--color-text-mid)]">
            点击「从教务刷新」获取成绩（需校园网/VPN 及有效凭据）。
          </p>
          <Button onClick={onRefresh}>从教务获取成绩</Button>
        </>
      )}
    </div>
  );
}
