import { Zap } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";

export const metadata = { title: "电费" };

export default function ElectricityPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-6 md:px-8">
      <PageHeader title="电费" subtitle="宿舍电费余额与用量" />
      <FadeIn>
        <Card>
          <EmptyState
            icon={Zap}
            title="电费功能即将上线"
            description="此功能需要接入校园缴费系统。Phase 2 将提供余额查询、用量趋势图与低额提醒。"
          />
        </Card>
      </FadeIn>
    </div>
  );
}
