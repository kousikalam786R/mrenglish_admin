"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Eye, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fetchPayments } from "@/lib/api/subscriptions";
import {
  setPayments,
  setFilters,
  setLoading,
} from "@/redux/slices/subscriptionSlice";
import { PaymentModal } from "@/components/PaymentModal";
import { exportPaymentsToCSV } from "@/lib/utils/export";
import { Download } from "lucide-react";

export default function PaymentsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const subscription = useAppSelector((state) => state.subscription);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "subscriptions")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "subscriptions")) {
      loadPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription.filters]);

  const loadPayments = async () => {
    try {
      dispatch(setLoading(true));
      const payments = await fetchPayments(subscription.filters);
      dispatch(setPayments(payments));
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    exportPaymentsToCSV(subscription.payments);
  };

  const canExport = user.role === "super_admin" || user.role === "finance_manager";

  if (!checkAccess(user.role, "subscriptions")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            View and manage payment transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Date From
              </label>
              <Input
                type="date"
                value={subscription.filters.dateFrom || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateFrom: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date To</label>
              <Input
                type="date"
                value={subscription.filters.dateTo || ""}
                onChange={(e) =>
                  dispatch(setFilters({ dateTo: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={subscription.filters.status || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ status: e.target.value }))
                }
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
                <option value="Pending">Pending</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Payment Method
              </label>
              <Select
                value={subscription.filters.paymentMethod || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ paymentMethod: e.target.value }))
                }
              >
                <option value="all">All Methods</option>
                <option value="Stripe">Stripe</option>
                <option value="Razorpay">Razorpay</option>
                <option value="PayPal">PayPal</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            {subscription.payments.length} total payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription.loading ? (
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
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscription.payments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.userName}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.planName}</TableCell>
                        <TableCell>${payment.amount}</TableCell>
                        <TableCell>{payment.currency}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "Paid"
                                ? "default"
                                : payment.status === "Failed"
                                ? "destructive"
                                : payment.status === "Refunded"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(payment.date), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}

