"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  /** `<option>` 子元素（与原生用法兼容）。也可改用 `options`。 */
  children?: ReactNode;
  options?: SelectOption[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Derive options from `<option>` children so call sites stay declarative. */
function childrenToOptions(children: ReactNode): SelectOption[] {
  const out: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    };
    out.push({
      value: String(props.value ?? ""),
      label: props.children ?? "",
      disabled: props.disabled,
    });
  });
  return out;
}

/**
 * Custom select — a styled, accessible dropdown that replaces the native
 * `<select>` (whose option list cannot be themed). Keyboard: ↑/↓ to move,
 * Enter/Space to choose, Esc to close. Closes on outside click / blur.
 */
function Select({
  value,
  onChange,
  children,
  options,
  className,
  placeholder = "请选择",
  disabled,
  "aria-label": ariaLabel,
}: SelectProps) {
  const items = options ?? childrenToOptions(children);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = items.find((o) => o.value === value);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // When opening, focus the currently-selected item.
  useEffect(() => {
    if (open) {
      const idx = items.findIndex((o) => o.value === value);
      setActive(idx >= 0 ? idx : 0);
    }
  }, [open, items, value]);

  function commit(idx: number): void {
    const opt = items[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  }

  function moveActive(delta: number): void {
    setActive((prev) => {
      let next = prev;
      for (let i = 0; i < items.length; i++) {
        next = (next + delta + items.length) % items.length;
        if (!items[next]?.disabled) break;
      }
      return next;
    });
  }

  function onKeyDown(e: React.KeyboardEvent): void {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] py-1 pr-2.5 pl-3 text-left text-sm text-[var(--color-text-high)] transition-colors",
          "hover:border-[var(--color-border-strong)]",
          "focus-visible:border-[var(--color-accent)] focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span className={cn("truncate", !selected && "text-[var(--color-text-low)]")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--color-text-low)] transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-full left-0 z-50 mt-1 max-h-64 min-w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-overlay)] p-1 shadow-lg animate-fade-in-up [--fade-y:4px]"
        >
          {items.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === active;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onMouseEnter={() => setActive(idx)}
                onClick={() => commit(idx)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left text-sm",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  isActive && !opt.disabled
                    ? "bg-[var(--color-bg-muted)] text-[var(--color-text-high)]"
                    : "text-[var(--color-text-mid)]",
                  isSelected && "text-[var(--color-text-high)]",
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="size-3.5 shrink-0 text-[var(--color-accent)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { Select };
