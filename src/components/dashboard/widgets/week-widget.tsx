import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";

export function WeekWidget() {
  const semester = getCurrentSemester();
  const week = getWeekOfSemester(semester);

  return (
    <Card className="flex flex-col justify-between p-5">
      <div className="flex items-center gap-2 text-[var(--color-text-mid)]">
        <CalendarDays className="size-4 text-[var(--color-accent)]" />
        <span className="text-[13px]">{semester.name}</span>
      </div>
      <div className="mt-4">
        {week ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-4xl tracking-tight">第 {week}</span>
              <span className="text-[var(--color-text-mid)] text-lg">周</span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--color-text-low)]">
              共 {semester.totalWeeks} 周
            </p>
          </>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-2xl">假期中</span>
          </div>
        )}
      </div>
    </Card>
  );
}
