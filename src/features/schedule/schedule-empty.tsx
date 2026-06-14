"use client";

import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRefreshSchedule } from "./use-refresh-schedule";

/** 无课表缓存时的空态：引导从教务抓取，或后续手动/导入。 */
export function ScheduleEmpty() {
  const { refreshing, error, refresh } = useRefreshSchedule();

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
            点击下方按钮从教务系统（EAMS）抓取你的课表。需配置 TJU_USER/TJU_PASS 并连接校园网或
            VPN。
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} disabled={refreshing}>
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
