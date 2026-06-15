"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";
import { useSidebar } from "./sidebar-store";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <Tooltip.Provider delayDuration={0}>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-[var(--color-border)] border-r bg-[var(--color-bg-base)] md:flex",
          "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 items-center border-[var(--color-border)] border-b",
            collapsed ? "justify-center px-0" : "gap-2 px-6",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] font-bold text-sm text-white">
            T
          </div>
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap font-semibold text-[var(--color-text-high)] tracking-tight transition-[opacity,max-width] duration-200",
              collapsed ? "max-w-0 opacity-0" : "max-w-[8rem] opacity-100",
            )}
          >
            tju<span className="text-[var(--color-accent)]">.app</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-[var(--radius-md)] px-2.5 py-2 text-sm transition-colors",
                  collapsed ? "justify-center" : "gap-3",
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
                <span
                  className={cn(
                    "flex-1 overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-200",
                    collapsed ? "max-w-0 opacity-0" : "max-w-[10rem] opacity-100",
                  )}
                >
                  {item.title}
                </span>
                {!collapsed && item.comingSoon && (
                  <Badge variant="secondary" className="text-[10px]">
                    待上线
                  </Badge>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>{linkContent}</Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={8}
                      className="z-50 rounded-[var(--radius-md)] bg-[var(--color-bg-overlay)] px-2.5 py-1.5 text-[13px] text-[var(--color-text-high)] shadow-lg ring-1 ring-[var(--color-border)]"
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

            return linkContent;
          })}
        </nav>

        {/* Footer / collapse toggle */}
        <div
          className={cn(
            "border-[var(--color-border)] border-t px-2 py-3",
            collapsed ? "flex justify-center" : "flex items-center justify-between px-4",
          )}
        >
          {!collapsed && (
            <span className="text-[11px] text-[var(--color-text-low)]">天津大学 · 非官方</span>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"}
            className="flex size-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-low)] transition-colors hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-mid)]"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
