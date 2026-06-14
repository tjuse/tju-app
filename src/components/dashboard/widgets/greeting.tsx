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

export function Greeting({ name }: { name?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return <div className="h-8 w-48 skeleton" />;
  }

  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`;

  return (
    <div>
      <h2 className="font-semibold text-2xl text-[var(--color-text-high)] tracking-tight">
        {getGreeting(now.getHours())}
        {name ? `，${name}` : ""}
      </h2>
      <p className="mt-1 text-[var(--color-text-mid)] text-sm">{dateStr}</p>
    </div>
  );
}
