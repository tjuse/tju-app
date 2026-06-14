import { CreditCard, Zap } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { ComingSoonWidget } from "@/components/dashboard/widgets/coming-soon-widget";
import { Greeting } from "@/components/dashboard/widgets/greeting";
import { QuickLinksWidget } from "@/components/dashboard/widgets/quick-links-widget";
import { TodayCoursesWidget } from "@/components/dashboard/widgets/today-courses-widget";
import { UpcomingEventsWidget } from "@/components/dashboard/widgets/upcoming-events-widget";
import { WeekWidget } from "@/components/dashboard/widgets/week-widget";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { getTodayCourses } from "@/features/schedule/utils";
import { readCachedSchedule } from "@/lib/tju/schedule-store";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // 从文件缓存读今日课程（无缓存则为空态，引导去课表页抓取）
  const cached = await readCachedSchedule();
  const currentWeek = getWeekOfSemester(getCurrentSemester()) ?? 1;
  const todayCourses = cached ? getTodayCourses(cached.courses, currentWeek) : [];

  return (
    <>
      <Header title="概览" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
        <FadeIn>
          <Greeting />
        </FadeIn>

        {/* Bento 风网格：左侧今日课程占两行，右侧本周/校历/链接/卡费 */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FadeIn delay={0.05} className="md:col-span-1 md:row-span-2">
            <TodayCoursesWidget courses={todayCourses} hasSchedule={cached !== null} />
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
