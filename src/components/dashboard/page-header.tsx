import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Right-aligned actions (secondary links + a primary button). */
  actions?: ReactNode;
}

/**
 * In-content page header (Cloudflare style): title + subtitle on the left,
 * optional actions on the right, aligned with the content column.
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display font-semibold text-[var(--color-text-high)] text-xl tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-[var(--color-text-mid)]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
