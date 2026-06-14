import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  /** 延迟（秒），用于 stagger 错落入场 */
  delay?: number;
  /** 初始 Y 位移（px） */
  y?: number;
  className?: string;
}

/**
 * 极简入场动效：opacity + 微小 translateY（纯 CSS）。
 *
 * 用 CSS 动画而非 framer-motion，好处：
 *  - 无需 JS 水合即可显示内容（避免水合延迟/失败时内容不可见）
 *  - 更轻、可作为 Server Component 使用
 *  - prefers-reduced-motion 下由 globals.css 全局降级为瞬时
 */
export function FadeIn({ children, delay = 0, y = 8, className }: FadeInProps) {
  return (
    <div
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${delay}s`, "--fade-y": `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
