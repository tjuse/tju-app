import { Library } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompareView } from "@/features/courses/compare-view";
import { CoursesTabs } from "@/features/courses/courses-tabs";

export const metadata = { title: "课程对比" };

export default function ComparePage() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-5 py-5 md:px-8">
      <PageHeader title="公共课表" subtitle="课程对比" icon={Library} />
      <CoursesTabs />
      <CompareView />
    </div>
  );
}
