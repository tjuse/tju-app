import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Primary action (button/link). */
  action?: ReactNode;
}

/**
 * Centered empty state (Cloudflare style): subtle rounded icon, bold title,
 * gray description, optional action. Place inside a Card/panel.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="font-semibold text-[15px] text-[var(--color-text-high)]">{title}</p>
        {description && (
          <p className="mx-auto mt-1.5 max-w-md text-[13px] text-[var(--color-text-mid)] text-pretty">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
