"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RotateCw, X, Play, Eye } from "lucide-react";
import { Job } from "@/lib/types/developer";
import { format } from "date-fns";

interface JobTableProps {
  jobs: Job[];
  onRetry: (job: Job) => void;
  onCancel: (job: Job) => void;
  onRequeue: (job: Job) => void;
  onView: (job: Job) => void;
  canManage?: boolean;
}

export function JobTable({
  jobs,
  onRetry,
  onCancel,
  onRequeue,
  onView,
  canManage = false,
}: JobTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (status: Job["status"]) => {
    const variants = {
      pending: "secondary",
      running: "default",
      failed: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead>Enqueued At</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead>Finished At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No jobs found
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell className="font-mono text-sm">{job.jobId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{job.type}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  {job.attempts} / {job.maxAttempts}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {formatDate(job.enqueuedAt)}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {formatDate(job.startedAt)}
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {formatDate(job.finishedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(job)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canManage && (
                      <>
                        {job.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRetry(job)}
                            title="Retry"
                          >
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        )}
                        {(job.status === "pending" || job.status === "running") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onCancel(job)}
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === "failed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRequeue(job)}
                            title="Requeue"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

