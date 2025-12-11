"use client";

import { MetricTimeSeries } from "@/lib/types/developer";
import { LineChart } from "@/components/charts/LineChart";

interface MetricChartProps {
  metric: MetricTimeSeries;
  title: string;
  unit?: string;
  color?: string;
}

export function MetricChart({
  metric,
  title,
  unit = "",
  color = "#3b82f6",
}: MetricChartProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {metric.data.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {metric.data[metric.data.length - 1].value.toFixed(1)}{unit}
          </span>
        )}
      </div>
      <div className="h-48">
        <LineChart
          data={metric.data.map((d) => ({
            date: d.timestamp,
            value: d.value,
          }))}
          color={color}
          label={title}
          width={800}
          height={200}
        />
      </div>
    </div>
  );
}

