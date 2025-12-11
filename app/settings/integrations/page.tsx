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
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, TestTube } from "lucide-react";
import {
  fetchIntegrations,
  updateIntegration,
  testIntegration,
} from "@/lib/api/settings";
import {
  setIntegrations,
  updateIntegration as updateIntegrationAction,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { Integration } from "@/lib/types/settings";

export default function IntegrationsSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "settings") && user.role !== "developer") {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings") || user.role === "developer") {
      loadIntegrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadIntegrations = async () => {
    try {
      dispatch(setLoading(true));
      const integrations = await fetchIntegrations();
      dispatch(setIntegrations(integrations));
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleToggle = async (integration: Integration) => {
    try {
      const updated = await updateIntegration(integration._id, {
        enabled: !integration.enabled,
      });
      dispatch(updateIntegrationAction(updated));
    } catch (error) {
      console.error("Error updating integration:", error);
    }
  };

  const handleTest = async (integration: Integration) => {
    try {
      setTesting(integration._id);
      const result = await testIntegration(integration._id);
      const updated = await updateIntegration(integration._id, {
        lastTestStatus: result.success ? "success" : "failed",
      });
      dispatch(updateIntegrationAction(updated));
      alert(result.message);
    } catch (error) {
      console.error("Error testing integration:", error);
      alert("Error testing integration");
    } finally {
      setTesting(null);
    }
  };

  const canEdit = user.role === "super_admin" || user.role === "admin";

  if (!checkAccess(user.role, "settings") && user.role !== "developer") {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Manage third-party integrations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {settings.integrations.map((integration) => (
            <Card key={integration._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{integration.name}</CardTitle>
                  <Badge variant={integration.enabled ? "default" : "secondary"}>
                    {integration.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <CardDescription>{integration.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integration.notes && (
                  <p className="text-sm text-muted-foreground">{integration.notes}</p>
                )}
                {integration.lastTestedAt && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">
                      Last tested: {new Date(integration.lastTestedAt).toLocaleString()}
                    </p>
                    {integration.lastTestStatus && (
                      <div className="flex items-center gap-1 mt-1">
                        {integration.lastTestStatus === "success" ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Success</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500">Failed</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>API Key / Secret (masked)</Label>
                  <Input
                    type="password"
                    value="***"
                    disabled
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Backend expects config in environment variables or secure vault
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleToggle(integration)}
                    disabled={!canEdit}
                  >
                    {integration.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleTest(integration)}
                    disabled={testing === integration._id || !canEdit}
                  >
                    {testing === integration._id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
                {!canEdit && (
                  <p className="text-xs text-muted-foreground">
                    Insufficient permission to edit integrations
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}

