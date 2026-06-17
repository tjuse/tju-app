import type { ReactNode } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        {/* Slim global utility bar */}
        <div className="sticky top-0 z-10 flex h-12 shrink-0 items-center justify-end gap-2 border-[var(--color-border)] border-b bg-[color-mix(in_srgb,var(--color-bg-base)_85%,transparent)] px-5 backdrop-blur-md md:px-8">
          <ThemeToggle />
        </div>
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
