"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type NavItem, navGroups } from "./nav-config";
import { useSidebar } from "./sidebar-store";

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const groups = navGroups
    .map((g) => ({
      ...g,
      items: q ? g.items.filter((i) => i.title.toLowerCase().includes(q)) : g.items,
    }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function NavLink({ item }: { item: NavItem }) {
    const active = isActive(item.href);
    const Icon = item.icon;
    const link = (
      <Link
        href={item.href}
        className={cn(
          "group flex h-8 items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 text-[13px] transition-colors",
          active
            ? "bg-[var(--color-accent-subtle)] font-medium text-[var(--color-accent)]"
            : "text-[var(--color-text-mid)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-high)]",
        )}
      >
        <Icon
          className={cn(
            "size-[17px] shrink-0",
            active ? "text-[var(--color-accent)]" : "text-[var(--color-text-low)]",
          )}
        />
        <span className={cn("flex-1 truncate", collapsed && "hidden")}>{item.title}</span>
        {!collapsed && item.comingSoon && (
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
            待上线
          </Badge>
        )}
      </Link>
    );

    if (!collapsed) return link;
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{link}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="z-50 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] px-2.5 py-1.5 text-[13px] text-[var(--color-text-high)] shadow-md ring-1 ring-[var(--color-border)]"
          >
            {item.title}
            {item.comingSoon && (
              <span className="ml-1.5 text-[var(--color-text-low)]">（待上线）</span>
            )}
            <Tooltip.Arrow className="fill-[var(--color-bg-overlay)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return (
    <Tooltip.Provider delayDuration={0}>
      <aside
        style={{ transition: `width 280ms ${EASE}` }}
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden border-[var(--color-border)] border-r bg-[var(--color-bg-subtle)] md:flex",
          collapsed ? "w-[3.75rem]" : "w-60",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-[var(--color-border)] border-b px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] font-display font-bold text-[13px] text-white">
            北
          </div>
          <span
            className={cn(
              "whitespace-nowrap font-display font-semibold text-[var(--color-text-high)] text-[15px]",
              collapsed && "hidden",
            )}
          >
            tju<span className="text-[var(--color-accent)]">.app</span>
          </span>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--color-text-low)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="快速搜索"
                aria-label="搜索导航"
                className="h-8 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] pr-2.5 pl-8 text-[13px] text-[var(--color-text-high)] placeholder:text-[var(--color-text-low)] focus-visible:border-[var(--color-accent)] focus-visible:outline-none"
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-3">
          {groups.map((group, gi) => (
            <div key={group.label ?? `g${gi}`} className="flex flex-col gap-0.5">
              {group.label && !collapsed && (
                <div className="nav-section px-2.5 pt-1 pb-1">{group.label}</div>
              )}
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          ))}
          {groups.length === 0 && !collapsed && (
            <p className="px-2.5 text-[12px] text-[var(--color-text-low)]">无匹配项</p>
          )}
        </nav>

        {/* Footer / collapse toggle */}
        <div className="flex h-12 items-center justify-between gap-2 border-[var(--color-border)] border-t px-3">
          <span className={cn("text-[11px] text-[var(--color-text-low)]", collapsed && "hidden")}>
            天津大学 · 非官方
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"}
            className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-low)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-high)]"
          >
            <PanelLeft className="size-[17px]" />
          </button>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
