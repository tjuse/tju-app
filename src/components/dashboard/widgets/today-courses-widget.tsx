import { Clock, MapPin, User } from "lucide-react";
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
      <div className="panel-head">
        <h3 className="flex items-center gap-2 font-semibold text-[13px] text-[var(--color-text-high)]">
          <span className="flex size-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            <Clock className="size-3" />
          </span>
          今日课程
        </h3>
        <span className="font-mono text-[11px] text-[var(--color-text-mid)] tabular-nums">
          {courses.length} 节
        </span>
      </div>

      <div className="flex-1 px-3.5">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center gap-2.5 py-10 text-center">
            <p className="text-[13px] text-[var(--color-text-mid)]">
              {hasSchedule ? "今日无课，宜读书会友。" : "尚未导入课表"}
            </p>
            <Link
              href="/schedule"
              className="font-mono text-[12px] text-[var(--color-accent)] hover:underline"
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
                  className={cn("data-row items-start py-2.5", isPast && "opacity-45")}
                >
                  {/* Time gutter + status dot */}
                  <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
                    <span
                      className={cn(
                        "status-dot",
                        isOngoing ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]",
                      )}
                    />
                    <div className="flex w-10 flex-col items-end">
                      <span
                        className={cn(
                          "font-mono text-[12px] tabular-nums",
                          isOngoing
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-text-high)]",
                        )}
                      >
                        {course.startTime}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--color-text-low)] tabular-nums">
                        {course.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-[13px] text-[var(--color-text-high)]">
                        {course.name}
                      </span>
                      {isOngoing && (
                        <span className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-accent)]">
                          进行中
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--color-text-mid)]">
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
