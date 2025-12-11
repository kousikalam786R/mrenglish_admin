"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import {
  fetchHeatmap,
} from "@/lib/api/analytics";
import {
  setHeatmap,
  setLoading,
} from "@/redux/slices/analyticsSlice";
import { Heatmap } from "@/components/charts/Heatmap";
import { HeatmapData } from "@/lib/types/analytics";

export default function HeatmapPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const analytics = useAppSelector((state) => state.analytics);
  const [eventType, setEventType] = useState<string>("all");
  const [hoveredCell, setHoveredCell] = useState<HeatmapData | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "analytics")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "analytics")) {
      loadHeatmap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role, eventType]);

  const loadHeatmap = async () => {
    try {
      dispatch(setLoading(true));
      const heatmapData = await fetchHeatmap(analytics.filters);
      dispatch(setHeatmap(heatmapData));
    } catch (error) {
      console.error("Error loading heatmap:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDownload = () => {
    // Placeholder for image download
    alert("Image download functionality will be implemented here");
  };

  if (!checkAccess(user.role, "analytics")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Activity Heatmap</h1>
          <p className="text-muted-foreground">User activity by hour and day</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-40"
          >
            <option value="all">All Events</option>
            <option value="logins">Logins</option>
            <option value="lesson-starts">Lesson Starts</option>
            <option value="calls">Calls</option>
          </Select>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm">
              <p className="font-medium">
                {hoveredCell.day} {hoveredCell.hour}:00
              </p>
              <p className="text-muted-foreground">
                {hoveredCell.value} activities
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>
            Hover over cells to see activity counts. Darker colors indicate higher activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Heatmap
                data={analytics.heatmap}
                width={1000}
                height={400}
                onCellHover={setHoveredCell}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

