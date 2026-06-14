import { Clock, MapPin, Table2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseWithTime } from "@/types";

interface TodayCoursesWidgetProps {
  courses: CourseWithTime[];
}

export function TodayCoursesWidget({ courses }: TodayCoursesWidgetProps) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  }

  return (
    <Card className="md:row-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Table2 className="size-4 text-[var(--color-accent)]" />
          今日课程
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-[var(--color-text-mid)] text-sm">今天没有课程安排 🎉</p>
            <Link
              href="/schedule"
              className="text-[13px] text-[var(--color-accent)] hover:underline"
            >
              去添加课程 →
            </Link>
          </div>
        ) : (
          courses.map((course) => {
            const isOngoing =
              nowMinutes >= toMinutes(course.startTime) && nowMinutes <= toMinutes(course.endTime);
            const isPast = nowMinutes > toMinutes(course.endTime);

            return (
              <div
                key={course.id}
                className={[
                  "relative flex gap-3 rounded-[var(--radius-md)] border p-3 transition-colors",
                  isOngoing
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-subtle)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-base)]",
                  isPast ? "opacity-50" : "",
                ].join(" ")}
              >
                <div className="flex flex-col items-center gap-0.5 pt-0.5">
                  <span className="font-medium text-[13px] text-[var(--color-text-high)] tabular-nums">
                    {course.startTime}
                  </span>
                  <span className="text-[11px] text-[var(--color-text-low)] tabular-nums">
                    {course.endTime}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-[var(--color-text-high)] text-sm">
                      {course.name}
                    </span>
                    {isOngoing && (
                      <span className="shrink-0 rounded-[var(--radius-full)] bg-[var(--color-accent)] px-1.5 py-0.5 text-[10px] text-white">
                        进行中
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-[var(--color-text-mid)]">
                    {course.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {course.location}
                      </span>
                    )}
                    {course.teacher && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {course.teacher}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
