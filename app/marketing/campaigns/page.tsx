"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Plus, Search, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { CampaignTable } from "@/components/marketing/CampaignTable";
import {
  fetchCampaigns,
  updateCampaign,
} from "@/lib/api/marketing";
import {
  setCampaigns,
  setFilters,
  setLoading,
  resetFilters,
  updateCampaign as updateCampaignAction,
} from "@/redux/slices/marketingSlice";
import { Campaign } from "@/lib/types/marketing";

export default function CampaignsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const marketing = useAppSelector((state) => state.marketing);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadCampaigns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketing.filters, user.role]);

  const loadCampaigns = async () => {
    try {
      dispatch(setLoading(true));
      const campaigns = await fetchCampaigns(marketing.filters);
      dispatch(setCampaigns(campaigns));
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleView = (campaign: Campaign) => {
    router.push(`/marketing/campaigns/${campaign._id}`);
  };

  const handleEdit = (campaign: Campaign) => {
    router.push(`/marketing/campaigns/${campaign._id}`);
  };

  const handleDuplicate = async (campaign: Campaign) => {
    // Duplicate logic would go here
    console.log("Duplicate campaign:", campaign);
  };

  const handleStop = async (campaign: Campaign) => {
    try {
      const updated = await updateCampaign(campaign._id, { status: "Paused" });
      dispatch(updateCampaignAction(updated));
    } catch (error) {
      console.error("Error stopping campaign:", error);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage marketing campaigns</p>
        </div>
        <Link href="/marketing/campaigns/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={marketing.filters.search || ""}
                  onChange={(e) =>
                    dispatch(setFilters({ search: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Select
                value={marketing.filters.type || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ type: e.target.value as any }))
                }
              >
                <option value="all">All Types</option>
                <option value="Push">Push</option>
                <option value="Email">Email</option>
                <option value="In-App Banner">In-App Banner</option>
              </Select>
            </div>
            <div>
              <Select
                value={marketing.filters.status || "all"}
                onChange={(e) =>
                  dispatch(setFilters({ status: e.target.value as any }))
                }
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Running">Running</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(resetFilters())}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns List</CardTitle>
          <CardDescription>
            {marketing.campaigns.length} campaign(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marketing.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CampaignTable
              campaigns={marketing.campaigns}
              onView={handleView}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onStop={handleStop}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

