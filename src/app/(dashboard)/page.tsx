import {
  CalendarClock,
  CalendarRange,
  CreditCard,
  NotebookPen,
  TrendingUp,
  Zap,
} from "lucide-react";
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
  const exams = upcoming.filter((e) => e.type === "exam");
  const examCount = exams.length;
  const nextExam = exams[0];
  const nextEvent = upcoming[0];

  // Genuine ascending series: cumulative progress through the weeks elapsed.
  const weekSeries = week ? Array.from({ length: Math.max(week, 2) }, (_, i) => i + 1) : undefined;
  const progressSeries = week
    ? Array.from({ length: Math.max(week, 2) }, (_, i) =>
        Math.round(((i + 1) / semester.totalWeeks) * 100),
      )
    : undefined;
  const perWeek = Math.round(100 / semester.totalWeeks);

  const stats: LedgerStat[] = [
    {
      label: "教学周",
      value: week ? String(week) : "假期",
      unit: week ? `/ ${semester.totalWeeks}` : undefined,
      icon: CalendarRange,
      tone: "accent",
      status: { tone: week ? "success" : "neutral" },
      series: weekSeries,
    },
    {
      label: "学期进度",
      value: String(progress),
      unit: "%",
      icon: TrendingUp,
      tone: "success",
      delta: week ? { label: `+${perWeek}% / 周`, dir: "up" } : undefined,
      series: progressSeries,
    },
    {
      label: "临近考试",
      value: String(examCount),
      unit: "场",
      icon: NotebookPen,
      tone: "warning",
      accent: examCount > 0,
      status: { tone: examCount > 0 ? "warning" : "neutral" },
      footnote: nextExam ? `下一场 ${nextExam.startDate}` : "本学期暂无考试",
    },
    {
      label: "校历纪事",
      value: String(upcoming.length),
      unit: "项",
      icon: CalendarClock,
      tone: "accent",
      delta: { label: "待办", dir: "flat" },
      footnote: nextEvent ? `最近 ${nextEvent.title}` : undefined,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-5 md:px-8">
      <FadeIn>
        <Greeting subtitle={`${semester.name} · ${week ? `第 ${week} 周` : "假期中"}`} />
      </FadeIn>

      <FadeIn delay={0.05} className="mt-4">
        <StatLedger items={stats} />
      </FadeIn>

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="mt-2.5 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
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
