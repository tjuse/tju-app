"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { TjuLibCourse } from "@/lib/tju/types";
import { cn } from "@/lib/utils";
import { courseKey, useFavorites } from "./favorites-store";

interface Props {
  course: TjuLibCourse;
  semester: string;
  className?: string;
}

export function FavoriteButton({ course, semester, className }: Props) {
  const toggle = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => courseKey(course) in s.favorites);
  // 避免 SSR/hydration 不一致：挂载后再反映持久化状态
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const active = mounted && isFav;

  return (
    <button
      type="button"
      aria-label={active ? "取消收藏" : "收藏"}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        toggle(course, semester);
      }}
      className={cn(
        "flex size-7 items-center justify-center rounded-[var(--radius-full)] transition-colors",
        "hover:bg-[var(--color-bg-muted)]",
        active
          ? "text-[var(--color-warning)]"
          : "text-[var(--color-text-low)] hover:text-[var(--color-text-mid)]",
        className,
      )}
    >
      <Star className={cn("size-4", active && "fill-current")} />
    </button>
  );
}
