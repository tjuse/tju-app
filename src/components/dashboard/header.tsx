import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-[var(--color-border)] border-b bg-[color-mix(in_srgb,var(--color-bg-base)_90%,transparent)] px-5 backdrop-blur-sm md:px-8">
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate font-semibold text-[var(--color-text-high)] text-base tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12px] text-[var(--color-text-mid)]">{subtitle}</p>
        )}
      </div>
      <ThemeToggle />
    </header>
  );
}
