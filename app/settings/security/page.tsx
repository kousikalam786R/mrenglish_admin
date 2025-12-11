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
import { Loader2, Save, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchSecuritySettings,
  updateSecuritySettings,
  fetchActiveSessions,
  revokeSession,
} from "@/lib/api/settings";
import {
  setSecurity,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { SecuritySettings, ActiveSession } from "@/lib/types/settings";

export default function SecuritySettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [formData, setFormData] = useState<SecuritySettings | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadSecurity();
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  useEffect(() => {
    if (settings.security) {
      setFormData(settings.security);
    }
  }, [settings.security]);

  const loadSecurity = async () => {
    try {
      dispatch(setLoading(true));
      const security = await fetchSecuritySettings();
      dispatch(setSecurity(security));
    } catch (error) {
      console.error("Error loading security settings:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadSessions = async () => {
    try {
      const activeSessions = await fetchActiveSessions();
      setSessions(activeSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      const updated = await updateSecuritySettings(formData);
      dispatch(setSecurity(updated));
      alert("Security settings saved successfully");
    } catch (error) {
      console.error("Error saving security settings:", error);
      alert("Error saving security settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm("Revoke this session?")) return;

    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (error) {
      console.error("Error revoking session:", error);
    }
  };

  const canEdit2FA = user.role === "super_admin";
  const canEditSSO = user.role === "super_admin";

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  if (!formData) {
    return <div>Loading...</div>;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">Manage security policies and controls</p>
        </div>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>Configure password requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minLength">Minimum Length</Label>
              <Input
                id="minLength"
                type="number"
                min="4"
                max="32"
                value={formData.passwordPolicy.minLength}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passwordPolicy: {
                      ...formData.passwordPolicy,
                      minLength: parseInt(e.target.value) || 8,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireUppercase"
                  checked={formData.passwordPolicy.requireUppercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordPolicy: {
                        ...formData.passwordPolicy,
                        requireUppercase: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requireUppercase">Require Uppercase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireLowercase"
                  checked={formData.passwordPolicy.requireLowercase}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordPolicy: {
                        ...formData.passwordPolicy,
                        requireLowercase: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requireLowercase">Require Lowercase</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireNumbers"
                  checked={formData.passwordPolicy.requireNumbers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordPolicy: {
                        ...formData.passwordPolicy,
                        requireNumbers: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requireNumbers">Require Numbers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireSpecialChars"
                  checked={formData.passwordPolicy.requireSpecialChars}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordPolicy: {
                        ...formData.passwordPolicy,
                        requireSpecialChars: e.target.checked,
                      },
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Enable 2FA globally (TOTP)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">
                  Require all users to enable two-factor authentication
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.twoFactorEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, twoFactorEnabled: e.target.checked })
                }
                disabled={!canEdit2FA}
                className="rounded"
              />
            </div>
            {!canEdit2FA && (
              <p className="text-xs text-muted-foreground mt-2">
                Only super_admin can toggle 2FA
              </p>
            )}
          </CardContent>
        </Card>

        {/* Session Timeout */}
        <Card>
          <CardHeader>
            <CardTitle>Session Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={formData.sessionTimeout}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessionTimeout: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* IP Allowlist */}
        <Card>
          <CardHeader>
            <CardTitle>IP Allowlist</CardTitle>
            <CardDescription>Restrict access to specific IP ranges (CIDR)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.ipAllowlist.map((ip, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={ip} disabled className="font-mono" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      ipAllowlist: formData.ipAllowlist.filter((_, i) => i !== index),
                    });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => {
                const newIp = prompt("Enter CIDR (e.g., 192.168.1.0/24):");
                if (newIp) {
                  setFormData({
                    ...formData,
                    ipAllowlist: [...formData.ipAllowlist, newIp],
                  });
                }
              }}
            >
              Add IP Range
            </Button>
          </CardContent>
        </Card>

        {/* SSO */}
        <Card>
          <CardHeader>
            <CardTitle>Single Sign-On (SSO)</CardTitle>
            <CardDescription>SAML / OAuth configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable SSO</p>
                <p className="text-sm text-muted-foreground">Configure SAML or OAuth</p>
              </div>
              <input
                type="checkbox"
                checked={formData.sso.enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sso: { ...formData.sso, enabled: e.target.checked },
                  })
                }
                disabled={!canEditSSO}
                className="rounded"
              />
            </div>
            {!canEditSSO && (
              <p className="text-xs text-muted-foreground">
                Only super_admin can configure SSO
              </p>
            )}
            {formData.sso.enabled && (
              <div className="space-y-2">
                <Label>SSO Provider (Placeholder)</Label>
                <Select
                  value={formData.sso.provider || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sso: {
                        ...formData.sso,
                        provider: e.target.value as "saml" | "oauth" | null,
                      },
                    })
                  }
                  disabled={!canEditSSO}
                >
                  <option value="">Select provider</option>
                  <option value="saml">SAML</option>
                  <option value="oauth">OAuth</option>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                      <TableCell className="text-sm">{session.userAgent}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(session.lastActivity).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session._id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}

