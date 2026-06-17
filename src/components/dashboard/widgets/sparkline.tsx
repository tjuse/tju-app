"use client";

import { useId } from "react";

interface SparklineProps {
  /** Data series; rendered left → right. Needs at least 2 points. */
  data: number[];
  /** Stroke + fill color (CSS color, defaults to the accent token). */
  color?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Minimal area sparkline (Cloudflare-style) — pure SVG, no deps. Draws a thin
 * line with a faint gradient fill underneath. Width is responsive via viewBox.
 */
export function Sparkline({
  data,
  color = "var(--color-accent)",
  className,
  width = 120,
  height = 32,
}: SparklineProps) {
  const gradId = useId();
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 2;
  const usableH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + usableH - ((v - min) / span) * usableH;
    return [x, y] as const;
  });

  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
