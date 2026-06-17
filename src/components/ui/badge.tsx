import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1.5 py-0.5 font-medium text-[11px] leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-accent-subtle)] text-[var(--color-accent)]",
        secondary: "bg-[var(--color-bg-muted)] text-[var(--color-text-mid)]",
        success:
          "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]",
        warning:
          "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
        danger:
          "bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] text-[var(--color-danger)]",
        outline: "border border-[var(--color-border)] text-[var(--color-text-mid)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
