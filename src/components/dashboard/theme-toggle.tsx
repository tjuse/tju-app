"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", icon: Sun, label: "浅色" },
  { value: "dark", icon: Moon, label: "深色" },
  { value: "system", icon: Monitor, label: "跟随系统" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-[108px] rounded-[var(--radius-full)] bg-[var(--color-bg-muted)]" />
    );
  }

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-0.5"
      role="radiogroup"
      aria-label="主题切换"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          type="button"
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            "flex size-7 items-center justify-center rounded-[var(--radius-full)] transition-colors",
            theme === value
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-mid)] hover:text-[var(--color-text-high)]",
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
