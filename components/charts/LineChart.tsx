"use client";

import { TrendDataPoint } from "@/lib/types/analytics";

interface LineChartProps {
  data: TrendDataPoint[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export function LineChart({
  data,
  width = 800,
  height = 300,
  color = "#3b82f6",
  label = "Value",
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return `${x},${y}`;
  }).join(" ");

  const pathD = `M ${points}`;

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-auto"
      aria-label={`Line chart showing ${label} over time`}
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight * (1 - ratio);
        const value = minValue + valueRange * ratio;
        return (
          <g key={ratio}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={y + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {Math.round(value)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path
        d={`${pathD} L ${width - padding},${padding + chartHeight} L ${padding},${padding + chartHeight} Z`}
        fill="url(#gradient)"
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {data.map((point, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
        const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="4"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {/* X-axis labels */}
      {data.map((point, index) => {
        if (index % Math.ceil(data.length / 6) !== 0 && index !== data.length - 1) return null;
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
        return (
          <text
            key={index}
            x={x}
            y={height - padding + 20}
            textAnchor="middle"
            fontSize="11"
            fill="#6b7280"
          >
            {new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </text>
        );
      })}
    </svg>
  );
}

