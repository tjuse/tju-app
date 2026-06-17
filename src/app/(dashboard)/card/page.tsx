import { CreditCard } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";

export const metadata = { title: "校园卡" };

export default function CardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-6 md:px-8">
      <PageHeader title="校园卡" subtitle="余额与消费流水" icon={CreditCard} />
      <FadeIn>
        <Card>
          <EmptyState
            icon={CreditCard}
            title="校园卡功能即将上线"
            description="此功能需要接入天津大学统一身份认证（CAS）。我们正在 Phase 2 中谨慎实现安全的登录与数据抓取，凭据将加密存储、绝不明文记录。"
          />
        </Card>
      </FadeIn>
    </div>
  );
}
