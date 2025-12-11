"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  fetchBilling,
} from "@/lib/api/settings";
import {
  setBilling,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { format } from "date-fns";

export default function BillingSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);

  useEffect(() => {
    const canView = user.role === "super_admin" || user.role === "admin" || user.role === "finance_manager";
    if (!canView) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    const canView = user.role === "super_admin" || user.role === "admin" || user.role === "finance_manager";
    if (canView) {
      loadBilling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadBilling = async () => {
    try {
      dispatch(setLoading(true));
      const billing = await fetchBilling();
      dispatch(setBilling(billing));
    } catch (error) {
      console.error("Error loading billing:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const canView = user.role === "super_admin" || user.role === "admin" || user.role === "finance_manager";
  const canExport = user.role === "super_admin" || user.role === "finance_manager";

  if (!canView) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Plans</h1>
          <p className="text-muted-foreground">Manage billing and invoices</p>
        </div>

        {settings.billing && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-2xl font-bold">{settings.billing.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Next Charge</p>
                    <p className="text-lg">
                      {settings.billing.nextChargeDate
                        ? format(new Date(settings.billing.nextChargeDate), "MMM dd, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-lg">
                      {settings.billing.paymentMethod
                        ? `${settings.billing.paymentMethod.brand?.toUpperCase()} •••• ${settings.billing.paymentMethod.last4}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Billing Contact</p>
                    <p className="text-lg">{settings.billing.billingContact}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline">Update Payment Method</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>Invoice history and downloads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.billing.invoices.map((invoice) => (
                        <TableRow key={invoice._id}>
                          <TableCell className="font-mono">{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {invoice.currency} {invoice.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : invoice.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {canExport && (
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SettingsLayout>
  );
}

