"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-[var(--color-border)] border-r bg-[var(--color-bg-base)] md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex size-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] font-bold text-sm text-white">
          T
        </div>
        <span className="font-semibold text-[var(--color-text-high)] tracking-tight">
          tju<span className="text-[var(--color-accent)]">.app</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-[var(--color-bg-muted)] font-medium text-[var(--color-text-high)]"
                  : "text-[var(--color-text-mid)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-high)]",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-text-low)] group-hover:text-[var(--color-text-mid)]",
                )}
              />
              <span className="flex-1">{item.title}</span>
              {item.comingSoon && (
                <Badge variant="secondary" className="text-[10px]">
                  待上线
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 text-[11px] text-[var(--color-text-low)]">天津大学 · 非官方</div>
    </aside>
  );
}
