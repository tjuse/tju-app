import { Library, TrendingUp } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { CoursesTabs } from "@/features/courses/courses-tabs";
import { listSemesters, semesterLabel } from "@/features/courses/semesters";
import type { SemesterSnapshot } from "@/features/courses/trends";
import { computeCatalogTrend } from "@/features/courses/trends";
import { TrendsCharts } from "@/features/courses/trends-charts";
import { readCachedCourses } from "@/lib/tju/courses-store";

export const metadata = { title: "开课趋势" };
export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  // Load all semesters that have committed cache data.
  const allSemesters = listSemesters();
  const snapshots: SemesterSnapshot[] = (
    await Promise.all(
      allSemesters.map(async (s) => {
        const cached = await readCachedCourses(s.code);
        if (!cached) return null;
        const snap: SemesterSnapshot = {
          semester: s.code,
          label: semesterLabel(s.code),
          courses: cached.result.courses,
        };
        return snap;
      }),
    )
  ).filter((s): s is SemesterSnapshot => s !== null);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-5 md:px-8">
      <PageHeader
        title="公共课表"
        subtitle={`开课趋势 · ${snapshots.length} 个学期数据`}
        icon={Library}
      />
      <CoursesTabs />
      {snapshots.length < 2 ? (
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="需要至少 2 个学期的数据才能显示趋势"
            description={`当前仅有 ${snapshots.length} 个学期数据。请先到「浏览」页抓取更多学期的课程。`}
            action={
              <Link
                href="/courses"
                className="text-[13px] text-[var(--color-accent)] hover:underline"
              >
                去浏览页抓取 →
              </Link>
            }
          />
        </Card>
      ) : (
        <FadeIn>
          <TrendsContent snapshots={snapshots} />
        </FadeIn>
      )}
    </div>
  );
}

function TrendsContent({ snapshots }: { snapshots: SemesterSnapshot[] }) {
  const trend = computeCatalogTrend(snapshots);

  // Show only the most recent 6 semesters in the summary tiles.
  // The full 20-year history is visible in the charts below.
  const recentTiles = trend.total.slice(-6);

  return (
    <div className="flex flex-col gap-6">
      {/* Recent summary tiles (last 6 semesters) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] text-[var(--color-text-mid)]">最近学期</p>
          <p className="text-[12px] text-[var(--color-text-low)]">共 {trend.total.length} 个学期</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {recentTiles.map((p) => (
            <Card key={p.semester} className="px-4 py-3.5">
              <p className="truncate text-[11px] text-[var(--color-text-low)]">
                {semesterLabel(p.semester)}
              </p>
              <p className="mt-1 font-display font-semibold text-xl text-[var(--color-text-high)] tabular-nums">
                {p.count.toLocaleString()}
              </p>
              <p className="text-[11px] text-[var(--color-text-mid)]">门课程</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts (full history) */}
      <TrendsCharts trend={trend} />
    </div>
  );
}
