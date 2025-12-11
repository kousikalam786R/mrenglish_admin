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
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw, Upload } from "lucide-react";
import {
  fetchCompanyInfo,
  updateCompanyInfo,
} from "@/lib/api/settings";
import {
  setCompany,
  setLoading,
} from "@/redux/slices/settingsSlice";

export default function CompanySettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [formData, setFormData] = useState({
    name: "",
    primaryContactEmail: "",
    supportEmail: "",
    defaultTimezone: "UTC",
    defaultCurrency: "USD",
    legalAddress: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadCompanyInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  useEffect(() => {
    if (settings.company) {
      setFormData({
        name: settings.company.name,
        primaryContactEmail: settings.company.primaryContactEmail,
        supportEmail: settings.company.supportEmail,
        defaultTimezone: settings.company.defaultTimezone,
        defaultCurrency: settings.company.defaultCurrency,
        legalAddress: settings.company.legalAddress,
        phone: settings.company.phone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.company]);

  const loadCompanyInfo = async () => {
    try {
      dispatch(setLoading(true));
      const company = await fetchCompanyInfo();
      dispatch(setCompany(company));
    } catch (error) {
      console.error("Error loading company info:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateCompanyInfo(formData);
      dispatch(setCompany(updated));
      alert("Company information saved successfully");
    } catch (error) {
      console.error("Error saving company info:", error);
      alert("Error saving company information");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings.company) {
      setFormData({
        name: settings.company.name,
        primaryContactEmail: settings.company.primaryContactEmail,
        supportEmail: settings.company.supportEmail,
        defaultTimezone: settings.company.defaultTimezone,
        defaultCurrency: settings.company.defaultCurrency,
        legalAddress: settings.company.legalAddress,
        phone: settings.company.phone,
      });
    }
  };

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Settings</h1>
            <p className="text-muted-foreground">Manage company information</p>
          </div>
          {settings.company && (
            <Badge variant={settings.company.environment === "PROD" ? "destructive" : "default"}>
              {settings.company.environment}
            </Badge>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <span className="text-sm text-muted-foreground">(Placeholder)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Primary Contact Email *</Label>
                <Input
                  id="primaryContactEmail"
                  type="email"
                  value={formData.primaryContactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryContactEmail: e.target.value })
                  }
                  placeholder="contact@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email *</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                  placeholder="support@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTimezone">Default Timezone</Label>
                <Select
                  id="defaultTimezone"
                  value={formData.defaultTimezone}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTimezone: e.target.value })
                  }
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <Select
                  id="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultCurrency: e.target.value })
                  }
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="JPY">JPY</option>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalAddress">Legal Address</Label>
              <Input
                id="legalAddress"
                value={formData.legalAddress}
                onChange={(e) =>
                  setFormData({ ...formData, legalAddress: e.target.value })
                }
                placeholder="123 Main St, City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-234-567-8900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
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
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}

