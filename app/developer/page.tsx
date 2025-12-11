"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Activity, Code, Database, List } from "lucide-react";
import Link from "next/link";
import { fetchOverview } from "@/lib/api/developer";
import { DeveloperOverview } from "@/lib/types/developer";
import { Loader2 } from "lucide-react";

export default function DeveloperPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "developer")) {
      loadOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await fetchOverview();
      setOverview(data);
    } catch (error) {
      console.error("Error loading overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <p className="text-muted-foreground">System diagnostics and monitoring</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        overview && (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.recentErrors}</div>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.queueSize}</div>
                  <p className="text-xs text-muted-foreground">Jobs pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatUptime(overview.uptime)}</div>
                  <p className="text-xs text-muted-foreground">System uptime</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.errorRate.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">Last 24h</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Deploy</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-sm">{overview.recentDeploy || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">{overview.recentTag || "No tag"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/developer/logs">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Logs
                    </CardTitle>
                    <CardDescription>View application logs</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/developer/errors">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Errors
                    </CardTitle>
                    <CardDescription>Error aggregation and details</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/developer/metrics">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Metrics
                    </CardTitle>
                    <CardDescription>System metrics and performance</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/developer/jobs">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      Jobs
                    </CardTitle>
                    <CardDescription>Job queue management</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <Link href="/developer/traces">
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Traces
                    </CardTitle>
                    <CardDescription>Request tracing</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </>
        )
      )}
    </div>
  );
}
