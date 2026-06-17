import { type LucideIcon, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

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
  /** Small delta chip, e.g. "+12%" / "本周". `up`/`down`/`flat` set its color. */
  delta?: { label: string; dir?: "up" | "down" | "flat" };
  /** Status dot beside the label. */
  status?: { tone: StatTone; label?: string };
  /** Optional sparkline series under the figure. */
  series?: number[];
  /** Small muted secondary line, pinned to the bottom of the tile. */
  footnote?: string;
}

const TONE: Record<StatTone, { chip: string; dot: string; spark: string }> = {
  accent: {
    chip: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
    dot: "bg-[var(--color-accent)]",
    spark: "var(--color-accent)",
  },
  success: {
    chip: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    spark: "var(--color-success)",
  },
  warning: {
    chip: "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    spark: "var(--color-warning)",
  },
  neutral: {
    chip: "bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]",
    dot: "bg-[var(--color-border-strong)]",
    spark: "var(--color-text-low)",
  },
};

const DELTA_COLOR = {
  up: "text-[var(--color-success)]",
  down: "text-[var(--color-danger)]",
  flat: "text-[var(--color-text-mid)]",
} as const;

/**
 * A row of metric tiles — compact bordered cards with a label, status dot,
 * tinted icon chip, a large figure, a delta chip and an optional sparkline
 * (Cloudflare-dashboard style).
 */
export function StatLedger({ items }: { items: LedgerStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => {
        const Icon = it.icon;
        const tone = TONE[it.tone ?? "neutral"];
        return (
          <div key={it.label} className="card group flex flex-col px-3.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                {it.status && <span className={cn("status-dot", TONE[it.status.tone].dot)} />}
                <span className="truncate text-[12px] text-[var(--color-text-mid)]">
                  {it.label}
                </span>
              </div>
              {Icon ? (
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-md)]",
                    tone.chip,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
              ) : (
                <MoreHorizontal className="size-4 shrink-0 text-[var(--color-text-low)] opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </div>

            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={cn(
                    "font-display font-semibold text-[1.625rem] leading-none tracking-tight tabular-nums",
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
              {it.delta && (
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    DELTA_COLOR[it.delta.dir ?? "flat"],
                  )}
                >
                  {it.delta.label}
                </span>
              )}
            </div>

            {it.series && it.series.length > 1 && (
              <div className="-mb-1 mt-2.5">
                <Sparkline data={it.series} color={tone.spark} height={28} />
              </div>
            )}
            {it.footnote && !it.series && (
              <p className="mt-auto truncate pt-2.5 text-[11px] text-[var(--color-text-low)]">
                {it.footnote}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
