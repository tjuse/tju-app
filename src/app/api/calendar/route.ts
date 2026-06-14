import { NextResponse } from "next/server";
import { getCurrentSemester, semesters } from "@/features/calendar/calendar-data";
import { getUpcomingEvents, getWeekOfSemester } from "@/features/calendar/utils";

/**
 * GET /api/calendar
 * 返回所有学期、当前学期与当前周次。公开数据，无需鉴权。
 */
export function GET() {
  const current = getCurrentSemester();
  return NextResponse.json({
    data: {
      semesters,
      current: current.id,
      currentWeek: getWeekOfSemester(current),
      upcoming: getUpcomingEvents(current),
    },
  });
}
