import Link from "next/link";
import { Header } from "@/components/dashboard/header";
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
    <>
      <Header title="公共课表" subtitle={`开课趋势 · ${snapshots.length} 个学期数据`} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
        <CoursesTabs />
        {snapshots.length < 2 ? (
          <Card className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-medium text-[var(--color-text-high)]">
              需要至少 2 个学期的数据才能显示趋势
            </p>
            <p className="text-[13px] text-[var(--color-text-mid)]">
              当前仅有 {snapshots.length} 个学期数据。请先到「浏览」页抓取更多学期的课程。
            </p>
            <Link
              href="/courses"
              className="text-[13px] text-[var(--color-accent)] hover:underline"
            >
              去浏览页抓取 →
            </Link>
          </Card>
        ) : (
          <FadeIn>
            <TrendsContent snapshots={snapshots} />
          </FadeIn>
        )}
      </div>
    </>
  );
}

function TrendsContent({ snapshots }: { snapshots: SemesterSnapshot[] }) {
  const trend = computeCatalogTrend(snapshots);

  return (
    <div className="flex flex-col gap-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trend.total.map((p) => (
          <Card key={p.semester} className="p-4">
            <p className="truncate text-[11px] text-[var(--color-text-low)]">
              {semesterLabel(p.semester)}
            </p>
            <p className="mt-1 font-bold text-2xl text-[var(--color-text-high)] tabular-nums">
              {p.count}
            </p>
            <p className="text-[11px] text-[var(--color-text-mid)]">门课程</p>
          </Card>
        ))}
      </div>
      <TrendsCharts trend={trend} />
    </div>
  );
}
