"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-config";

/**
 * 移动端底部 Tab 栏（PWA 体验关键）。
 * 仅展示前 5 个主功能。
 */
export function MobileNav() {
  const pathname = usePathname();
  const items = navItems.slice(0, 5);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 flex border-[var(--color-border)] border-t bg-[color-mix(in_srgb,var(--color-bg-base)_85%,transparent)] backdrop-blur-lg md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] transition-colors",
              isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-low)]",
            )}
          >
            <Icon className="size-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
