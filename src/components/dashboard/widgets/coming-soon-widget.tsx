import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ComingSoonWidgetProps {
  title: string;
  icon: LucideIcon;
  hint?: string;
}

/**
 * Phase 2 功能（校园卡、电费）的占位卡片。
 * 保持视觉一致，明确告知「待上线」，不留空白。
 */
export function ComingSoonWidget({ title, icon: Icon, hint }: ComingSoonWidgetProps) {
  return (
    <Card className="relative flex flex-col justify-between overflow-hidden p-5">
      <div className="flex items-center justify-between text-[var(--color-text-mid)]">
        <span className="flex items-center gap-2 text-[13px]">
          <Icon className="size-4 text-[var(--color-text-low)]" />
          {title}
        </span>
        <span className="rounded-[var(--radius-full)] bg-[var(--color-bg-muted)] px-2 py-0.5 text-[10px] text-[var(--color-text-low)]">
          待上线
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-3xl text-[var(--color-text-low)] tracking-tight">——</span>
        </div>
        <p className="mt-1 text-[12px] text-[var(--color-text-low)]">
          {hint ?? "需校园统一认证，敬请期待"}
        </p>
      </div>
    </Card>
  );
}
