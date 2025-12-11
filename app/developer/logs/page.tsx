"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Download, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogTable } from "@/components/developer/LogTable";
import {
  fetchLogs,
  tailLogs,
} from "@/lib/api/developer";
import {
  setLogs,
  appendLogs,
  setTail,
  setFilters,
  setLoading,
  resetFilters,
} from "@/redux/slices/developerSlice";
import { LogEntry, LogLevel, ServiceName } from "@/lib/types/developer";
import { downloadBlob, exportToJSON } from "@/lib/utils/export";

export default function LogsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const developer = useAppSelector((state) => state.developer);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "developer")) {
      loadLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developer.filters, user.role]);

  // Tail logs effect
  useEffect(() => {
    if (!developer.logs.tail) return;

    const interval = setInterval(async () => {
      try {
        const newLogs = await tailLogs(true);
        if (newLogs.length > 0) {
          dispatch(appendLogs(newLogs));
        }
      } catch (error) {
        console.error("Error tailing logs:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [developer.logs.tail, dispatch]);

  const loadLogs = async () => {
    try {
      dispatch(setLoading(true));
      const result = await fetchLogs(developer.filters, developer.logs.cursor);
      if (developer.logs.cursor) {
        dispatch(appendLogs(result.items));
      } else {
        dispatch(setLogs(result));
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleView = (log: LogEntry) => {
    setSelectedLog(log);
    setViewDialogOpen(true);
  };

  const handleDownload = (log: LogEntry) => {
    const content = JSON.stringify(log, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    downloadBlob(`log-${log._id}`, blob, "json");
  };

  const handleDownloadAll = () => {
    exportToJSON(developer.logs.items, `logs-${new Date().toISOString().split("T")[0]}`);
  };

  const handleDownloadTxt = () => {
    const content = developer.logs.items
      .map(
        (log) =>
          `[${log.timestamp}] ${log.level} ${log.service}: ${log.message}${log.stack ? "\n" + log.stack : ""}`
      )
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    downloadBlob(`logs-${new Date().toISOString().split("T")[0]}`, blob, "txt");
  };

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs</h1>
          <p className="text-muted-foreground">Application logs and diagnostics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTxt}>
            <Download className="h-4 w-4 mr-2" />
            Download TXT
          </Button>
          <Button variant="outline" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={developer.filters.search || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={developer.filters.level || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ level: e.target.value as any }))
                }
              >
                <option value="all">All Levels</option>
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </Select>
            </div>
            <div>
              <Select
                value={developer.filters.service || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ service: e.target.value as any }))
                }
              >
                <option value="all">All Services</option>
                <option value="auth">Auth</option>
                <option value="api">API</option>
                <option value="worker">Worker</option>
                <option value="db">Database</option>
                <option value="queue">Queue</option>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tail"
                checked={developer.logs.tail}
                onChange={(e) => dispatch(setTail(e.target.checked))}
                className="rounded"
              />
              <label htmlFor="tail" className="text-sm">Live Tail</label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date From</label>
              <Input
                type="date"
                value={developer.filters.dateFrom || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateFrom: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date To</label>
              <Input
                type="date"
                value={developer.filters.dateTo || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateTo: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(resetFilters())}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Logs List</CardTitle>
          <CardDescription>
            {developer.logs.items.length} log(s) {developer.logs.tail && "(tailing...)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {developer.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <LogTable
                logs={developer.logs.items}
                onView={handleView}
                onDownload={handleDownload}
              />
              {developer.logs.cursor && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={loadLogs}>
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>Full log entry information</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Timestamp</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {selectedLog.timestamp}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-sm">{selectedLog.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Service</p>
                  <p className="text-sm">{selectedLog.service}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Request ID</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {selectedLog.requestId || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm">{selectedLog.message}</p>
              </div>
              {selectedLog.stack && (
                <div>
                  <p className="text-sm font-medium mb-1">Stack Trace</p>
                  <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}
              {selectedLog.metadata && (
                <div>
                  <p className="text-sm font-medium mb-1">Metadata</p>
                  <pre className="text-xs font-mono bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
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

