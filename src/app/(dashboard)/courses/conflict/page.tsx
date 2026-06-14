import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { ConflictView } from "@/features/courses/conflict-view";
import { CoursesTabs } from "@/features/courses/courses-tabs";

export const metadata = { title: "选课冲突检测" };

export default function ConflictPage() {
  return (
    <>
      <Header title="公共课表" subtitle="选课冲突检测 · 基于收藏课程" />
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-8">
        <CoursesTabs />
        <FadeIn>
          <ConflictView />
        </FadeIn>
      </div>
    </>
  );
}
