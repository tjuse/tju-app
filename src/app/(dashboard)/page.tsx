import { CreditCard, Zap } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { ComingSoonWidget } from "@/components/dashboard/widgets/coming-soon-widget";
import { Greeting } from "@/components/dashboard/widgets/greeting";
import { QuickLinksWidget } from "@/components/dashboard/widgets/quick-links-widget";
import { TodayCoursesClient } from "@/components/dashboard/widgets/today-courses-client";
import { UpcomingEventsWidget } from "@/components/dashboard/widgets/upcoming-events-widget";
import { WeekWidget } from "@/components/dashboard/widgets/week-widget";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { currentSemesterCode } from "@/features/courses/semesters";

export default function DashboardHome() {
  const currentWeek = getWeekOfSemester(getCurrentSemester()) ?? 1;
  const semesterCode = currentSemesterCode();

  return (
    <>
      <Header title="概览" />
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <Greeting />
        </FadeIn>

        {/* Bento grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FadeIn delay={0.05} className="md:col-span-1 md:row-span-2">
            <TodayCoursesClient semesterCode={semesterCode} currentWeek={currentWeek} />
          </FadeIn>

          <FadeIn delay={0.1}>
            <WeekWidget />
          </FadeIn>

          <FadeIn delay={0.15}>
            <ComingSoonWidget title="校园卡" icon={CreditCard} hint="余额与消费，Phase 2 上线" />
          </FadeIn>

          <FadeIn delay={0.2} className="md:col-span-1">
            <ComingSoonWidget title="电费" icon={Zap} hint="宿舍电费余额，Phase 2 上线" />
          </FadeIn>

          <FadeIn delay={0.25} className="md:col-span-2">
            <UpcomingEventsWidget />
          </FadeIn>

          <FadeIn delay={0.3} className="md:col-span-2">
            <QuickLinksWidget />
          </FadeIn>
        </div>
      </div>
    </>
  );
}
