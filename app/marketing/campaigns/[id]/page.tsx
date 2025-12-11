"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchCampaignById, fetchCampaignMetrics, exportCampaignRecipients } from "@/lib/api/marketing";
import {
  setSelectedCampaign,
  setLoading,
} from "@/redux/slices/marketingSlice";
import { CampaignMetrics } from "@/lib/types/marketing";
import { LineChart } from "@/components/charts/LineChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadBlob } from "@/lib/utils/export";

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const marketing = useAppSelector((state) => state.marketing);
  const campaignId = params.id as string;
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing") && campaignId) {
      loadCampaign();
      loadMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      dispatch(setLoading(true));
      const campaign = await fetchCampaignById(campaignId);
      dispatch(setSelectedCampaign(campaign));
    } catch (error) {
      console.error("Error loading campaign:", error);
      router.push("/marketing/campaigns");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await fetchCampaignMetrics(campaignId);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading metrics:", error);
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportCampaignRecipients(campaignId);
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(`campaign-${campaignId}-recipients`, blob, "csv");
    } catch (error) {
      console.error("Error exporting recipients:", error);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  if (marketing.loading || !marketing.selectedCampaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const campaign = marketing.selectedCampaign;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/marketing/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.campaignId}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Recipients
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.sent.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.delivered.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.openRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clickRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline Chart */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Timeline</CardTitle>
            <CardDescription>Performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={metrics.timeline.map((t) => ({
                date: t.date,
                value: t.sent,
              }))}
              color="#3b82f6"
              label="Sent"
            />
          </CardContent>
        </Card>
      )}

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{campaign.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{campaign.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Segment</p>
              <p className="text-sm text-muted-foreground">{campaign.segmentName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Template</p>
              <p className="text-sm text-muted-foreground">{campaign.templateName || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

