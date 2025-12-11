"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SchedulePickerProps {
  onScheduleChange: (schedule: {
    type: "immediate" | "scheduled";
    datetime?: string;
    timezone?: string;
  }) => void;
  defaultType?: "immediate" | "scheduled";
}

export function SchedulePicker({
  onScheduleChange,
  defaultType = "immediate",
}: SchedulePickerProps) {
  const [scheduleType, setScheduleType] = useState<"immediate" | "scheduled">(
    defaultType
  );
  const [datetime, setDatetime] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  const handleTypeChange = (value: string) => {
    const type = value as "immediate" | "scheduled";
    setScheduleType(type);
    onScheduleChange({
      type,
      datetime: type === "scheduled" ? datetime : undefined,
      timezone: type === "scheduled" ? timezone : undefined,
    });
  };

  const handleDatetimeChange = (value: string) => {
    setDatetime(value);
    if (scheduleType === "scheduled") {
      onScheduleChange({ type: "scheduled", datetime: value, timezone });
    }
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    if (scheduleType === "scheduled") {
      onScheduleChange({ type: "scheduled", datetime, timezone: value });
    }
  };

  return (
    <div className="space-y-4">
      <Label>Schedule</Label>
      <RadioGroup value={scheduleType} onValueChange={handleTypeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="immediate" id="immediate" />
          <Label htmlFor="immediate">Send Immediately</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="scheduled" id="scheduled" />
          <Label htmlFor="scheduled">Schedule for Later</Label>
        </div>
      </RadioGroup>

      {scheduleType === "scheduled" && (
        <div className="space-y-4 pl-6 border-l-2">
          <div className="space-y-2">
            <Label htmlFor="datetime">Date & Time</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={datetime}
              onChange={(e) => handleDatetimeChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="Asia/Shanghai">Shanghai (CST)</option>
            </Select>
          </div>
          {datetime && (
            <p className="text-sm text-muted-foreground">
              Scheduled for: {new Date(datetime).toLocaleString()} ({timezone})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

