"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Edit, Archive, Loader2 } from "lucide-react";
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
  fetchPlans,
  createPlan,
  updatePlan,
} from "@/lib/api/subscriptions";
import {
  setPlans,
  addPlan,
  updatePlan as updatePlanAction,
  archivePlan,
  setLoading,
} from "@/redux/slices/subscriptionSlice";
import { PlanModal } from "@/components/PlanModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export default function PlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const subscription = useAppSelector((state) => state.subscription);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null);

  // Permission enforcement
  useEffect(() => {
    if (!checkAccess(user.role, "subscriptions")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "subscriptions")) {
      loadPlans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    try {
      dispatch(setLoading(true));
      const plans = await fetchPlans();
      dispatch(setPlans(plans));
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      const newPlan = await createPlan(planData);
      dispatch(addPlan(newPlan));
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating plan:", error);
      throw error;
    }
  };

  const handleUpdatePlan = async (planId: string, planData: any) => {
    try {
      const updatedPlan = await updatePlan(planId, planData);
      dispatch(updatePlanAction(updatedPlan));
      setEditingPlan(null);
    } catch (error) {
      console.error("Error updating plan:", error);
      throw error;
    }
  };

  const handleArchivePlan = async (planId: string) => {
    try {
      await updatePlan(planId, { status: "Archived" });
      dispatch(archivePlan(planId));
      setArchiveConfirm(null);
    } catch (error) {
      console.error("Error archiving plan:", error);
    }
  };

  if (!checkAccess(user.role, "subscriptions")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>
            All available subscription plans
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
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Active Subscribers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscription.plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No plans found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscription.plans.map((plan) => (
                      <TableRow key={plan._id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>${plan.price}</TableCell>
                        <TableCell>{plan.billingCycle}</TableCell>
                        <TableCell>{plan.activeSubscribers}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              plan.status === "Active" ? "default" : "secondary"
                            }
                          >
                            {plan.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingPlan(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {plan.status === "Active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setArchiveConfirm(plan._id)}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
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

      {/* Create Plan Modal */}
      <PlanModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreatePlan}
      />

      {/* Edit Plan Modal */}
      {editingPlan && (
        <PlanModal
          open={!!editingPlan}
          onOpenChange={(open) => !open && setEditingPlan(null)}
          onSave={(data) => handleUpdatePlan(editingPlan._id, data)}
          plan={editingPlan}
        />
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={!!archiveConfirm}
        onOpenChange={(open) => !open && setArchiveConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive this plan? It will no longer be
              available for new subscriptions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setArchiveConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => archiveConfirm && handleArchivePlan(archiveConfirm)}
            >
              Archive
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

