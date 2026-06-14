import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSemester, semesters } from "@/features/calendar/calendar-data";
import { daysUntil, eventTypeLabel, getWeekOfSemester } from "@/features/calendar/utils";

export const metadata = { title: "校历" };

export default function CalendarPage() {
  const current = getCurrentSemester();
  const week = getWeekOfSemester(current);

  return (
    <>
      <Header title="校历" subtitle={current.name} />
      <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-6 md:px-8">
        {/* 当前周大卡片 */}
        <FadeIn>
          <Card className="mb-6 flex items-center justify-between p-6">
            <div>
              <p className="text-[13px] text-[var(--color-text-mid)]">{current.name}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="gradient-text font-bold text-5xl tracking-tight">
                  {week ? `第 ${week} 周` : "假期中"}
                </span>
              </div>
            </div>
            <div className="text-right text-[13px] text-[var(--color-text-low)]">
              <p>{current.startDate}</p>
              <p>~ {current.endDate}</p>
              <p className="mt-1">共 {current.totalWeeks} 周</p>
            </div>
          </Card>
        </FadeIn>

        {/* 各学期事件 */}
        <div className="flex flex-col gap-6">
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
                    return (
                      <div
                        key={event.id}
                        className={`flex items-center justify-between gap-3 border-[var(--color-border)] border-b py-3 last:border-0 ${
                          past ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              event.type === "exam"
                                ? "warning"
                                : event.type.startsWith("holiday")
                                  ? "success"
                                  : "secondary"
                            }
                          >
                            {eventTypeLabel(event.type)}
                          </Badge>
                          <span className="font-medium text-[var(--color-text-high)] text-sm">
                            {event.title}
                          </span>
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
    </>
  );
}
