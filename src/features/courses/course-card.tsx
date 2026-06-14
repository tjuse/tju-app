import { BookText, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TjuArrange, TjuLibCourse } from "@/lib/tju/types";

const WEEKDAY = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function arrangeLabel(arr: TjuArrange): string {
  const wd = arr.weekday ? WEEKDAY[arr.weekday] : "";
  const units =
    arr.unit && arr.unit.length > 0 ? `${arr.unit[0]}-${arr.unit[arr.unit.length - 1]}节` : "";
  return [wd, units].filter(Boolean).join(" ");
}

export function CourseCard({ course }: { course: TjuLibCourse }) {
  const teachers = course.teacher?.join("、");
  const isUG = course.student_type === "undergraduate";

  return (
    <Card className="p-4 transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-[var(--color-text-high)] text-sm">
            {course.name ?? "未命名课程"}
          </h3>
          <p className="mt-0.5 font-mono text-[12px] text-[var(--color-text-low)]">
            {course.course_id}
            {course.class_id ? `-${course.class_id}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={isUG ? "default" : "secondary"}>{isUG ? "本科" : "研究生"}</Badge>
          {course.credit != null && (
            <span className="text-[12px] text-[var(--color-text-mid)] tabular-nums">
              {course.credit} 学分
            </span>
          )}
        </div>
      </div>

      {/* 类别标签 */}
      {course.course_type && course.course_type.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {course.course_type.map((t) => (
            <Badge key={t} variant="outline">
              {t}
            </Badge>
          ))}
        </div>
      )}

      {/* 元信息 */}
      <div className="mt-3 flex flex-col gap-1.5 text-[12px] text-[var(--color-text-mid)]">
        {teachers && (
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 text-[var(--color-text-low)]" />
            {teachers}
          </span>
        )}
        {course.arrange && course.arrange.length > 0 && (
          <div className="flex flex-col gap-1">
            {course.arrange.map((arr) => (
              <span
                key={`${arr.weekday}-${arr.unit?.join(",")}-${arr.location}`}
                className="flex items-center gap-1.5"
              >
                <MapPin className="size-3.5 shrink-0 text-[var(--color-text-low)]" />
                <span className="text-[var(--color-text-high)]">{arrangeLabel(arr)}</span>
                {arr.location && <span>· {arr.location}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 底部：校区 / 周次 / 选课人数 / 大纲 */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-[var(--color-border)] border-t pt-2.5 text-[11px] text-[var(--color-text-low)]">
        {course.campus && <span>{course.campus}</span>}
        {course.weeks && <span>{course.weeks} 周</span>}
        {isUG && course.limit != null && (
          <span className="tabular-nums">
            已选 {course.selected ?? 0}/{course.limit}
          </span>
        )}
        {course.has_syllabus && (
          <span className="flex items-center gap-1 text-[var(--color-accent)]">
            <BookText className="size-3" />
            大纲
          </span>
        )}
      </div>
    </Card>
  );
}
