"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Payment } from "@/lib/types/subscription";
import { format } from "date-fns";
import { refundPayment } from "@/lib/api/subscriptions";
import { useAppSelector } from "@/redux/hooks";
import { Loader2 } from "lucide-react";

interface PaymentModalProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentModal({
  payment,
  open,
  onOpenChange,
}: PaymentModalProps) {
  const user = useAppSelector((state) => state.user);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const canRefund =
    (user.role === "super_admin" || user.role === "finance_manager") &&
    payment.status === "Paid" &&
    payment.refundable;

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert("Please provide a refund reason");
      return;
    }

    try {
      setRefunding(true);
      const result = await refundPayment(payment._id, refundReason);
      if (result.success) {
        alert("Refund processed successfully");
        setShowRefundForm(false);
        setRefundReason("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error processing refund:", error);
      alert("Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>View complete payment information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Transaction ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {payment.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
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
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Amount</p>
                  <p className="text-sm text-muted-foreground">
                    ${payment.amount} {payment.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(payment.date), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.planName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.userName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.userEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{payment.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    ${payment.amount} {payment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">
                    {payment.transactionId}
                  </span>
                </div>
                {payment.receiptUrl && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(payment.receiptUrl, "_blank")}
                    >
                      View Receipt
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Refund Section */}
          {canRefund && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Refund</CardTitle>
              </CardHeader>
              <CardContent>
                {!showRefundForm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowRefundForm(true)}
                  >
                    Process Refund
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="refundReason">Refund Reason *</Label>
                      <Input
                        id="refundReason"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="Enter refund reason"
                        disabled={refunding}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowRefundForm(false);
                          setRefundReason("");
                        }}
                        disabled={refunding}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRefund}
                        disabled={refunding || !refundReason.trim()}
                      >
                        {refunding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Confirm Refund"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

