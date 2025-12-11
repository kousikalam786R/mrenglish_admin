"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Download, RefreshCw } from "lucide-react";
import {
  fetchSubscriptionMetrics,
  fetchTopPlansByRevenue,
} from "@/lib/api/subscriptions";
import {
  setMetrics,
  setFilters,
  setLoading,
  setRefunds,
} from "@/redux/slices/subscriptionSlice";
import { exportPaymentsToCSV } from "@/lib/utils/export";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchRefunds } from "@/lib/api/subscriptions";

export default function SubscriptionsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const subscription = useAppSelector((state) => state.subscription);
  const [activeTab, setActiveTab] = useState("overview");

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "subscriptions")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  // Load metrics
  useEffect(() => {
    if (checkAccess(user.role, "subscriptions")) {
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription.filters]);

  const loadMetrics = async () => {
    try {
      dispatch(setLoading(true));
      const metrics = await fetchSubscriptionMetrics(subscription.filters);
      dispatch(setMetrics(metrics));
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportCSV = () => {
    // This will export payments when payments tab is implemented
    // For now, just a placeholder
    console.log("Exporting to CSV...");
  };

  const handleExportExcel = () => {
    console.log("Exporting to Excel...");
  };

  const canExport = user.role === "super_admin" || user.role === "finance_manager";

  if (!checkAccess(user.role, "subscriptions")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage subscriptions, plans, and payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={subscription.filters.dateFrom || ""}
            onChange={(e) =>
              dispatch(setFilters({ dateFrom: e.target.value }))
            }
            className="w-auto"
          />
          <Input
            type="date"
            value={subscription.filters.dateTo || ""}
            onChange={(e) =>
              dispatch(setFilters({ dateTo: e.target.value }))
            }
            className="w-auto"
          />
          {canExport && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue KPIs */}
      {subscription.metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${subscription.metrics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${subscription.metrics.mrr.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Monthly Recurring Revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${subscription.metrics.arr.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Annual Recurring Revenue
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription.metrics.activeSubscriptions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Current users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscription.metrics.churnRate}%
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="plans">
          <PlansTabContent />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTabContent />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector((state) => state.subscription);
  const [topPlans, setTopPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTopPlans = async () => {
    try {
      setLoading(true);
      const plans = await fetchTopPlansByRevenue();
      setTopPlans(plans);
    } catch (error) {
      console.error("Error loading top plans:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Revenue Trend Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">
              Revenue chart placeholder (Chart library integration needed)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Plans by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Plans by Revenue</CardTitle>
          <CardDescription>Best performing subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg Revenue per User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPlans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topPlans.map((plan, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {plan.planName}
                        </TableCell>
                        <TableCell>{plan.subscribers}</TableCell>
                        <TableCell>${plan.revenue.toLocaleString()}</TableCell>
                        <TableCell>${plan.avgRevenuePerUser.toFixed(2)}</TableCell>
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

// Plans Tab - redirects to plans page
function PlansTabContent() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        Plans management is available on the dedicated Plans page
      </p>
      <Button onClick={() => window.location.href = "/subscriptions/plans"}>
        Go to Plans Page
      </Button>
    </div>
  );
}

// Payments Tab - redirects to payments page
function PaymentsTabContent() {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">
        Payments management is available on the dedicated Payments page
      </p>
      <Button onClick={() => window.location.href = "/subscriptions/payments"}>
        Go to Payments Page
      </Button>
    </div>
  );
}

// Refunds Tab
function RefundsTabContent() {
  const dispatch = useAppDispatch();
  const subscription = useAppSelector((state) => state.subscription);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const data = await fetchRefunds();
      setRefunds(data);
      dispatch(setRefunds(data));
    } catch (error) {
      console.error("Error loading refunds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveRefund = async (refundId: string, notes: string) => {
    // Placeholder for resolving refund
    console.log("Resolving refund:", refundId, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refunds</CardTitle>
        <CardDescription>Recent refund requests and status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No refunds found
                    </TableCell>
                  </TableRow>
                ) : (
                  refunds.map((refund) => (
                    <TableRow key={refund._id}>
                      <TableCell className="font-mono text-sm">
                        {refund.transactionId}
                      </TableCell>
                      <TableCell>{refund.userName}</TableCell>
                      <TableCell>
                        ${refund.amount} {refund.currency}
                      </TableCell>
                      <TableCell>{refund.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            refund.status === "Resolved"
                              ? "default"
                              : refund.status === "Rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(refund.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        {refund.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleResolveRefund(refund._id, "Resolved")
                            }
                          >
                            Resolve
                          </Button>
                        )}
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
  );
}
