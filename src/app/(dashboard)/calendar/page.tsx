import {
  CalendarDays,
  type LucideIcon,
  NotebookPen,
  Palmtree,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSemester, semesters } from "@/features/calendar/calendar-data";
import { daysUntil, eventTypeLabel, getWeekOfSemester } from "@/features/calendar/utils";
import type { AcademicCalendarEvent } from "@/types";

export const metadata = { title: "校历" };

/** Icon + tinted-chip classes per event type. */
const EVENT_STYLE: Record<AcademicCalendarEvent["type"], { icon: LucideIcon; chip: string }> = {
  exam: {
    icon: NotebookPen,
    chip: "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
  },
  holiday: {
    icon: Palmtree,
    chip: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
  },
  holiday_break: {
    icon: Palmtree,
    chip: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
  },
  semester_start: {
    icon: PartyPopper,
    chip: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
  },
  semester_end: { icon: Sparkles, chip: "bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]" },
  important: {
    icon: Sparkles,
    chip: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
  },
};

export default function CalendarPage() {
  const current = getCurrentSemester();
  const week = getWeekOfSemester(current);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-5 md:px-8">
      <PageHeader title="校历" subtitle={current.name} icon={CalendarDays} />
      {/* 当前周卡片 */}
      <FadeIn>
        <Card className="mb-3 flex items-center justify-between p-4">
          <div>
            <p className="text-[12px] text-[var(--color-text-mid)]">{current.name}</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="gradient-text font-display font-semibold text-3xl tracking-tight">
                {week ? `第 ${week} 周` : "假期中"}
              </span>
            </div>
          </div>
          <div className="text-right font-mono text-[12px] text-[var(--color-text-low)] tabular-nums">
            <p>{current.startDate}</p>
            <p>~ {current.endDate}</p>
            <p className="mt-1">共 {current.totalWeeks} 周</p>
          </div>
        </Card>
      </FadeIn>

      {/* 各学期事件 */}
      <div className="flex flex-col gap-3">
        {semesters.map((semester, si) => (
          <FadeIn key={semester.id} delay={si * 0.05}>
            <Card>
              <CardHeader>
                <CardTitle>{semester.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {semester.events.map((event) => {
                  const days = daysUntil(event.startDate);
                  const past = daysUntil(event.endDate) < 0;
                  const style = EVENT_STYLE[event.type];
                  const Icon = style.icon;
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between gap-3 border-[var(--color-border)] border-b py-3 last:border-0 ${
                        past ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${style.chip}`}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[var(--color-text-high)] text-sm">
                            {event.title}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-low)]">
                            {eventTypeLabel(event.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[var(--color-text-mid)] tabular-nums">
                          {event.startDate}
                          {event.endDate !== event.startDate && ` ~ ${event.endDate}`}
                        </p>
                        {!past && days > 0 && (
                          <p className="text-[11px] text-[var(--color-text-low)]">{days} 天后</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
