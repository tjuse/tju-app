import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

/** 原生 select，按设计系统样式化（轻量、可访问、移动端友好）。 */
function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex">
      <select
        className={cn(
          "h-9 w-full appearance-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] py-1 pr-8 pl-3 text-sm text-[var(--color-text-high)] transition-colors",
          "focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-[var(--color-text-low)]" />
    </div>
  );
}

export { Select };
