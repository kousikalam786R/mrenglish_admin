"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Mail, Bell, Image, FileText, Users, TestTube } from "lucide-react";
import Link from "next/link";
import {
  fetchCampaigns,
  fetchScheduledCampaigns,
} from "@/lib/api/marketing";
import { useState } from "react";
import { Campaign, ScheduledCampaign } from "@/lib/types/marketing";
import { Loader2 } from "lucide-react";

export default function MarketingPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, scheduledData] = await Promise.all([
        fetchCampaigns(),
        fetchScheduledCampaigns(),
      ]);
      setCampaigns(campaignsData);
      setScheduled(scheduledData);
    } catch (error) {
      console.error("Error loading marketing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  const runningCampaigns = campaigns.filter((c) => c.status === "Running").length;
  const scheduledCount = scheduled.length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.sent, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Dashboard</h1>
        <p className="text-muted-foreground">Manage campaigns, push notifications, and marketing content</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
                <p className="text-xs text-muted-foreground">
                  {runningCampaigns} running
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledCount}</div>
                <p className="text-xs text-muted-foreground">Upcoming sends</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">In-app banners</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/marketing/campaigns">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Campaigns
                  </CardTitle>
                  <CardDescription>Manage marketing campaigns</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketing/push">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>Send push notifications</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketing/banners">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Banners
                  </CardTitle>
                  <CardDescription>Manage in-app banners</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketing/templates">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Templates
                  </CardTitle>
                  <CardDescription>Message templates</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketing/segments">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Segments
                  </CardTitle>
                  <CardDescription>User segments</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/marketing/abtests">
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    A/B Tests
                  </CardTitle>
                  <CardDescription>A/B testing</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Latest marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.slice(0, 5).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No campaigns yet
                </p>
              ) : (
                <div className="space-y-2">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div
                      key={campaign._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.type} • {campaign.segmentName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {campaign.metrics.sent.toLocaleString()} sent
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
