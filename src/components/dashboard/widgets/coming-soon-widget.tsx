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
    <Card className="flex h-full flex-col justify-between gap-3 p-5">
      <div className="flex items-start justify-between">
        <h3 className="flex items-center gap-2 font-display font-semibold text-[15px] text-[var(--color-text-mid)]">
          <Icon className="size-4 text-[var(--color-text-low)]" />
          {title}
        </h3>
        <span className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-0.5 text-[11px] text-[var(--color-text-low)]">
          待上线
        </span>
      </div>
      <p className="text-[13px] text-[var(--color-text-low)]">
        {hint ?? "需校园统一认证，敬请期待"}
      </p>
    </Card>
  );
}
