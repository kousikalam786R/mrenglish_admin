"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Download, Loader2, ExternalLink } from "lucide-react";
import { TraceViewer } from "@/components/developer/TraceViewer";
import {
  fetchTraceByRequestId,
} from "@/lib/api/developer";
import {
  setTrace,
  setLoading,
} from "@/redux/slices/developerSlice";
import { Trace } from "@/lib/types/developer";
import { downloadBlob, exportToJSON } from "@/lib/utils/export";

export default function TracesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const developer = useAppSelector((state) => state.developer);
  const [requestId, setRequestId] = useState(searchParams.get("requestId") || "");
  const [loadingTrace, setLoadingTrace] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    const requestIdParam = searchParams.get("requestId");
    if (requestIdParam && checkAccess(user.role, "developer")) {
      setRequestId(requestIdParam);
      loadTrace(requestIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user.role]);

  const loadTrace = async (id: string) => {
    if (!id.trim()) return;

    try {
      setLoadingTrace(true);
      const trace = await fetchTraceByRequestId(id.trim());
      dispatch(setTrace(trace));
    } catch (error) {
      console.error("Error loading trace:", error);
      alert("Trace not found");
    } finally {
      setLoadingTrace(false);
    }
  };

  const handleSearch = () => {
    if (requestId.trim()) {
      loadTrace(requestId.trim());
    }
  };

  const handleDownload = () => {
    const traceId = Object.keys(developer.traces)[0];
    if (traceId) {
      const trace = developer.traces[traceId];
      exportToJSON([trace], `trace-${trace.requestId}`);
    }
  };

  const handleViewLogs = (requestId: string) => {
    router.push(`/developer/logs?search=${requestId}`);
  };

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  const currentTrace = Object.values(developer.traces)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Traces</h1>
        <p className="text-muted-foreground">Request tracing and span analysis</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="requestId">Request ID</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="requestId"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Enter request ID..."
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch} disabled={loadingTrace || !requestId.trim()}>
                  {loadingTrace ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trace Viewer */}
      {loadingTrace ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : currentTrace ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Trace JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleViewLogs(currentTrace.requestId)}
              className="ml-2"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Related Logs
            </Button>
          </div>
          <TraceViewer trace={currentTrace} />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Enter a request ID to view trace
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

