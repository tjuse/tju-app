"use client";

import { parseSyllabus } from "@tju-app/eams-parsers";
import { BookText, Building2, Clock, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSyllabusHtml, isExtensionAvailable } from "@/lib/extension-bridge";
import type { TjuLibCourse } from "@/lib/tju/types";
import { arrangeLabel } from "./course-card";
import { FavoriteButton } from "./favorite-button";

interface Props {
  course: TjuLibCourse | null;
  semester: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CourseDetailDialog({ course, semester, open, onOpenChange }: Props) {
  const [syllabus, setSyllabus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lessionId = course?.lession_id ?? null;
  const hasSyllabus = !!course?.has_syllabus && !!lessionId;

  useEffect(() => {
    if (!open || !hasSyllabus || !lessionId) return;
    let cancelled = false;
    setSyllabus(null);
    setError(null);
    setLoading(true);

    async function load(id: string): Promise<void> {
      // 1) Try the committed cache (works on any deployment, no extension).
      try {
        const res = await fetch(`/api/courses/syllabus?lessionId=${id}`);
        const body = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setSyllabus(body.data.syllabus as string);
          return;
        }
      } catch {
        // fall through to the extension
      }
      // 2) Cache miss / demo mode → fetch live via the browser extension.
      if (await isExtensionAvailable()) {
        const html = await fetchSyllabusHtml(id);
        if (cancelled) return;
        setSyllabus(parseSyllabus(html));
        return;
      }
      if (!cancelled) setError("该课程大纲暂未缓存，安装并登录扩展后可在线获取。");
    }

    load(lessionId)
      .catch(() => {
        if (!cancelled) setError("大纲获取失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, hasSyllabus, lessionId]);

  if (!course) return null;
  const isUG = course.student_type === "undergraduate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {/* 头部 */}
        <div className="flex items-start gap-3 border-[var(--color-border)] border-b p-5 pr-12">
          <div className="min-w-0 flex-1">
            <DialogTitle className="pr-2">{course.name ?? "未命名课程"}</DialogTitle>
            <p className="mt-1 font-mono text-[12px] text-[var(--color-text-low)]">
              {course.course_id}
              {course.class_id ? `-${course.class_id}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant={isUG ? "default" : "secondary"}>{isUG ? "本科" : "研究生"}</Badge>
              {course.credit != null && <Badge variant="outline">{course.credit} 学分</Badge>}
              {course.course_type?.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
          <FavoriteButton course={course} semester={semester} className="mt-1 size-8" />
        </div>

        {/* 可滚动主体 */}
        <div className="flex-1 overflow-y-auto p-5">
          <dl className="grid grid-cols-1 gap-y-3 text-[13px] sm:grid-cols-2">
            <Field icon={Users} label="教师">
              {course.teacher?.join("、") || "—"}
            </Field>
            <Field icon={Building2} label="校区">
              {course.campus || "—"}
            </Field>
            <Field icon={Clock} label="学时">
              {course.hours != null ? `${course.hours} 学时` : "—"}
              {course.week_hours != null ? `（周 ${course.week_hours}）` : ""}
            </Field>
            <Field icon={BookText} label="周次">
              {course.weeks || "—"}
            </Field>
            {course.teaching_class && course.teaching_class.length > 0 && (
              <Field icon={Users} label="教学班" full>
                {course.teaching_class.join("、")}
              </Field>
            )}
            {isUG && course.limit != null && (
              <Field icon={Users} label="选课">
                已选 {course.selected ?? 0} / 上限 {course.limit}
              </Field>
            )}
          </dl>

          {/* 上课安排 */}
          {course.arrange && course.arrange.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 font-medium text-[13px] text-[var(--color-text-mid)]">
                上课安排
              </h4>
              <div className="flex flex-col gap-1.5">
                {course.arrange.map((arr) => (
                  <div
                    key={`${arr.weekday}-${arr.unit?.join(",")}-${arr.location}`}
                    className="flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-bg-base)] px-3 py-2 text-[13px]"
                  >
                    <MapPin className="size-3.5 shrink-0 text-[var(--color-accent)]" />
                    <span className="text-[var(--color-text-high)]">{arrangeLabel(arr)}</span>
                    {arr.location && (
                      <span className="text-[var(--color-text-mid)]">· {arr.location}</span>
                    )}
                    {arr.teacher && arr.teacher.length > 0 && (
                      <span className="text-[var(--color-text-low)]">
                        · {arr.teacher.join("、")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 课程大纲 */}
          <div className="mt-5">
            <h4 className="mb-2 flex items-center gap-1.5 font-medium text-[13px] text-[var(--color-text-mid)]">
              <BookText className="size-3.5" />
              课程大纲
            </h4>
            {!hasSyllabus ? (
              <p className="text-[13px] text-[var(--color-text-low)]">本课程暂无大纲</p>
            ) : loading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : error ? (
              <p className="text-[13px] text-[var(--color-danger)]">{error}</p>
            ) : syllabus ? (
              <div className="prose-tju text-[13px] text-[var(--color-text-mid)] leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{syllabus}</ReactMarkdown>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  icon: Icon,
  label,
  children,
  full,
}: {
  icon: typeof Users;
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-low)]">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-0.5 text-[var(--color-text-high)]">{children}</dd>
    </div>
  );
}
