"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import {
  fetchKPIs,
  fetchTrends,
  fetchFunnel,
} from "@/lib/api/analytics";
import {
  setKPIs,
  setTrends,
  setFunnel,
  setFilters,
  setLoading,
} from "@/redux/slices/analyticsSlice";
import { LineChart } from "@/components/charts/LineChart";
import { exportToCSV, exportToJSON } from "@/lib/utils/export";
import { format } from "date-fns";

export default function AnalyticsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const analytics = useAppSelector((state) => state.analytics);
  const [metricUnit, setMetricUnit] = useState<"absolute" | "percentage">("absolute");

  useEffect(() => {
    if (!checkAccess(user.role, "analytics")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "analytics")) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analytics.filters, user.role]);

  const loadData = async () => {
    try {
      dispatch(setLoading(true));
      const [kpis, newUsersTrend, activeUsersTrend, conversionsTrend, funnel] = await Promise.all([
        fetchKPIs(analytics.filters),
        fetchTrends("newUsers", analytics.filters),
        fetchTrends("activeUsers", analytics.filters),
        fetchTrends("conversions", analytics.filters),
        fetchFunnel(analytics.filters),
      ]);

      dispatch(setKPIs(kpis));
      dispatch(
        setTrends({
          newUsers: newUsersTrend,
          activeUsers: activeUsersTrend,
          conversions: conversionsTrend,
        })
      );
      dispatch(setFunnel(funnel));
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDatePreset = (days: number) => {
    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    dispatch(
      setFilters({
        dateFrom: dateFrom.toISOString().split("T")[0],
        dateTo: dateTo.toISOString().split("T")[0],
      })
    );
  };

  const canExport = user.role === "super_admin" || user.role === "analytics_manager";

  if (!checkAccess(user.role, "analytics")) {
    return null;
  }

  const formatValue = (value: number, isPercentage: boolean = false) => {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={metricUnit}
            onChange={(e) => setMetricUnit(e.target.value as "absolute" | "percentage")}
            className="w-32"
          >
            <option value="absolute">Absolute</option>
            <option value="percentage">Percentage</option>
          </Select>
          {canExport && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (analytics.kpis) {
                    exportToCSV(
                      [analytics.kpis],
                      `analytics-kpis-${new Date().toISOString().split("T")[0]}`,
                      Object.keys(analytics.kpis).map((key) => ({
                        key: key as keyof typeof analytics.kpis,
                        label: key,
                      }))
                    );
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (analytics.kpis) {
                    exportToJSON([analytics.kpis], `analytics-kpis-${new Date().toISOString().split("T")[0]}`);
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Date Range & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(7)}
                >
                  7d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(30)}
                >
                  30d
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDatePreset(90)}
                >
                  90d
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">From</label>
              <Input
                type="date"
                value={analytics.filters.dateFrom || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateFrom: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input
                type="date"
                value={analytics.filters.dateTo || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateTo: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Platform</label>
              <Select
                value={analytics.filters.platform || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ platform: e.target.value as any }))
                }
              >
                <option value="all">All</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
                <option value="Web">Web</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Plan</label>
              <Select
                value={analytics.filters.plan || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ plan: e.target.value as any }))
                }
              >
                <option value="all">All</option>
                <option value="Free">Free</option>
                <option value="Paid">Paid</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {analytics.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        analytics.kpis && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">New Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatValue(analytics.kpis.newUsers)}</div>
                  <p className="text-xs text-muted-foreground">Period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatValue(analytics.kpis.dau)} / {formatValue(analytics.kpis.mau)}
                  </div>
                  <p className="text-xs text-muted-foreground">DAU / MAU</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatValue(analytics.kpis.conversionRate, true)}
                  </div>
                  <p className="text-xs text-muted-foreground">Free → Paid</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${formatValue(analytics.kpis.mrr)}</div>
                  <p className="text-xs text-muted-foreground">Monthly Recurring</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Session Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatValue(analytics.kpis.avgSessionLength)}m
                  </div>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Calls / AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatValue(analytics.kpis.callsCount)} / {formatValue(analytics.kpis.aiInteractions)}
                  </div>
                  <p className="text-xs text-muted-foreground">Interactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatValue(analytics.kpis.churnRate, true)}
                  </div>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trends</CardTitle>
                <CardDescription>User activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.trends.newUsers && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">New Users</h3>
                      <LineChart
                        data={analytics.trends.newUsers.data}
                        color="#3b82f6"
                        label="New Users"
                      />
                    </div>
                  )}
                  {analytics.trends.activeUsers && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Active Users</h3>
                      <LineChart
                        data={analytics.trends.activeUsers.data}
                        color="#10b981"
                        label="Active Users"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey from install to paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.funnel.map((step, index) => {
                    const maxCount = analytics.funnel[0]?.count || 1;
                    const width = (step.count / maxCount) * 100;
                    return (
                      <div key={step.step} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{step.step}</span>
                          <span className="text-muted-foreground">
                            {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-4">
                          <div
                            className="bg-primary h-4 rounded-full transition-all"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}
