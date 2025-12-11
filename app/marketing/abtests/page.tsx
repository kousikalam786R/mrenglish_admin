"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Loader2, TestTube } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchABTests, createABTest, fetchTemplates, fetchCampaigns } from "@/lib/api/marketing";
import { setABTests, addABTest } from "@/redux/slices/marketingSlice";
import { ABTest, ABTestMetric } from "@/lib/types/marketing";
import { Template, Campaign } from "@/lib/types/marketing";

export default function ABTestsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const marketing = useAppSelector((state) => state.marketing);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [variantATemplateId, setVariantATemplateId] = useState("");
  const [variantBTemplateId, setVariantBTemplateId] = useState("");
  const [variantAPercentage, setVariantAPercentage] = useState(50);
  const [metric, setMetric] = useState<ABTestMetric>("open");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creating, setCreating] = useState(false);

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
      const [tests, templatesData, campaignsData] = await Promise.all([
        fetchABTests(),
        fetchTemplates(),
        fetchCampaigns(),
      ]);
      dispatch(setABTests(tests));
      setTemplates(templatesData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading A/B tests:", error);
    }
  };

  const canCreate = user.role === "super_admin" || user.role === "marketing_manager";

  const handleCreate = async () => {
    if (!name.trim() || !campaignId || !variantATemplateId || !variantBTemplateId) {
      alert("All fields are required");
      return;
    }

    if (variantAPercentage + (100 - variantAPercentage) !== 100) {
      alert("Percentages must sum to 100%");
      return;
    }

    try {
      setCreating(true);
      const variantATemplate = templates.find((t) => t._id === variantATemplateId);
      const variantBTemplate = templates.find((t) => t._id === variantBTemplateId);

      const newTest = await createABTest({
        name: name.trim(),
        campaignId,
        variantA: {
          templateId: variantATemplateId,
          templateName: variantATemplate?.name || "",
          percentage: variantAPercentage,
        },
        variantB: {
          templateId: variantBTemplateId,
          templateName: variantBTemplate?.name || "",
          percentage: 100 - variantAPercentage,
        },
        metric,
        status: "Draft",
      });
      dispatch(addABTest(newTest));
      setShowCreate(false);
      setName("");
      setCampaignId("");
      setVariantATemplateId("");
      setVariantBTemplateId("");
      setVariantAPercentage(50);
    } catch (error) {
      console.error("Error creating A/B test:", error);
    } finally {
      setCreating(false);
    }
  };

  if (!checkAccess(user.role, "marketing")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Tests</h1>
          <p className="text-muted-foreground">Create and manage A/B tests</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            Create A/B Test
          </Button>
        )}
      </div>

      {!canCreate && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              A/B test creation requires marketing_manager or super_admin role
            </p>
          </CardContent>
        </Card>
      )}

      {showCreate && canCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create A/B Test</CardTitle>
            <CardDescription>Compare two template variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Test Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="A/B Test name"
                disabled={creating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign *</Label>
              <Select
                id="campaign"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                disabled={creating}
              >
                <option value="">Select campaign</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variantA">Variant A Template *</Label>
                <Select
                  id="variantA"
                  value={variantATemplateId}
                  onChange={(e) => setVariantATemplateId(e.target.value)}
                  disabled={creating}
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variantB">Variant B Template *</Label>
                <Select
                  id="variantB"
                  value={variantBTemplateId}
                  onChange={(e) => setVariantBTemplateId(e.target.value)}
                  disabled={creating}
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage">Variant A Percentage</Label>
              <Input
                id="percentage"
                type="number"
                min="1"
                max="99"
                value={variantAPercentage}
                onChange={(e) => setVariantAPercentage(Number(e.target.value))}
                disabled={creating}
              />
              <p className="text-xs text-muted-foreground">
                Variant B will receive {100 - variantAPercentage}%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric">Metric to Track *</Label>
              <Select
                id="metric"
                value={metric}
                onChange={(e) => setMetric(e.target.value as ABTestMetric)}
                disabled={creating}
              >
                <option value="open">Open Rate</option>
                <option value="click">Click Rate</option>
                <option value="conversion">Conversion Rate</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create A/B Test"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* A/B Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>A/B Tests List</CardTitle>
          <CardDescription>{marketing.abtests.length} test(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Results</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketing.abtests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No A/B tests found
                    </TableCell>
                  </TableRow>
                ) : (
                  marketing.abtests.map((test) => (
                    <TableRow key={test._id}>
                      <TableCell className="font-medium">{test.name}</TableCell>
                      <TableCell>{test.campaignId}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>A: {test.variantA.templateName} ({test.variantA.percentage}%)</p>
                          <p>B: {test.variantB.templateName} ({test.variantB.percentage}%)</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.metric}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            test.status === "Running"
                              ? "default"
                              : test.status === "Completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {test.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.results ? (
                          <div className="text-sm">
                            <p>
                              Winner: {test.results.winner} ({test.results.confidence}% confidence)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              A: {test.results.variantA.metricValue} ({test.results.variantA.percentage}%)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              B: {test.results.variantB.metricValue} ({test.results.variantB.percentage}%)
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No results yet</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

