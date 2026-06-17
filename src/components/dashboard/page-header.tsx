import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional leading icon, shown in a tinted square. */
  icon?: LucideIcon;
  /** Right-aligned actions (secondary links + a primary button). */
  actions?: ReactNode;
}

/**
 * In-content page header (Cloudflare style): a tinted icon + title + subtitle on
 * the left, optional actions on the right, aligned with the content column.
 */
export function PageHeader({ title, subtitle, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            <Icon className="size-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-[var(--color-text-high)] text-xl tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-[var(--color-text-mid)]">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
