import { Plus, Upload } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentSemester } from "@/features/calendar/calendar-data";
import { getWeekOfSemester } from "@/features/calendar/utils";
import { Timetable } from "@/features/schedule/timetable";
import type { Course } from "@/types";

export const metadata = { title: "课程表" };

export default function SchedulePage() {
  const semester = getCurrentSemester();
  const week = getWeekOfSemester(semester) ?? 1;

  // Phase 1：课程将由用户录入/ICS/截图导入后从 DB 读取。
  const courses: Course[] = [];

  return (
    <>
      <Header title="课程表" subtitle={`${semester.name} · 第 ${week} 周`} />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
        <FadeIn>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[var(--color-text-mid)] text-sm">
              {courses.length > 0 ? `${courses.length} 门课程` : "尚未添加课程"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="size-4" />
                导入
              </Button>
              <Button size="sm">
                <Plus className="size-4" />
                添加课程
              </Button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          {courses.length === 0 ? (
            <Card className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-bg-muted)]">
                <Upload className="size-6 text-[var(--color-text-low)]" />
              </div>
              <div>
                <p className="font-medium text-[var(--color-text-high)]">还没有课程</p>
                <p className="mt-1 text-[13px] text-[var(--color-text-mid)]">
                  手动添加、导入 ICS 文件，或上传课表截图让 AI 自动识别
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Upload className="size-4" />
                  上传截图识别
                </Button>
                <Button size="sm">
                  <Plus className="size-4" />
                  手动添加
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <Timetable courses={courses} week={week} />
            </Card>
          )}
        </FadeIn>
      </div>
    </>
  );
}
