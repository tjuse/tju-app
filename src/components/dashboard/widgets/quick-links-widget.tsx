import { ArrowUpRight, Link2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { builtInLinks } from "@/features/links/builtin-links";

export function QuickLinksWidget() {
  // 概览页只展示前 6 个高频链接
  const links = builtInLinks.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-4 text-[var(--color-accent)]" />
          常用入口
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2.5 text-sm transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)]"
            >
              <span className="truncate text-[var(--color-text-high)]">{link.title}</span>
              <ArrowUpRight className="size-3.5 shrink-0 text-[var(--color-text-low)] transition-colors group-hover:text-[var(--color-accent)]" />
            </a>
          ))}
        </div>
        <Link
          href="/links"
          className="mt-3 inline-block text-[13px] text-[var(--color-accent)] hover:underline"
        >
          查看全部链接 →
        </Link>
      </CardContent>
    </Card>
  );
}
