import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-[var(--color-border)] border-b px-5 md:px-8">
      <div className="flex flex-col">
        <h1 className="font-semibold text-[var(--color-text-high)] text-lg tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-[13px] text-[var(--color-text-mid)]">{subtitle}</p>}
      </div>
      <ThemeToggle />
    </header>
  );
}
