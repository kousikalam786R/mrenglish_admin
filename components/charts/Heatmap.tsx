"use client";

import { HeatmapData } from "@/lib/types/analytics";

interface HeatmapProps {
  data: HeatmapData[];
  width?: number;
  height?: number;
  onCellHover?: (data: HeatmapData | null) => void;
}

export function Heatmap({
  data,
  width = 1000,
  height = 400,
  onCellHover,
}: HeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  const days = Array.from(new Set(data.map((d) => d.day))).sort();
  const hours = Array.from(new Set(data.map((d) => d.hour))).sort((a, b) => a - b);

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const cellWidth = (width - 100) / hours.length;
  const cellHeight = (height - 60) / days.length;

  const getColor = (value: number) => {
    const intensity = (value - minValue) / valueRange;
    const r = Math.floor(59 + (186 - 59) * intensity);
    const g = Math.floor(130 + (230 - 130) * intensity);
    const b = Math.floor(246 + (255 - 246) * intensity);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getCellData = (day: string, hour: number) => {
    return data.find((d) => d.day === day && d.hour === hour);
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={width}
        height={height}
        className="w-full h-auto"
        aria-label="Activity heatmap"
      >
        {/* Day labels */}
        {days.map((day, dayIndex) => (
          <text
            key={day}
            x={20}
            y={40 + dayIndex * cellHeight + cellHeight / 2}
            textAnchor="end"
            fontSize="12"
            fill="#374151"
            alignmentBaseline="middle"
          >
            {day}
          </text>
        ))}

        {/* Hour labels */}
        {hours.map((hour) => (
          <text
            key={hour}
            x={60 + (hour - hours[0]) * cellWidth + cellWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fontSize="11"
            fill="#6b7280"
          >
            {hour}:00
          </text>
        ))}

        {/* Heatmap cells */}
        {days.map((day, dayIndex) =>
          hours.map((hour) => {
            const cellData = getCellData(day, hour);
            const value = cellData?.value || 0;
            const x = 60 + (hour - hours[0]) * cellWidth;
            const y = 40 + dayIndex * cellHeight;

            return (
              <rect
                key={`${day}-${hour}`}
                x={x}
                y={y}
                width={cellWidth - 2}
                height={cellHeight - 2}
                fill={getColor(value)}
                stroke="#fff"
                strokeWidth="1"
                onMouseEnter={() => onCellHover?.(cellData || null)}
                onMouseLeave={() => onCellHover?.(null)}
                className="cursor-pointer"
              >
                <title>{`${day} ${hour}:00 - ${value} activities`}</title>
              </rect>
            );
          })
        )}

        {/* Legend */}
        <g transform={`translate(${width - 150}, 20)`}>
          <text x={0} y={0} fontSize="12" fill="#374151" fontWeight="500">
            Activity
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = minValue + valueRange * ratio;
            const y = 20 + index * 15;
            return (
              <g key={index}>
                <rect
                  x={0}
                  y={y}
                  width={15}
                  height={12}
                  fill={getColor(value)}
                  stroke="#fff"
                />
                <text
                  x={20}
                  y={y + 9}
                  fontSize="10"
                  fill="#6b7280"
                >
                  {Math.round(value)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

