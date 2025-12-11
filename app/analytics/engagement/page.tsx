"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchEngagementMetrics,
  fetchHourlyActivity,
  fetchFeatureUsage,
  fetchTopUsers,
} from "@/lib/api/analytics";
import { setTopUsers, setLoading } from "@/redux/slices/analyticsSlice";
import { BarChart } from "@/components/charts/BarChart";
import { format } from "date-fns";

export default function EngagementPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const analytics = useAppSelector((state) => state.analytics);
  const [metrics, setMetrics] = useState<any>(null);
  const [hourlyActivity, setHourlyActivity] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);

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
  }, [user.role]);

  const loadData = async () => {
    try {
      dispatch(setLoading(true));
      const [engagement, hourly, features, topUsers] = await Promise.all([
        fetchEngagementMetrics(analytics.filters),
        fetchHourlyActivity(analytics.filters),
        fetchFeatureUsage(analytics.filters),
        fetchTopUsers(analytics.filters),
      ]);

      setMetrics(engagement);
      setHourlyActivity(hourly);
      setFeatureUsage(features);
      dispatch(setTopUsers(topUsers));
    } catch (error) {
      console.error("Error loading engagement data:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!checkAccess(user.role, "analytics")) {
    return null;
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement & AI Usage</h1>
        <p className="text-muted-foreground">User engagement metrics and AI interaction data</p>
      </div>

      {analytics.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Engagement Metrics Cards */}
          {metrics && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.avgConversationsPerUser.toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per user</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Conversation Length</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.avgConversationLength.toFixed(1)}m
                  </div>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.successfulCalls} / {metrics.failedCalls}
                  </div>
                  <p className="text-xs text-muted-foreground">Success / Failed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Words</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.avgWordsPerConversation.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Per conversation</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Hourly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions per Hour (24h)</CardTitle>
              <CardDescription>Activity distribution throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              {hourlyActivity.length > 0 ? (
                <BarChart
                  data={hourlyActivity.map((h) => ({
                    label: `${h.hour}:00`,
                    value: h.sessions,
                  }))}
                  color="#3b82f6"
                  label="Sessions"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Breakdown</CardTitle>
              <CardDescription>Usage distribution across features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{feature.feature}</span>
                      <span className="text-muted-foreground">
                        {feature.usage.toLocaleString()} ({feature.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${feature.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top 20 Users by Interactions</CardTitle>
              <CardDescription>Most engaged users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Interactions</TableHead>
                      <TableHead>Last Interaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.topUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      analytics.topUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell className="font-medium">{user.userName}</TableCell>
                          <TableCell>{user.userEmail}</TableCell>
                          <TableCell>{user.interactions.toLocaleString()}</TableCell>
                          <TableCell>{formatDate(user.lastInteractionDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

