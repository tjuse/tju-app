import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "accent" | "success" | "warning" | "neutral";

export interface LedgerStat {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  /** Color of the icon chip. */
  tone?: StatTone;
  /** Render the figure in Beiyang blue instead of the default ink. */
  accent?: boolean;
}

const TONE: Record<StatTone, string> = {
  accent: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
  success:
    "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
  warning:
    "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
  neutral: "bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]",
};

/**
 * A row of metric tiles — bordered card with a small label, a tinted icon chip,
 * and a large figure (Cloudflare-dashboard style).
 */
export function StatLedger({ items }: { items: LedgerStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="card px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-[12px] text-[var(--color-text-mid)]">{it.label}</div>
              {Icon && (
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                    TONE[it.tone ?? "neutral"],
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "font-display font-semibold text-[1.75rem] leading-none tracking-tight",
                  it.accent ? "text-[var(--color-accent)]" : "text-[var(--color-text-high)]",
                )}
              >
                {it.value}
              </span>
              {it.unit && (
                <span className="font-mono text-[12px] text-[var(--color-text-low)]">
                  {it.unit}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
