"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Download, Loader2, Bell } from "lucide-react";
import { MetricChart } from "@/components/developer/MetricChart";
import {
  fetchMetrics,
} from "@/lib/api/developer";
import {
  setMetrics,
  setFilters,
  setLoading,
} from "@/redux/slices/developerSlice";
import { Alert } from "@/lib/types/developer";
import { exportToJSON } from "@/lib/utils/export";

export default function MetricsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const developer = useAppSelector((state) => state.developer);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!checkAccess(user.role, "developer")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "developer")) {
      loadMetrics();
      loadAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [developer.filters.timeframe, user.role]);

  const loadMetrics = async () => {
    try {
      dispatch(setLoading(true));
      const metrics = await fetchMetrics(developer.filters);
      dispatch(setMetrics(metrics));
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadAlerts = () => {
    // Mock alerts
    setAlerts([
      {
        _id: "alert-1",
        name: "High Error Rate",
        severity: "high",
        message: "Error rate exceeded 5% threshold",
        acknowledged: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: "alert-2",
        name: "High CPU Usage",
        severity: "medium",
        message: "CPU usage above 80%",
        acknowledged: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        acknowledgedBy: "admin@mre.com",
      },
    ]);
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(
      alerts.map((a) =>
        a._id === alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
              acknowledgedBy: user.email,
            }
          : a
      )
    );
  };

  const handleExport = () => {
    if (developer.metrics) {
      exportToJSON(
        Object.values(developer.metrics),
        `metrics-${new Date().toISOString().split("T")[0]}`
      );
    }
  };

  if (!checkAccess(user.role, "developer")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics</h1>
          <p className="text-muted-foreground">System metrics and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={developer.filters.timeframe || "24h"}
            onChange={(e) =>
              dispatch(setFilters({ timeframe: e.target.value as any }))
            }
            className="w-32"
          >
            <option value="1h">Last 1h</option>
            <option value="6h">Last 6h</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7d</option>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`p-4 border rounded-lg ${
                    alert.severity === "critical"
                      ? "border-red-500 bg-red-50"
                      : alert.severity === "high"
                      ? "border-orange-500 bg-orange-50"
                      : "border-yellow-500 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.name}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(alert._id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Charts */}
      {developer.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {developer.metrics.rps && (
            <Card>
              <CardHeader>
                <CardTitle>Requests per Second</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.rps}
                  title="RPS"
                  unit=" req/s"
                  color="#3b82f6"
                />
              </CardContent>
            </Card>
          )}

          {developer.metrics.errorRate && (
            <Card>
              <CardHeader>
                <CardTitle>Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.errorRate}
                  title="Error Rate"
                  unit="%"
                  color="#ef4444"
                />
              </CardContent>
            </Card>
          )}

          {developer.metrics.cpu && (
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.cpu}
                  title="CPU"
                  unit="%"
                  color="#10b981"
                />
              </CardContent>
            </Card>
          )}

          {developer.metrics.memory && (
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.memory}
                  title="Memory"
                  unit="%"
                  color="#f59e0b"
                />
              </CardContent>
            </Card>
          )}

          {developer.metrics.dbConnections && (
            <Card>
              <CardHeader>
                <CardTitle>Database Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.dbConnections}
                  title="DB Connections"
                  color="#8b5cf6"
                />
              </CardContent>
            </Card>
          )}

          {developer.metrics.queueLength && (
            <Card>
              <CardHeader>
                <CardTitle>Queue Length</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricChart
                  metric={developer.metrics.queueLength}
                  title="Queue Length"
                  color="#ec4899"
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

