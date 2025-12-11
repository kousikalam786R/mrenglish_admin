"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { X, Loader2, RotateCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JobTable } from "@/components/developer/JobTable";
import { WorkerSimulator } from "@/components/developer/WorkerSimulator";
import {
  fetchJobs,
  retryJob,
  cancelJob,
  requeueJob,
} from "@/lib/api/developer";
import {
  setJobs,
  updateJob,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/developerSlice";
import { Job } from "@/lib/types/developer";

export default function JobsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const developer = useAppSelector((state) => state.developer);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "developer")) {
      loadJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developer.filters, user.role]);

  const loadJobs = async () => {
    try {
      dispatch(setLoading(true));
      const jobs = await fetchJobs(developer.filters);
      dispatch(setJobs(jobs));
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRetry = async (job: Job) => {
    if (!confirm("Retry this job?")) return;

    try {
      const updated = await retryJob(job.jobId);
      dispatch(updateJob(updated));
    } catch (error) {
      console.error("Error retrying job:", error);
    }
  };

  const handleCancel = async (job: Job) => {
    if (!confirm("Cancel this job?")) return;

    try {
      const updated = await cancelJob(job.jobId);
      dispatch(updateJob(updated));
    } catch (error) {
      console.error("Error cancelling job:", error);
    }
  };

  const handleRequeue = async (job: Job) => {
    if (!confirm("Requeue this job?")) return;

    try {
      const updated = await requeueJob(job.jobId);
      dispatch(updateJob(updated));
    } catch (error) {
      console.error("Error requeuing job:", error);
    }
  };

  const handleView = (job: Job) => {
    setSelectedJob(job);
    setViewDialogOpen(true);
  };

  const handleJobUpdate = (job: Job) => {
    dispatch(updateJob(job));
  };

  const handleBulkRetry = async () => {
    if (!confirm("Retry all failed jobs?")) return;

    const failedJobs = developer.jobs.filter((j) => j.status === "failed");
    for (const job of failedJobs) {
      try {
        const updated = await retryJob(job.jobId);
        dispatch(updateJob(updated));
      } catch (error) {
        console.error(`Error retrying job ${job.jobId}:`, error);
      }
    }
  };

  const canManage = user.role === "super_admin" || user.role === "developer";

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  const failedCount = developer.jobs.filter((j) => j.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs / Queue</h1>
          <p className="text-muted-foreground">Job queue management</p>
        </div>
        {failedCount > 0 && canManage && (
          <Button variant="outline" onClick={handleBulkRetry}>
            <RotateCw className="h-4 w-4 mr-2" />
            Retry All Failed ({failedCount})
          </Button>
        )}
      </div>

      {/* Worker Simulator */}
      <WorkerSimulator
        jobs={developer.jobs}
        onJobUpdate={handleJobUpdate}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                value={developer.filters.jobStatus || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ jobStatus: e.target.value as any }))
                }
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div>
              <Select
                value={developer.filters.jobType || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ jobType: e.target.value as any }))
                }
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sendPush">Push Notification</option>
                <option value="videoProcessing">Video Processing</option>
                <option value="export">Export</option>
                <option value="backup">Backup</option>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(resetFilters())}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs List</CardTitle>
          <CardDescription>
            {developer.jobs.length} job(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {developer.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <JobTable
              jobs={developer.jobs}
              onRetry={handleRetry}
              onCancel={handleCancel}
              onRequeue={handleRequeue}
              onView={handleView}
              canManage={canManage}
            />
          )}
        </CardContent>
      </Card>

      {/* Job Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              {selectedJob?.jobId}
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm">{selectedJob.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm">{selectedJob.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Attempts</p>
                  <p className="text-sm">
                    {selectedJob.attempts} / {selectedJob.maxAttempts}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Payload</p>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedJob.payload, null, 2)}
                </pre>
              </div>
              {selectedJob.error && (
                <div>
                  <p className="text-sm font-medium mb-2">Error</p>
                  <pre className="text-xs font-mono bg-red-50 p-3 rounded overflow-x-auto text-red-900">
                    {selectedJob.error}
                  </pre>
                </div>
              )}
              {selectedJob.result && (
                <div>
                  <p className="text-sm font-medium mb-2">Result</p>
                  <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

