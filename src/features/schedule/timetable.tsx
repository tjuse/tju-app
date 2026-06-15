"use client";

import type { CSSProperties } from "react";
import { slotToTime } from "@/lib/utils";
import type { Course } from "@/types";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const SLOTS = Array.from({ length: 11 }, (_, i) => i + 1);

// 课程色板（北洋蓝为主，辅以协调色）
const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#6366f1"];

function colorFor(course: Course, index: number): string {
  return course.color ?? COLORS[index % COLORS.length];
}

interface TimetableProps {
  courses: Course[];
  /** 当前显示周次，用于过滤 */
  week?: number;
}

export function Timetable({ courses, week }: TimetableProps) {
  const visible = week ? courses.filter((c) => c.weeks.includes(week)) : courses;

  const todayWeekday = (() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  })();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* 表头 */}
        <div className="grid grid-cols-[48px_repeat(7,1fr)] gap-1">
          <div />
          {WEEKDAYS.map((day, i) => (
            <div
              key={day}
              className={`rounded-[var(--radius-sm)] py-2 text-center font-medium text-[13px] ${
                i + 1 === todayWeekday
                  ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent-hover)]"
                  : "text-[var(--color-text-mid)]"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 课表主体 */}
        <div className="relative mt-1 grid grid-cols-[48px_repeat(7,1fr)] gap-1">
          {/* 时间列 */}
          <div className="flex flex-col gap-1">
            {SLOTS.map((slot) => {
              const { start } = slotToTime(slot);
              return (
                <div
                  key={slot}
                  className="flex h-16 flex-col items-center justify-center text-[var(--color-text-low)]"
                >
                  <span className="font-medium text-[12px]">{slot}</span>
                  <span className="text-[10px] tabular-nums">{start}</span>
                </div>
              );
            })}
          </div>

          {/* 每天一列 */}
          {WEEKDAYS.map((day, dayIndex) => {
            const weekday = dayIndex + 1;
            const dayCourses = visible.filter((c) => c.weekday === weekday);
            return (
              <div key={day} className="relative flex flex-col gap-1">
                {SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className="h-16 rounded-[var(--radius-sm)] border border-[var(--color-border)]/50 bg-[var(--color-bg-base)]"
                  />
                ))}
                {/* 课程块绝对定位覆盖 */}
                {dayCourses.map((course, ci) => {
                  const top = (course.startSlot - 1) * (64 + 4);
                  const height =
                    (course.endSlot - course.startSlot + 1) * 64 +
                    (course.endSlot - course.startSlot) * 4;
                  const color = colorFor(course, ci);
                  return (
                    <div
                      key={course.id}
                      className="absolute inset-x-0 animate-fade-in-up overflow-hidden rounded-[var(--radius-md)] p-2"
                      style={
                        {
                          top,
                          height,
                          backgroundColor: `${color}22`,
                          borderLeft: `3px solid ${color}`,
                          animationDelay: `${ci * 0.03}s`,
                          "--fade-y": "4px",
                        } as CSSProperties
                      }
                    >
                      <p className="truncate font-medium text-[12px] text-[var(--color-text-high)] leading-tight">
                        {course.name}
                      </p>
                      {course.location && (
                        <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-mid)]">
                          {course.location}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
