"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2 } from "lucide-react";
import { Job } from "@/lib/types/developer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkerSimulatorProps {
  jobs: Job[];
  onJobUpdate: (job: Job) => void;
}

export function WorkerSimulator({ jobs, onJobUpdate }: WorkerSimulatorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const pendingJobs = jobs.filter((j) => j.status === "pending");
    if (pendingJobs.length === 0) {
      setIsRunning(false);
      return;
    }

    const interval = setInterval(() => {
      const nextJob = pendingJobs[0];
      if (nextJob) {
        // Simulate job processing
        const updated: Job = {
          ...nextJob,
          status: "running",
          startedAt: new Date().toISOString(),
        };
        onJobUpdate(updated);

        // After delay, mark as completed
        setTimeout(() => {
          const completed: Job = {
            ...updated,
            status: "completed",
            finishedAt: new Date().toISOString(),
            result: { success: true, processed: processedCount + 1 },
          };
          onJobUpdate(completed);
          setProcessedCount((c) => c + 1);
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isRunning, jobs, onJobUpdate, processedCount]);

  const pendingCount = jobs.filter((j) => j.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worker Simulator</CardTitle>
        <CardDescription>Simulate job processing (client-side mock)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {isRunning ? "Processing..." : "Stopped"}
            </p>
            <p className="text-xs text-muted-foreground">
              {pendingCount} pending jobs • {processedCount} processed
            </p>
          </div>
          <Button
            onClick={() => setIsRunning(!isRunning)}
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Worker
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Worker
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

