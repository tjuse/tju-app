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
    <Card className="flex h-full flex-col justify-between gap-2 p-3.5">
      <div className="flex items-start justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-[13px] text-[var(--color-text-mid)]">
          <span className="flex size-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]">
            <Icon className="size-3" />
          </span>
          {title}
        </h3>
        <span className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-text-low)]">
          待上线
        </span>
      </div>
      <p className="text-[12px] text-[var(--color-text-low)]">
        {hint ?? "需校园统一认证，敬请期待"}
      </p>
    </Card>
  );
}
