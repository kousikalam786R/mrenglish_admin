"use client";

import { useState, useEffect } from "react";
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
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plan } from "@/lib/types/subscription";
import { Loader2 } from "lucide-react";

interface PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (plan: Omit<Plan, "_id" | "createdAt" | "updatedAt" | "activeSubscribers">) => Promise<void>;
  plan?: Plan;
}

export function PlanModal({
  open,
  onOpenChange,
  onSave,
  plan,
}: PlanModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price.toString());
      setBillingCycle(plan.billingCycle);
      setDescription(plan.description || "");
    } else {
      setName("");
      setPrice("");
      setBillingCycle("Monthly");
      setDescription("");
    }
    setErrors({});
  }, [plan, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Plan name is required";
    }

    if (!price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    if (!billingCycle) {
      newErrors.billingCycle = "Billing cycle is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await onSave({
        name: name.trim(),
        price: parseFloat(price),
        billingCycle,
        description: description.trim() || undefined,
        status: plan?.status || "Active",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {plan
              ? "Update plan details"
              : "Create a new subscription plan"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Basic Plan"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle *</Label>
              <Select
                id="billingCycle"
                value={billingCycle}
                onChange={(e) =>
                  setBillingCycle(e.target.value as "Monthly" | "Yearly")
                }
                disabled={loading}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </Select>
              {errors.billingCycle && (
                <p className="text-sm text-destructive">
                  {errors.billingCycle}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Plan description (optional)"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                plan ? "Update Plan" : "Create Plan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

