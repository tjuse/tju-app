import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { GradesView } from "@/features/grades/grades-view";

export const metadata = { title: "成绩" };

export default function GradesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-5 md:px-8">
      <PageHeader title="成绩" subtitle="历史成绩查询" icon={GraduationCap} />
      <FadeIn>
        <GradesView />
      </FadeIn>
    </div>
  );
}
