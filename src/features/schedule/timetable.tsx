"use client";

import type { CSSProperties } from "react";
import { slotToTime } from "@/lib/utils";
import type { Course } from "@/types";

const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const SLOTS = Array.from({ length: 12 }, (_, i) => i + 1);

/** Height of one class period, in px. Drives both the grid lines and blocks. */
const ROW_H = 58;

// 课程色板（北洋蓝为主，辅以协调冷色；分类色板，允许硬编码）
const COLORS = ["#2f74d6", "#6366f1", "#06b6d4", "#10b981", "#8b5cf6", "#ec4899", "#0ea5e9"];

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

  const bodyHeight = SLOTS.length * ROW_H;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        {/* 表头 */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] gap-1">
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

        {/* 课表主体：日历式时间轴 */}
        <div className="mt-1 grid grid-cols-[56px_repeat(7,1fr)] gap-1">
          {/* 时间列：节次为主、起始时间贴在网格线上（日历式，去除冗余） */}
          <div className="relative" style={{ height: bodyHeight }}>
            {SLOTS.map((slot) => {
              const { start } = slotToTime(slot);
              return (
                <div
                  key={slot}
                  className="absolute inset-x-0 flex items-center justify-end gap-1.5 pr-2 pt-1.5"
                  style={{ top: (slot - 1) * ROW_H, height: 16 }}
                >
                  <span className="font-mono text-[10px] text-[var(--color-text-low)] tabular-nums">
                    {start}
                  </span>
                  <span className="font-medium text-[11px] text-[var(--color-text-mid)] tabular-nums">
                    {slot}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 每天一列 */}
          {WEEKDAYS.map((day, dayIndex) => {
            const weekday = dayIndex + 1;
            const dayCourses = visible.filter((c) => c.weekday === weekday);
            const isToday = weekday === todayWeekday;
            return (
              <div
                key={day}
                className={`relative rounded-[var(--radius-sm)] ${
                  isToday ? "bg-[var(--color-accent-subtle)]/40" : "bg-[var(--color-bg-base)]"
                }`}
                style={{ height: bodyHeight }}
              >
                {/* 时间分隔横线（与时间列对齐，营造日历网格） */}
                {SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className="absolute inset-x-0 border-[var(--color-border)]/40 border-t"
                    style={{ top: (slot - 1) * ROW_H, height: ROW_H }}
                  />
                ))}

                {/* 课程块：整块填充，无左边缘高亮 */}
                {dayCourses.map((course, ci) => {
                  const top = (course.startSlot - 1) * ROW_H + 2;
                  const height = (course.endSlot - course.startSlot + 1) * ROW_H - 4;
                  const color = colorFor(course, ci);
                  return (
                    <div
                      key={course.id}
                      className="absolute inset-x-0.5 animate-fade-in-up overflow-hidden rounded-[var(--radius-md)] border p-2"
                      style={
                        {
                          top,
                          height,
                          backgroundColor: `${color}1f`,
                          borderColor: `${color}59`,
                          animationDelay: `${ci * 0.03}s`,
                          "--fade-y": "4px",
                        } as CSSProperties
                      }
                    >
                      <p className="flex items-center gap-1 truncate font-medium text-[12px] text-[var(--color-text-high)] leading-tight">
                        <span
                          className="inline-block size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate">{course.name}</span>
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
