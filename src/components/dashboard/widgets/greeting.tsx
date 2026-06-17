"use client";

import { useEffect, useState } from "react";

function getGreeting(hour: number): string {
  if (hour < 6) return "夜深了";
  if (hour < 9) return "早上好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  if (hour < 22) return "晚上好";
  return "夜深了";
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * Editorial masthead — eyebrow + serif greeting + monospaced dateline.
 * Time re-syncs after hydration and ticks every 30s.
 */
export function Greeting({ name }: { name?: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Re-sync to real time after hydration and update every 30 seconds
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const weekday = WEEKDAYS[now.getDay()];
  const time = now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="font-display font-semibold text-2xl text-[var(--color-text-high)] tracking-tight">
        {getGreeting(now.getHours())}
        {name ? <span className="text-[var(--color-text-mid)]">，{name}</span> : ""}
      </h2>
      <div className="flex items-center gap-2 font-mono text-[12px] text-[var(--color-text-mid)]">
        <span>
          {year}-{month}-{day}
        </span>
        <span className="text-[var(--color-text-low)]">·</span>
        <span>{weekday}</span>
        <span className="text-[var(--color-text-low)]">·</span>
        <span className="tabular-nums text-[var(--color-accent)]">{time}</span>
      </div>
    </div>
  );
}
