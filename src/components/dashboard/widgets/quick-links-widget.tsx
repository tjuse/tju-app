import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { builtInLinks } from "@/features/links/builtin-links";

export function QuickLinksWidget() {
  // Show only the top 6 high-frequency links on the overview page
  const links = builtInLinks.slice(0, 6);

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="flex items-baseline justify-between px-5 pt-4 pb-3">
        <h3 className="font-display font-semibold text-[15px] text-[var(--color-text-high)]">
          常用入口
        </h3>
        <Link
          href="/links"
          className="text-[12px] text-[var(--color-text-low)] transition-colors hover:text-[var(--color-accent)]"
        >
          全部
        </Link>
      </div>
      <div className="rule-hair mx-5" />

      <ul className="flex-1 px-2 py-1">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[13px] transition-colors hover:bg-[var(--color-bg-muted)]"
            >
              <span className="truncate text-[var(--color-text-high)]">{link.title}</span>
              <ArrowUpRight className="size-4 shrink-0 text-[var(--color-text-low)] transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
