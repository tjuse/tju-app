import { CreditCard, Zap } from "lucide-react";
import { ComingSoonWidget } from "@/components/dashboard/widgets/coming-soon-widget";
import { Greeting } from "@/components/dashboard/widgets/greeting";
import { QuickLinksWidget } from "@/components/dashboard/widgets/quick-links-widget";
import { type LedgerStat, StatLedger } from "@/components/dashboard/widgets/stat-ledger";
import { TodayCoursesClient } from "@/components/dashboard/widgets/today-courses-client";
import { UpcomingEventsWidget } from "@/components/dashboard/widgets/upcoming-events-widget";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getUpcomingEvents, getWeekOfSemester } from "@/features/calendar/utils";
import { currentSemesterCode } from "@/features/courses/semesters";

export default function DashboardHome() {
  const semester = getCurrentSemester();
  const week = getWeekOfSemester(semester);
  const currentWeek = week ?? 1;
  const semesterCode = currentSemesterCode();

  const progress = week ? Math.round((week / semester.totalWeeks) * 100) : 0;
  const upcoming = getUpcomingEvents(semester, new Date(), 99);
  const examCount = upcoming.filter((e) => e.type === "exam").length;

  const stats: LedgerStat[] = [
    {
      label: "教学周",
      value: week ? String(week) : "假期",
      unit: week ? `/ ${semester.totalWeeks}` : undefined,
    },
    { label: "学期进度", value: String(progress), unit: "%" },
    { label: "临近考试", value: String(examCount), unit: "场", accent: examCount > 0 },
    { label: "校历纪事", value: String(upcoming.length), unit: "项" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
      <FadeIn>
        <Greeting />
      </FadeIn>

      <FadeIn delay={0.05} className="mt-5">
        <StatLedger items={stats} />
      </FadeIn>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <FadeIn delay={0.1}>
          <TodayCoursesClient semesterCode={semesterCode} currentWeek={currentWeek} />
        </FadeIn>
        <FadeIn delay={0.14}>
          <UpcomingEventsWidget />
        </FadeIn>
        <FadeIn delay={0.18}>
          <QuickLinksWidget />
        </FadeIn>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <FadeIn delay={0.22}>
          <ComingSoonWidget title="校园卡" icon={CreditCard} hint="余额与消费，Phase 2 上线" />
        </FadeIn>
        <FadeIn delay={0.26}>
          <ComingSoonWidget title="电费" icon={Zap} hint="宿舍电费余额，Phase 2 上线" />
        </FadeIn>
      </div>
    </div>
  );
}
