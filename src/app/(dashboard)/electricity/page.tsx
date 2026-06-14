import { Lock, Zap } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";

export const metadata = { title: "电费" };

export default function ElectricityPage() {
  return (
    <>
      <Header title="电费" subtitle="宿舍电费余额与用量" />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 md:px-8">
        <FadeIn>
          <Card className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)]">
              <Zap className="size-7 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="flex items-center justify-center gap-2 font-medium text-[var(--color-text-high)] text-lg">
                <Lock className="size-4 text-[var(--color-text-low)]" />
                电费功能即将上线
              </p>
              <p className="mt-2 max-w-md text-[13px] text-[var(--color-text-mid)] text-pretty">
                此功能需要接入校园缴费系统。Phase 2 将提供余额查询、用量趋势图与低额提醒。
              </p>
            </div>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
