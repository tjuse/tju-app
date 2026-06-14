"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CourseStats } from "./stats";

const BLUE = "#3b82f6";
const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
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

export function StatsCharts({ stats }: { stats: CourseStats }) {
  const stuTypeData = [
    { name: "本科", value: stats.undergraduate },
    { name: "研究生", value: stats.graduate },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* 本研构成 */}
      <ChartCard title="本研构成">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={stuTypeData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              label={(e) => `${e.name} ${e.value}`}
            >
              {stuTypeData.map((d, i) => (
                <Cell key={d.name} fill={PALETTE[i]} stroke="none" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 课程类别 Top */}
      <ChartCard title="课程类别分布（Top 10）">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.byCourseType} layout="vertical" margin={{ left: 12, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={96}
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Bar dataKey="count" fill={BLUE} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 上课星期 */}
      <ChartCard title="上课星期分布">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.byWeekday} margin={{ left: -16, right: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Bar dataKey="count" fill={BLUE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 学分分布 */}
      <ChartCard title="学分分布">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.byCredit} margin={{ left: -16, right: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 校区分布 */}
      <ChartCard title="校区分布">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.byCampus} margin={{ left: -16, right: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: AXIS }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: AXIS }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top 教师 */}
      <ChartCard title="开课最多的教师（Top 10）">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.topTeachers} layout="vertical" margin={{ left: 12, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 11, fill: AXIS }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(127,127,127,0.08)" }} />
            <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
