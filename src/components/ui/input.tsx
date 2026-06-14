import type * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-1 text-sm text-[var(--color-text-high)] transition-colors",
        "placeholder:text-[var(--color-text-low)]",
        "focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
