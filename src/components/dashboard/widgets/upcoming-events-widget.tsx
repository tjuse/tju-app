import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { daysUntil, eventTypeLabel, getUpcomingEvents } from "@/features/calendar/utils";
import { cn } from "@/lib/utils";

export function UpcomingEventsWidget() {
  const semester = getCurrentSemester();
  const events = getUpcomingEvents(semester, new Date(), 4);

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
        <h3 className="font-display font-semibold text-[15px] text-[var(--color-text-high)]">
          近期校历
        </h3>
        <Link
          href="/calendar"
          className="text-[12px] text-[var(--color-text-low)] transition-colors hover:text-[var(--color-accent)]"
        >
          全部
        </Link>
      </div>
      <div className="rule-hair mx-5" />

      <div className="flex-1 px-5 py-1">
        {events.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--color-text-low)]">
            本学期暂无即将到来的事件
          </p>
        ) : (
          <ul>
            {events.map((event) => {
              const days = daysUntil(event.startDate);
              const isExam = event.type === "exam";
              const imminent = days >= 0 && days <= 3;
              return (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 border-[var(--color-border)] border-b py-3.5 last:border-b-0"
                >
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[11px] tracking-wide",
                        isExam ? "text-[var(--color-accent)]" : "text-[var(--color-text-low)]",
                      )}
                    >
                      {eventTypeLabel(event.type)}
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-[var(--color-text-high)] text-sm">
                        {event.title}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--color-text-low)] tabular-nums">
                        {event.startDate}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-right font-mono text-[13px] tabular-nums",
                      imminent ? "text-[var(--color-accent)]" : "text-[var(--color-text-mid)]",
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
