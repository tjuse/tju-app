import { cn } from "@/lib/utils";

export interface LedgerStat {
  label: string;
  value: string;
  unit?: string;
  /** Render the figure in Beiyang blue instead of the default ink. */
  accent?: boolean;
}

/**
 * A row of metric tiles — each a bordered card with a small label and a large
 * figure (Cloudflare-dashboard style).
 */
export function StatLedger({ items }: { items: LedgerStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card px-4 py-3.5">
          <div className="text-[12px] text-[var(--color-text-mid)]">{it.label}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-display font-semibold text-[1.75rem] leading-none tracking-tight",
                it.accent ? "text-[var(--color-accent)]" : "text-[var(--color-text-high)]",
              )}
            >
              {it.value}
            </span>
            {it.unit && (
              <span className="font-mono text-[12px] text-[var(--color-text-low)]">{it.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
