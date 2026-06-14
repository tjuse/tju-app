"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CatalogTrend } from "./trends";

const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];
const AXIS = "#71717a";

const tooltipStyle = {
  background: "var(--color-bg-overlay)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-text-high)",
} as const;

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Truncate semester label for compact axis display. */
function shortLabel(label: string): string {
  // "2025-2026 学年 春季学期" → "25-26 春" (compact axis label)
  return label.replace(/(\d{2})\d{2}-(\d{2})\d{2} 学年 (.季)学期/, "$1-$2 $3");
}

export function TrendsCharts({ trend }: { trend: CatalogTrend }) {
  const totalData = trend.total.map((p) => ({
    ...p,
    label: shortLabel(p.label),
  }));

  const campusData = trend.total.map((p, i) => {
    const point: Record<string, unknown> = { label: shortLabel(p.label) };
    for (const campus of trend.topCampuses) {
      point[campus] = trend.byCampus[campus]?.[i]?.count ?? 0;
    }
    return point;
  });

  const typeData = trend.total.map((p, i) => {
    const point: Record<string, unknown> = { label: shortLabel(p.label) };
    for (const type of trend.topCourseTypes) {
      point[type] = trend.byCourseType[type]?.[i]?.count ?? 0;
    }
    return point;
  });

  const axisProps = {
    tick: { fontSize: 11, fill: AXIS },
    tickLine: false,
    axisLine: false,
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Total offerings per semester */}
      <ChartCard title="全校开课总量趋势">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={totalData} margin={{ left: -16, right: 8 }}>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="undergraduate"
              name="本科"
              fill={PALETTE[0]}
              stackId="s"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="graduate"
              name="研究生"
              fill={PALETTE[1]}
              stackId="s"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Trend line (total) */}
      <ChartCard title="总量折线">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={totalData} margin={{ left: -16, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="count"
              name="总课程数"
              stroke={PALETTE[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* By campus */}
      {trend.topCampuses.length > 0 && (
        <ChartCard title="各校区开课趋势">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={campusData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {trend.topCampuses.map((campus, i) => (
                <Line
                  key={campus}
                  type="monotone"
                  dataKey={campus}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* By course type */}
      {trend.topCourseTypes.length > 0 && (
        <ChartCard title="主要课程类别开课趋势（Top 8）">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={typeData} margin={{ left: -16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {trend.topCourseTypes.map((type, i) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={1.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}
