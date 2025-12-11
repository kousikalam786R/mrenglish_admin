"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createCampaign } from "@/lib/api/marketing";
import { CampaignType } from "@/lib/types/marketing";
import { addCampaign } from "@/redux/slices/marketingSlice";
import { fetchTemplates, fetchSegments } from "@/lib/api/marketing";
import { Template, Segment } from "@/lib/types/marketing";
import { SchedulePicker } from "@/components/marketing/SchedulePicker";

export default function CreateCampaignPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [name, setName] = useState("");
  const [type, setType] = useState<CampaignType>("Push");
  const [templateId, setTemplateId] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [schedule, setSchedule] = useState<{
    type: "immediate" | "scheduled";
    datetime?: string;
    timezone?: string;
  }>({ type: "immediate" });
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!checkAccess(user.role, "marketing")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOptions = async () => {
    try {
      const [templatesData, segmentsData] = await Promise.all([
        fetchTemplates(),
        fetchSegments(),
      ]);
      setTemplates(templatesData.filter((t) => t.type === type));
      setSegments(segmentsData);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  useEffect(() => {
    if (type) {
      const filtered = templates.filter((t) => t.type === type);
      setTemplates(filtered);
      if (templateId && !filtered.find((t) => t._id === templateId)) {
        setTemplateId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const canSend = user.role === "super_admin" || user.role === "marketing_manager";

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!templateId) {
      newErrors.template = "Template is required";
    }
    if (!segmentId) {
      newErrors.segment = "Segment is required";
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
      setCreating(true);
      const selectedSegment = segments.find((s) => s._id === segmentId);
      const newCampaign = await createCampaign({
        name: name.trim(),
        type,
        templateId,
        templateName: templates.find((t) => t._id === templateId)?.name,
        segmentId,
        segmentName: selectedSegment?.name || "",
        status: schedule.type === "immediate" ? "Running" : "Scheduled",
        scheduledAt: schedule.type === "scheduled" ? schedule.datetime : undefined,
        startDate: schedule.type === "scheduled" ? schedule.datetime : new Date().toISOString(),
        createdBy: user.email,
      });
      dispatch(addCampaign(newCampaign));
      router.push(`/marketing/campaigns/${newCampaign._id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/marketing/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">Create a new marketing campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Campaign name"
                    disabled={creating}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Channel *</Label>
                    <Select
                      id="type"
                      value={type}
                      onChange={(e) => setType(e.target.value as CampaignType)}
                      disabled={creating}
                    >
                      <option value="Push">Push</option>
                      <option value="Email">Email</option>
                      <option value="In-App Banner">In-App Banner</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template">Template *</Label>
                    <Select
                      id="template"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      disabled={creating}
                    >
                      <option value="">Select template</option>
                      {templates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </Select>
                    {errors.template && (
                      <p className="text-sm text-destructive">{errors.template}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segment">Target Segment *</Label>
                  <Select
                    id="segment"
                    value={segmentId}
                    onChange={(e) => setSegmentId(e.target.value)}
                    disabled={creating}
                  >
                    <option value="">Select segment</option>
                    {segments.map((segment) => (
                      <option key={segment._id} value={segment._id}>
                        {segment.name} ({segment.userCount.toLocaleString()} users)
                      </option>
                    ))}
                  </Select>
                  {errors.segment && (
                    <p className="text-sm text-destructive">{errors.segment}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="abtest"
                      checked={abTestEnabled}
                      onChange={(e) => setAbTestEnabled(e.target.checked)}
                      disabled={creating || !canSend}
                      className="rounded"
                    />
                    <Label htmlFor="abtest">Enable A/B Test</Label>
                  </div>
                  {!canSend && (
                    <p className="text-xs text-muted-foreground">
                      A/B testing requires marketing_manager or super_admin role
                    </p>
                  )}
                </div>

                <SchedulePicker
                  onScheduleChange={setSchedule}
                  defaultType="immediate"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Desktop Preview</p>
                    <div className="bg-background rounded p-4 min-h-[200px]">
                      {templateId ? (
                        <p className="text-sm text-muted-foreground">
                          Template preview will appear here
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a template to preview
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Mobile Preview</p>
                    <div className="bg-background rounded p-4 min-h-[200px] max-w-xs mx-auto">
                      {templateId ? (
                        <p className="text-sm text-muted-foreground">
                          Mobile template preview
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Select a template to preview
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/marketing/campaigns">
            <Button type="button" variant="outline" disabled={creating}>
              Cancel
            </Button>
          </Link>
          <Button type="button" variant="outline" disabled={creating || !canSend}>
            Save as Draft
          </Button>
          {schedule.type === "scheduled" ? (
            <Button
              type="button"
              variant="outline"
              disabled={creating || !canSend}
            >
              Schedule
            </Button>
          ) : (
            <Button type="submit" disabled={creating || !canSend}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Send Now"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

