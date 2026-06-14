"use client";

import { BarChart3, Library, Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/courses", label: "浏览", icon: Library },
  { href: "/courses/favorites", label: "收藏", icon: Star },
  { href: "/courses/stats", label: "统计", icon: BarChart3 },
];

export function CoursesTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-5 inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-1">
      {tabs.map((t) => {
        const active = pathname === t.href;
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-sm)] px-3 py-1.5 font-medium text-[13px] transition-colors",
              active
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-mid)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-high)]",
            )}
          >
            <Icon className="size-3.5" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
