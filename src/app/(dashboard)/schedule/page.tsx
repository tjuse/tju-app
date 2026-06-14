import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { ScheduleEmpty } from "@/features/schedule/schedule-empty";
import { ScheduleView } from "@/features/schedule/schedule-view";
import { readCachedSchedule } from "@/lib/tju/schedule-store";

export const metadata = { title: "课程表" };

// 读文件缓存，禁用静态化
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const semester = getCurrentSemester();
  const currentWeek = getWeekOfSemester(semester) ?? 1;
  const cached = await readCachedSchedule();

  return (
    <>
      <Header title="课程表" subtitle={`${semester.name} · 第 ${currentWeek} 周`} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
        <FadeIn>
          {cached ? (
            <ScheduleView
              courses={cached.courses}
              semester={cached.semester}
              currentWeek={currentWeek}
              studentName={cached.student.name}
              cachedAt={cached.cachedAt}
            />
          ) : (
            <ScheduleEmpty />
          )}
        </FadeIn>
      </div>
    </>
  );
}
