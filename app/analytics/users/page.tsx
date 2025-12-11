"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchTrends,
  fetchCountryStats,
} from "@/lib/api/analytics";
import {
  setTrends,
  setFilters,
  setLoading,
} from "@/redux/slices/analyticsSlice";
import { LineChart } from "@/components/charts/LineChart";
import { useState } from "react";

export default function UsersTrendsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const analytics = useAppSelector((state) => state.analytics);
  const [countryStats, setCountryStats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      const [newUsersTrend, returningTrend] = await Promise.all([
        fetchTrends("newUsers", analytics.filters),
        fetchTrends("returningUsers", analytics.filters),
      ]);
      dispatch(
        setTrends({
          newUsers: newUsersTrend,
          returningUsers: returningTrend,
        })
      );

      const stats = await fetchCountryStats(analytics.filters);
      setCountryStats(stats);
    } catch (error) {
      console.error("Error loading user trends:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (!checkAccess(user.role, "analytics")) {
    return null;
  }

  const filteredStats = countryStats.filter(
    (stat) =>
      stat.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Trends</h1>
        <p className="text-muted-foreground">User acquisition and activity trends</p>
      </div>

      {analytics.loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* New Users Chart */}
          <Card>
            <CardHeader>
              <CardTitle>New Users</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.trends.newUsers ? (
                <LineChart
                  data={analytics.trends.newUsers.data}
                  color="#3b82f6"
                  label="New Users"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Returning vs New Users */}
          <Card>
            <CardHeader>
              <CardTitle>Returning vs New Users</CardTitle>
              <CardDescription>User activity breakdown</CardDescription>
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
                {analytics.trends.returningUsers && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Returning Users</h3>
                    <LineChart
                      data={analytics.trends.returningUsers.data}
                      color="#10b981"
                      label="Returning Users"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Countries by New Users</CardTitle>
              <CardDescription>Geographic distribution of new users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by country or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>New Users</TableHead>
                      <TableHead>Active Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          No data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStats.slice(0, 10).map((stat) => (
                        <TableRow key={stat.country}>
                          <TableCell className="font-medium">{stat.country}</TableCell>
                          <TableCell>{stat.newUsers.toLocaleString()}</TableCell>
                          <TableCell>{stat.activeRate.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Cohort Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis</CardTitle>
              <CardDescription>User retention by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View detailed cohort analysis and retention metrics
              </p>
              <Link href="/analytics/retention">
                <Button variant="outline">View Cohort Analysis</Button>
              </Link>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

