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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchCohort,
} from "@/lib/api/analytics";
import {
  setCohorts,
  setLoading,
} from "@/redux/slices/analyticsSlice";
import { exportToCSV } from "@/lib/utils/export";
import { LineChart } from "@/components/charts/LineChart";

export default function RetentionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const analytics = useAppSelector((state) => state.analytics);
  const [cohortPeriod, setCohortPeriod] = useState<"week" | "month">("month");
  const [retentionMetrics, setRetentionMetrics] = useState({
    day1: 0,
    day7: 0,
    day30: 0,
  });

  useEffect(() => {
    if (!checkAccess(user.role, "analytics")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "analytics")) {
      loadCohorts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohortPeriod, user.role]);

  useEffect(() => {
    if (analytics.cohorts.length > 0) {
      const latest = analytics.cohorts[analytics.cohorts.length - 1];
      setRetentionMetrics({
        day1: latest.retention.day1,
        day7: latest.retention.day7,
        day30: latest.retention.day30,
      });
    }
  }, [analytics.cohorts]);

  const loadCohorts = async () => {
    try {
      dispatch(setLoading(true));
      const cohorts = await fetchCohort({ period: cohortPeriod });
      dispatch(setCohorts(cohorts));
    } catch (error) {
      console.error("Error loading cohorts:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExport = () => {
    const headers = [
      { key: "cohort" as keyof typeof analytics.cohorts[0], label: "Cohort" },
      { key: "size" as keyof typeof analytics.cohorts[0], label: "Size" },
    ];
    exportToCSV(analytics.cohorts, `cohorts-${new Date().toISOString().split("T")[0]}`, headers);
  };

  const getRetentionColor = (value: number) => {
    if (value >= 50) return "bg-green-500";
    if (value >= 30) return "bg-yellow-500";
    if (value >= 15) return "bg-orange-500";
    return "bg-red-500";
  };

  const canExport = user.role === "super_admin" || user.role === "analytics_manager";

  if (!checkAccess(user.role, "analytics")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Retention & Cohorts</h1>
          <p className="text-muted-foreground">User retention analysis by cohort</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={cohortPeriod}
            onChange={(e) => setCohortPeriod(e.target.value as "week" | "month")}
            className="w-32"
          >
            <option value="week">By Week</option>
            <option value="month">By Month</option>
          </Select>
          {canExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Day 1 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionMetrics.day1.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Latest cohort</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Day 7 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionMetrics.day7.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Latest cohort</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Day 30 Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retentionMetrics.day30.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Latest cohort</p>
          </CardContent>
        </Card>
      </div>

      {/* Retention Chart */}
      {analytics.cohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rolling Retention</CardTitle>
            <CardDescription>Retention trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={analytics.cohorts.map((c, i) => ({
                date: c.cohort,
                value: c.retention.day30,
              }))}
              color="#3b82f6"
              label="Day 30 Retention"
            />
          </CardContent>
        </Card>
      )}

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Matrix</CardTitle>
          <CardDescription>Retention percentages by cohort and period</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Day 1</TableHead>
                    <TableHead>Day 7</TableHead>
                    <TableHead>Day 30</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.cohorts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.cohorts.map((cohort) => (
                      <TableRow key={cohort.cohort}>
                        <TableCell className="font-medium">{cohort.cohort}</TableCell>
                        <TableCell>{cohort.size.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded ${getRetentionColor(cohort.retention.day1)}`}
                            />
                            <span>{cohort.retention.day1.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded ${getRetentionColor(cohort.retention.day7)}`}
                            />
                            <span>{cohort.retention.day7.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded ${getRetentionColor(cohort.retention.day30)}`}
                            />
                            <span>{cohort.retention.day30.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

