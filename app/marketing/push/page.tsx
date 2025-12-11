"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Loader2, Smartphone } from "lucide-react";
import { sendPush } from "@/lib/api/marketing";
import { sendToFirebase } from "@/lib/integrations";
import { fetchSegments } from "@/lib/api/marketing";
import { Segment } from "@/lib/types/marketing";
import { SchedulePicker } from "@/components/marketing/SchedulePicker";

export default function PushPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [schedule, setSchedule] = useState<{
    type: "immediate" | "scheduled";
    datetime?: string;
    timezone?: string;
  }>({ type: "immediate" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "marketing")) {
      loadSegments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadSegments = async () => {
    try {
      const segmentsData = await fetchSegments();
      setSegments(segmentsData);
    } catch (error) {
      console.error("Error loading segments:", error);
    }
  };

  const canSend = user.role === "super_admin" || user.role === "marketing_manager";

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      alert("Title and message are required");
      return;
    }

    try {
      setSending(true);
      const result = await sendPush({
        title: title.trim(),
        message: message.trim(),
        deepLink: deepLink.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        segmentId: segmentId || undefined,
        scheduledAt: schedule.type === "scheduled" ? schedule.datetime : undefined,
      });

      if (canSend) {
        // In production, this would call the actual Firebase integration
        await sendToFirebase({
          title: title.trim(),
          message: message.trim(),
          deepLink: deepLink.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          segmentId: segmentId || undefined,
          scheduledAt: schedule.type === "scheduled" ? schedule.datetime : undefined,
        });
      }

      alert(`Push notification ${canSend ? "sent" : "previewed"} successfully!`);
      setTitle("");
      setMessage("");
      setDeepLink("");
      setImageUrl("");
      setSegmentId("");
    } catch (error) {
      console.error("Error sending push:", error);
      alert("Error sending push notification");
    } finally {
      setSending(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">Send push notifications to users</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Send</CardTitle>
            <CardDescription>Send a push notification immediately or schedule it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Notification message"
                disabled={sending}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deepLink">Deep Link (Optional)</Label>
              <Input
                id="deepLink"
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="/lessons/123"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Target Segment (Optional)</Label>
              <Select
                id="segment"
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                disabled={sending}
              >
                <option value="">All Users</option>
                {segments.map((segment) => (
                  <option key={segment._id} value={segment._id}>
                    {segment.name} ({segment.userCount.toLocaleString()} users)
                  </option>
                ))}
              </Select>
            </div>

            <SchedulePicker
              onScheduleChange={setSchedule}
              defaultType="immediate"
            />

            <div className="flex gap-2">
              {schedule.type === "scheduled" ? (
                <Button
                  onClick={handleSend}
                  disabled={sending || !canSend}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : canSend ? (
                    "Schedule"
                  ) : (
                    "Preview Only"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={sending || !canSend}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : canSend ? (
                    "Send Now"
                  ) : (
                    "Preview Only"
                  )}
                </Button>
              )}
            </div>

            {!canSend && (
              <p className="text-xs text-muted-foreground">
                You don't have permission to send push notifications. Only super_admin and marketing_manager can send.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 max-w-xs mx-auto">
              <div className="bg-white rounded-lg p-4 space-y-2">
                {title ? (
                  <>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-gray-600">{message}</p>
                    {imageUrl && (
                      <div className="mt-2 bg-gray-200 rounded h-24 flex items-center justify-center">
                        <p className="text-xs text-gray-500">Image</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-gray-400">Enter title and message to preview</p>
                )}
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Firebase Cloud Messaging integration placeholder
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

