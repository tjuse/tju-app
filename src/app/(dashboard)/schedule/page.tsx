import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { currentSemesterCode } from "@/features/courses/semesters";
import { ScheduleClient } from "@/features/schedule/schedule-client";

export const metadata = { title: "课程表" };

export default function SchedulePage() {
  const semester = getCurrentSemester();
  const currentWeek = getWeekOfSemester(semester) ?? 1;
  const semesterCode = currentSemesterCode();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 md:px-8">
      <PageHeader title="课程表" subtitle={`${semester.name} · 第 ${currentWeek} 周`} />
      <FadeIn>
        <ScheduleClient
          semesterCode={semesterCode}
          semesterName={semester.name}
          currentWeek={currentWeek}
        />
      </FadeIn>
    </div>
  );
}
