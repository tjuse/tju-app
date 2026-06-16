import { Header } from "@/components/dashboard/header";
import { CompareView } from "@/features/courses/compare-view";
import { CoursesTabs } from "@/features/courses/courses-tabs";

export const metadata = { title: "课程对比" };

export default function ComparePage() {
  return (
    <>
      <Header title="公共课表" subtitle="课程对比" />
      <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8">
        <CoursesTabs />
        <CompareView />
      </div>
    </>
  );
}
