"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, Loader2, TestTube, Trash2, Edit } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  fetchWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from "@/lib/api/settings";
import {
  setWebhooks,
  addWebhook,
  updateWebhook as updateWebhookAction,
  removeWebhook,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { Webhook, WebhookEvent } from "@/lib/types/settings";
import { exportToCSV } from "@/lib/utils/export";

const webhookEvents: WebhookEvent[] = [
  "subscription.created",
  "subscription.updated",
  "ticket.created",
  "ticket.updated",
  "user.created",
  "user.updated",
  "payment.completed",
  "payment.failed",
];

export default function WebhooksSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [showCreate, setShowCreate] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([]);
  const [status, setStatus] = useState<"Active" | "Paused">("Active");
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadWebhooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadWebhooks = async () => {
    try {
      dispatch(setLoading(true));
      const webhooks = await fetchWebhooks();
      dispatch(setWebhooks(webhooks));
    } catch (error) {
      console.error("Error loading webhooks:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreate = async () => {
    if (!url.trim() || !secret.trim() || selectedEvents.length === 0) {
      alert("URL, secret, and at least one event are required");
      return;
    }

    try {
      const newWebhook = await createWebhook({
        url: url.trim(),
        secret: secret.trim(),
        events: selectedEvents,
        status,
      });
      dispatch(addWebhook(newWebhook));
      setShowCreate(false);
      resetForm();
    } catch (error) {
      console.error("Error creating webhook:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingWebhook || !url.trim() || selectedEvents.length === 0) {
      return;
    }

    try {
      const updated = await updateWebhook(editingWebhook._id, {
        url: url.trim(),
        secret: secret.trim() || editingWebhook.secret,
        events: selectedEvents,
        status,
      });
      dispatch(updateWebhookAction(updated));
      setEditingWebhook(null);
      resetForm();
    } catch (error) {
      console.error("Error updating webhook:", error);
    }
  };

  const handleDelete = async (webhook: Webhook) => {
    if (!confirm(`Delete webhook ${webhook.url}?`)) return;

    try {
      await deleteWebhook(webhook._id);
      dispatch(removeWebhook(webhook._id));
    } catch (error) {
      console.error("Error deleting webhook:", error);
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      setTesting(webhook._id);
      const result = await testWebhook(webhook._id);
      await loadWebhooks();
      alert(result.success ? "Webhook test successful" : "Webhook test failed");
    } catch (error) {
      console.error("Error testing webhook:", error);
    } finally {
      setTesting(null);
    }
  };

  const handleExport = (webhook: Webhook) => {
    exportToCSV(
      webhook.deliveryLog,
      `webhook-${webhook._id}-deliveries`,
      [
        { key: "timestamp", label: "Timestamp" },
        { key: "event", label: "Event" },
        { key: "statusCode", label: "Status Code" },
        { key: "success", label: "Success" },
        { key: "attempts", label: "Attempts" },
      ]
    );
  };

  const resetForm = () => {
    setUrl("");
    setSecret("");
    setSelectedEvents([]);
    setStatus("Active");
  };

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground">Manage webhook endpoints</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Webhook
          </Button>
        </div>

        {/* Webhooks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>{settings.webhooks.length} webhook(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deliveries</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settings.webhooks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No webhooks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    settings.webhooks.map((webhook) => (
                      <TableRow key={webhook._id}>
                        <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {webhook.events.slice(0, 2).map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                            {webhook.events.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{webhook.events.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={webhook.status === "Active" ? "default" : "secondary"}>
                            {webhook.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{webhook.deliveryLog.length}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTest(webhook)}
                              disabled={testing === webhook._id}
                            >
                              {testing === webhook._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <TestTube className="h-4 w-4 mr-2" />
                                  Test
                                </>
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExport(webhook)}
                            >
                              Export Log
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingWebhook(webhook);
                                setUrl(webhook.url);
                                setSecret(webhook.secret);
                                setSelectedEvents(webhook.events);
                                setStatus(webhook.status);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(webhook)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreate || editingWebhook !== null}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreate(false);
              setEditingWebhook(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWebhook ? "Edit Webhook" : "Create Webhook"}</DialogTitle>
              <DialogDescription>
                Configure webhook endpoint and events
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secret">Secret *</Label>
                <Input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Webhook secret"
                />
              </div>
              <div className="space-y-2">
                <Label>Events *</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {webhookEvents.map((event) => (
                      <label key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents([...selectedEvents, event]);
                            } else {
                              setSelectedEvents(selectedEvents.filter((e) => e !== event));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm font-mono">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "Active" | "Paused")}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingWebhook(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingWebhook ? handleUpdate : handleCreate}>
                  {editingWebhook ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SettingsLayout>
  );
}

