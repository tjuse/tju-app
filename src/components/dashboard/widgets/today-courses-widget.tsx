import { MapPin, User } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CourseWithTime } from "@/types";

interface TodayCoursesWidgetProps {
  courses: CourseWithTime[];
  /** 是否已导入/抓取过课表（用于区分「没课」与「未导入」） */
  hasSchedule: boolean;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function TodayCoursesWidget({ courses, hasSchedule }: TodayCoursesWidgetProps) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
        <h3 className="font-display font-semibold text-[15px] text-[var(--color-text-high)]">
          今日课程
        </h3>
        <span className="font-mono text-[12px] text-[var(--color-text-mid)] tabular-nums">
          {courses.length} 节
        </span>
      </div>
      <div className="rule-hair mx-5" />

      <div className="flex-1 px-5 py-1">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-[var(--color-text-mid)] text-sm">
              {hasSchedule ? "今日无课，宜读书会友。" : "尚未导入课表"}
            </p>
            <Link
              href="/schedule"
              className="font-mono text-[12px] text-[var(--color-accent)] tracking-wide hover:text-[var(--color-accent-hover)] hover:underline"
            >
              {hasSchedule ? "查看课程表 →" : "去导入课表 →"}
            </Link>
          </div>
        ) : (
          <ul>
            {courses.map((course) => {
              const isOngoing =
                nowMinutes >= toMinutes(course.startTime) &&
                nowMinutes <= toMinutes(course.endTime);
              const isPast = nowMinutes > toMinutes(course.endTime);

              return (
                <li
                  key={course.id}
                  className={cn(
                    "flex gap-4 border-[var(--color-border)] border-b py-3.5 last:border-b-0",
                    isPast && "opacity-45",
                  )}
                >
                  {/* Time gutter */}
                  <div className="flex w-12 shrink-0 flex-col items-end pt-0.5">
                    <span
                      className={cn(
                        "font-mono text-[13px] tabular-nums",
                        isOngoing ? "text-[var(--color-accent)]" : "text-[var(--color-text-high)]",
                      )}
                    >
                      {course.startTime}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--color-text-low)] tabular-nums">
                      {course.endTime}
                    </span>
                  </div>

                  {/* Status tick */}
                  <div className="flex flex-col items-center pt-1.5">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isOngoing ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
                      )}
                    />
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-[15px] text-[var(--color-text-high)]">
                        {course.name}
                      </span>
                      {isOngoing && (
                        <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-accent)] tracking-wide">
                          进行中
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-0.5 text-[12px] text-[var(--color-text-mid)]">
                      {course.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-[var(--color-text-low)]" />
                          {course.location}
                        </span>
                      )}
                      {course.teacher && (
                        <span className="flex items-center gap-1">
                          <User className="size-3 text-[var(--color-text-low)]" />
                          {course.teacher}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
