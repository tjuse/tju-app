import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { daysUntil, eventTypeLabel, getUpcomingEvents } from "@/features/calendar/utils";

export function UpcomingEventsWidget() {
  const semester = getCurrentSemester();
  const events = getUpcomingEvents(semester, new Date(), 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4 text-[var(--color-accent)]" />
          校历提醒
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {events.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-[var(--color-text-low)]">
            本学期暂无即将到来的事件
          </p>
        ) : (
          events.map((event) => {
            const days = daysUntil(event.startDate);
            return (
              <div
                key={event.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] py-1"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-[var(--color-text-high)] text-sm">
                    {event.title}
                  </span>
                  <span className="text-[12px] text-[var(--color-text-low)]">
                    {event.startDate}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={event.type === "exam" ? "warning" : "secondary"}>
                    {eventTypeLabel(event.type)}
                  </Badge>
                  <span className="w-16 text-right text-[12px] text-[var(--color-text-mid)] tabular-nums">
                    {days <= 0 ? "进行中" : `${days} 天后`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
