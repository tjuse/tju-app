import { CreditCard, Lock } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";

export const metadata = { title: "校园卡" };

export default function CardPage() {
  return (
    <>
      <Header title="校园卡" subtitle="余额与消费流水" />
      <div className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 md:px-8">
        <FadeIn>
          <Card className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)]">
              <CreditCard className="size-7 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="flex items-center justify-center gap-2 font-medium text-[var(--color-text-high)] text-lg">
                <Lock className="size-4 text-[var(--color-text-low)]" />
                校园卡功能即将上线
              </p>
              <p className="mt-2 max-w-md text-[13px] text-[var(--color-text-mid)] text-pretty">
                此功能需要接入天津大学统一身份认证（CAS）。我们正在 Phase 2
                中谨慎实现安全的登录与数据抓取，凭据将加密存储、绝不明文记录。
              </p>
            </div>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
