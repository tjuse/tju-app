import { Library } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { CoursesBrowser } from "@/features/courses/courses-browser";
import { CoursesTabs } from "@/features/courses/courses-tabs";
import { currentSemesterCode, listSemesters, semesterLabel } from "@/features/courses/semesters";
import { queryCachedCourses } from "@/lib/tju/courses-store";

export const metadata = { title: "公共课表" };
export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const semesters = listSemesters();
  const semester = currentSemesterCode();
  // SSR 首屏：读当前学期缓存第一页（无缓存则 null，浏览器内提示抓取）
  const initial = await queryCachedCourses(semester, { page: 1, pageSize: 30 });

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-5 md:px-8">
      <PageHeader title="公共课表" subtitle="全校开课课程库 · 可按学期检索" icon={Library} />
      <CoursesTabs />
      <FadeIn>
        <CoursesBrowser semesters={semesters} initialSemester={semester} initial={initial} />
      </FadeIn>
      <p className="mt-6 text-[12px] text-[var(--color-text-low)]">
        数据来自天津大学教务系统（EAMS），经 tju 抓取并缓存。当前默认学期：
        {semesterLabel(semester)}。
      </p>
    </div>
  );
}
