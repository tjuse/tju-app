import { BarChart3, Library } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { CoursesTabs } from "@/features/courses/courses-tabs";
import { currentSemesterCode, isValidSemester, semesterLabel } from "@/features/courses/semesters";
import { computeStats } from "@/features/courses/stats";
import { StatsCharts } from "@/features/courses/stats-charts";
import { readCachedCourses } from "@/lib/tju/courses-store";

export const metadata = { title: "课程统计" };
export const dynamic = "force-dynamic";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string }>;
}) {
  const sp = await searchParams;
  const semester =
    sp.semester && isValidSemester(sp.semester) ? sp.semester : currentSemesterCode();
  const cached = await readCachedCourses(semester);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 md:px-8">
      <PageHeader
        title="公共课表"
        subtitle={`课程统计 · ${semesterLabel(semester)}`}
        icon={Library}
      />
      <CoursesTabs />
      {!cached ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="该学期尚无数据"
            description="请先到「浏览」页抓取该学期课程，再来看统计。"
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
        <StatsContent semester={semester} courses={cached.result.courses} />
      )}
    </div>
  );
}

function StatsContent({
  courses,
}: {
  semester: string;
  courses: Parameters<typeof computeStats>[0];
}) {
  const stats = computeStats(courses);
  const tiles = [
    { label: "总课程", value: stats.total },
    { label: "本科", value: stats.undergraduate },
    { label: "研究生", value: stats.graduate },
    { label: "课程类别", value: stats.byCourseType.filter((t) => t.name !== "其他").length },
  ];

  return (
    <div className="flex flex-col gap-3">
      <FadeIn>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((t) => (
            <Card key={t.label} className="px-4 py-3.5">
              <p className="text-[12px] text-[var(--color-text-mid)]">{t.label}</p>
              <p className="mt-1.5 font-display font-semibold text-[1.75rem] text-[var(--color-text-high)] leading-none tabular-nums">
                {t.value}
              </p>
            </Card>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <StatsCharts stats={stats} />
      </FadeIn>
    </div>
  );
}
