"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { SegmentFilter } from "@/lib/types/marketing";

interface SegmentBuilderProps {
  filters: SegmentFilter[];
  onFiltersChange: (filters: SegmentFilter[]) => void;
  estimatedCount?: number;
  disabled?: boolean;
}

export function SegmentBuilder({
  filters,
  onFiltersChange,
  estimatedCount,
  disabled = false,
}: SegmentBuilderProps) {
  const addFilter = () => {
    onFiltersChange([
      ...filters,
      { field: "country", operator: "equals", value: "" },
    ]);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof SegmentFilter, value: any) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [field]: value };
    onFiltersChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Filters</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFilter}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>

      <div className="space-y-3">
        {filters.map((filter, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Field</Label>
              <Select
                value={filter.field}
                onChange={(e) => updateFilter(index, "field", e.target.value)}
                disabled={disabled}
              >
                <option value="country">Country</option>
                <option value="lastActive">Last Active (days)</option>
                <option value="plan">Plan</option>
                <option value="gender">Gender</option>
                <option value="lessonsCompleted">Lessons Completed</option>
                <option value="callsCount">Calls Count</option>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Operator</Label>
              <Select
                value={filter.operator}
                onChange={(e) => updateFilter(index, "operator", e.target.value)}
                disabled={disabled}
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="greater_than">Greater Than</option>
                <option value="less_than">Less Than</option>
                <option value="contains">Contains</option>
                <option value="in">In</option>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Value</Label>
              <Input
                value={String(filter.value)}
                onChange={(e) => updateFilter(index, "value", e.target.value)}
                placeholder="Value"
                disabled={disabled}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeFilter(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {estimatedCount !== undefined && filters.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted">
          <p className="text-sm font-medium mb-2">Estimated Users:</p>
          <p className="text-2xl font-bold">{estimatedCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sample count (mock)
          </p>
        </div>
      )}
    </div>
  );
}

