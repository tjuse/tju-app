"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** 延迟（秒），用于 stagger */
  delay?: number;
  /** 初始 Y 位移（px） */
  y?: number;
  className?: string;
}

/**
 * 极简入场动效：opacity + 微小 translateY，220ms ease-out。
 * 符合设计系统「克制、流畅、无炫技」原则。
 */
export function FadeIn({ children, delay = 0, y = 8, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * 列表容器：子项依次 stagger 入场。
 * 配合 <FadeIn> 子项使用，或用 staggerItem variants。
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
};
