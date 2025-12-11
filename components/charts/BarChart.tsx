"use client";

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}

export function BarChart({
  data,
  width = 800,
  height = 300,
  color = "#3b82f6",
  label = "Value",
}: BarChartProps) {
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
  const barWidth = chartWidth / data.length - 10;
  const barSpacing = 10;

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-auto"
      aria-label={`Bar chart showing ${label}`}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = padding + chartHeight * (1 - ratio);
        const value = maxValue * ratio;
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

      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
        const y = padding + chartHeight - barHeight;

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx="4"
            />
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              fontSize="11"
              fill="#374151"
              fontWeight="500"
            >
              {Math.round(item.value)}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

