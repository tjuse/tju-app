"use client";

import type { GSScoreRecord, UGScoreRecord } from "@tju-app/eams-parsers";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchScore,
  isExtensionAvailable,
  loadScoreCache,
  type ScoreResult,
  saveScoreCache,
} from "@/lib/extension-bridge";
import type { TjuScoreRecord } from "@/lib/tju/types";
import { cn } from "@/lib/utils";

interface ClientScoreData {
  studentType: "undergraduate" | "graduate";
  scores: TjuScoreRecord[];
  cachedAt: string;
}

function mapUG(r: UGScoreRecord): TjuScoreRecord {
  return {
    semester: r.semester,
    course_id: r.course_id,
    name: r.name,
    course_type: r.course_type,
    credit: r.credit,
    score: r.score,
    course_props: r.course_props,
    gpa: r.gpa ? Number.parseFloat(r.gpa) : null,
  };
}

function mapGS(r: GSScoreRecord): TjuScoreRecord {
  return {
    semester: r.semester,
    course_id: r.course_id,
    name: r.name,
    course_type: r.course_type,
    credit: r.credit,
    score: r.score,
    class_id: r.class_id,
    exam_status: r.exam_status,
    is_in_plan: r.is_in_plan,
    is_credited: r.is_credited,
  };
}

/** Convert an extension ScoreResult into the view's shape, mapping by type. */
function toClient(result: ScoreResult, cachedAt: string): ClientScoreData {
  const scores =
    result.studentType === "graduate"
      ? (result.records as GSScoreRecord[]).map(mapGS)
      : (result.records as UGScoreRecord[]).map(mapUG);
  return { studentType: result.studentType, scores, cachedAt };
}

export function GradesView() {
  const [data, setData] = useState<ClientScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extensionReady, setExtensionReady] = useState<boolean | null>(null);

  // Hydrate from sessionStorage + detect the extension on mount.
  useEffect(() => {
    const cached = loadScoreCache();
    if (cached) setData(toClient(cached, ""));
    isExtensionAvailable().then(setExtensionReady);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const available = await isExtensionAvailable();
      setExtensionReady(available);
      if (!available) {
        setError("未检测到 tju.app 浏览器扩展，请先安装扩展并登录教务系统。");
        return;
      }
      const result = await fetchScore();
      saveScoreCache(result);
      setData(toClient(result, new Date().toISOString()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取失败，请重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  // Let the extension popup's "刷新" button trigger a refresh on this page.
  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener("tju-extension:refresh", handler);
    return () => window.removeEventListener("tju-extension:refresh", handler);
  }, [refresh]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {data && (
            <Badge variant="secondary" className="text-[12px]">
              {data.studentType === "graduate" ? "研究生" : "本科生"}
            </Badge>
          )}
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
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {loading ? "获取中…" : "从教务刷新"}
        </Button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3.5 py-2 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <SkeletonTable />
      ) : !data ? (
        <EmptyState extensionReady={extensionReady} onRefresh={refresh} />
      ) : (
        <ScoreTable scores={data.scores} studentType={data.studentType} />
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
    const list = bySemester.get(key) ?? [];
    list.push(s);
    bySemester.set(key, list);
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
    <div className="flex flex-col gap-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <Card className="px-3.5 py-3">
          <p className="text-[12px] text-[var(--color-text-mid)]">课程数</p>
          <p className="mt-1.5 font-display font-semibold text-[1.625rem] text-[var(--color-text-high)] leading-none tabular-nums">
            {scores.length}
          </p>
        </Card>
        <Card className="px-3.5 py-3">
          <p className="text-[12px] text-[var(--color-text-mid)]">总学分</p>
          <p className="mt-1.5 font-display font-semibold text-[1.625rem] text-[var(--color-text-high)] leading-none tabular-nums">
            {totalCredit.toFixed(1)}
          </p>
        </Card>
        {avgScore && (
          <Card className="px-3.5 py-3">
            <p className="text-[12px] text-[var(--color-text-mid)]">平均成绩</p>
            <p className="mt-1.5 font-display font-semibold text-[1.625rem] text-[var(--color-text-high)] leading-none tabular-nums">
              {avgScore}
            </p>
          </Card>
        )}
      </div>

      {/* Score list by semester */}
      {[...bySemester.entries()].map(([sem, list]) => (
        <Card key={sem} className="overflow-hidden p-0">
          <div className="panel-head">
            <span className="font-medium text-[13px] text-[var(--color-text-high)]">{sem}</span>
            <span className="font-mono text-[11px] text-[var(--color-text-low)] tabular-nums">
              {list.length} 门
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-[var(--color-border)] border-b text-[12px] text-[var(--color-text-low)]">
                  <th className="px-3.5 py-2 text-left font-medium">课程名称</th>
                  <th className="px-3.5 py-2 text-left font-medium">课程代码</th>
                  {studentType === "undergraduate" && (
                    <th className="px-3.5 py-2 text-left font-medium">课程性质</th>
                  )}
                  <th className="px-3.5 py-2 text-right font-medium">学分</th>
                  <th className="px-3.5 py-2 text-right font-medium">成绩</th>
                  {studentType === "undergraduate" && (
                    <th className="px-3.5 py-2 text-right font-medium">绩点</th>
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
                    <td className="px-3.5 py-2 font-medium text-[var(--color-text-high)]">
                      {s.name ?? "—"}
                    </td>
                    <td className="px-3.5 py-2 font-mono text-[var(--color-text-low)]">
                      {s.course_id ?? "—"}
                    </td>
                    {studentType === "undergraduate" && (
                      <td className="px-3.5 py-2 text-[var(--color-text-mid)]">
                        {s.course_props ?? s.course_type ?? "—"}
                      </td>
                    )}
                    <td className="px-3.5 py-2 text-right tabular-nums text-[var(--color-text-mid)]">
                      {s.credit ?? "—"}
                    </td>
                    <td className="px-3.5 py-2 text-right">
                      <ScoreBadge score={s.score} />
                    </td>
                    {studentType === "undergraduate" && (
                      <td className="px-3.5 py-2 text-right tabular-nums text-[var(--color-text-mid)]">
                        {s.gpa ?? "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
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
        high && "text-[var(--color-success)]",
        mid && "text-[var(--color-text-high)]",
        !high && !mid && !pass && "text-[var(--color-danger)]",
        pass && "text-[var(--color-success)]",
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
      <p className="font-medium text-[var(--color-text-high)]">暂无成绩数据</p>
      {notInstalled ? (
        <p className="max-w-sm text-[13px] text-[var(--color-text-mid)] text-pretty">
          需要安装 tju.app 浏览器扩展，并在浏览器中登录教务系统后，才能查看个人成绩。
        </p>
      ) : (
        <>
          <p className="text-[13px] text-[var(--color-text-mid)]">
            点击「从教务刷新」通过浏览器扩展获取成绩（需已登录教务系统）。
          </p>
          <Button onClick={onRefresh}>从教务获取成绩</Button>
        </>
      )}
    </div>
  );
}
