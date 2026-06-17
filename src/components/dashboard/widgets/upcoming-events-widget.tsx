import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { daysUntil, eventTypeLabel, getUpcomingEvents } from "@/features/calendar/utils";
import { cn } from "@/lib/utils";

export function UpcomingEventsWidget() {
  const semester = getCurrentSemester();
  const events = getUpcomingEvents(semester, new Date(), 5);

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="panel-head">
        <h3 className="flex items-center gap-2 font-semibold text-[13px] text-[var(--color-text-high)]">
          <span className="flex size-5 items-center justify-center rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]">
            <CalendarDays className="size-3" />
          </span>
          近期校历
        </h3>
        <Link
          href="/calendar"
          className="text-[11px] text-[var(--color-text-low)] transition-colors hover:text-[var(--color-accent)]"
        >
          全部
        </Link>
      </div>

      <div className="flex-1 px-3.5">
        {events.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-[var(--color-text-low)]">
            本学期暂无即将到来的事件
          </p>
        ) : (
          <ul>
            {events.map((event) => {
              const days = daysUntil(event.startDate);
              const isExam = event.type === "exam";
              const imminent = days >= 0 && days <= 3;
              return (
                <li key={event.id} className="data-row">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "status-dot",
                        imminent
                          ? "bg-[var(--color-warning)]"
                          : isExam
                            ? "bg-[var(--color-accent)]"
                            : "bg-[var(--color-border-strong)]",
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-[13px] text-[var(--color-text-high)]">
                        {event.title}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-text-low)] tabular-nums">
                        <span>{eventTypeLabel(event.type)}</span>
                        <span>·</span>
                        <span>{event.startDate}</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-right font-mono text-[12px] tabular-nums",
                      imminent ? "text-[var(--color-warning)]" : "text-[var(--color-text-mid)]",
                    )}
                  >
                    {days <= 0 ? "进行中" : `${days} 天`}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
