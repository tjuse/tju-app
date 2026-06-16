"use client";

import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
  error: string | null;
  /** null = still detecting, true = installed, false = not installed. */
  extensionReady: boolean | null;
}

/** 无课表时的空态：引导安装扩展或从教务抓取。 */
export function ScheduleEmpty({ onRefresh, refreshing, error, extensionReady }: Props) {
  const notInstalled = extensionReady === false;

  return (
    <>
      {error && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-2.5 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-accent-subtle)]">
          <Download className="size-6 text-[var(--color-accent)]" />
        </div>
        <div>
          <p className="font-medium text-[var(--color-text-high)]">还没有课表</p>
          <p className="mt-1 max-w-sm text-[13px] text-[var(--color-text-mid)] text-pretty">
            {notInstalled
              ? "需要安装 tju.app 浏览器扩展，并在浏览器中登录教务系统（校园网 / VPN），即可在此显示你的课表。"
              : "点击下方按钮，通过浏览器扩展从教务系统（EAMS）抓取你的课表。需已登录教务系统。"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRefresh} disabled={refreshing}>
            <Download className={cn("size-4", refreshing && "animate-pulse")} />
            {refreshing ? "抓取中…" : "从教务抓取课表"}
          </Button>
          <Button variant="outline" disabled>
            <Upload className="size-4" />
            截图导入
          </Button>
        </div>
      </Card>
    </>
  );
}
