import { ArrowUpRight, Compass } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { builtInLinks } from "@/features/links/builtin-links";

export function QuickLinksWidget() {
  // Show only the top high-frequency links on the overview page
  const links = builtInLinks.slice(0, 7);

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="panel-head">
        <h3 className="flex items-center gap-2 font-semibold text-[13px] text-[var(--color-text-high)]">
          <span className="flex size-5 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
            <Compass className="size-3" />
          </span>
          常用入口
        </h3>
        <Link
          href="/links"
          className="text-[11px] text-[var(--color-text-low)] transition-colors hover:text-[var(--color-accent)]"
        >
          全部
        </Link>
      </div>

      <ul className="flex-1 px-1.5 py-1">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-8 items-center justify-between gap-2 rounded-[var(--radius-md)] px-2 text-[13px] transition-colors hover:bg-[var(--color-bg-muted)]"
            >
              <span className="truncate text-[var(--color-text-high)]">{link.title}</span>
              <ArrowUpRight className="size-3.5 shrink-0 text-[var(--color-text-low)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
