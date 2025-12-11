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
import { Save, RotateCcw, Upload } from "lucide-react";
import {
  fetchAppearance,
  updateAppearance,
} from "@/lib/api/settings";
import { AppearanceSettings } from "@/lib/types/settings";

export default function AppearanceSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [formData, setFormData] = useState<AppearanceSettings>({
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    layout: "comfortable",
    theme: "light",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadAppearance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadAppearance = async () => {
    try {
      const appearance = await fetchAppearance();
      setFormData(appearance);
    } catch (error) {
      console.error("Error loading appearance:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateAppearance(formData);
      alert("Appearance settings saved successfully");
    } catch (error) {
      console.error("Error saving appearance:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Appearance</h1>
          <p className="text-muted-foreground">Customize branding and theme</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brand Colors</CardTitle>
            <CardDescription>Set primary and secondary colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="flex-1 font-mono"
                  />
                </div>
                <div
                  className="h-12 rounded"
                  style={{ backgroundColor: formData.primaryColor }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    className="w-20"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    className="flex-1 font-mono"
                  />
                </div>
                <div
                  className="h-12 rounded"
                  style={{ backgroundColor: formData.secondaryColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo & Favicon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>App Logo</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <span className="text-sm text-muted-foreground">(Placeholder)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Favicon</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Favicon
                </Button>
                <span className="text-sm text-muted-foreground">(Placeholder)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layout & Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="layout">Layout</Label>
              <Select
                id="layout"
                value={formData.layout}
                onChange={(e) =>
                  setFormData({ ...formData, layout: e.target.value as "compact" | "comfortable" })
                }
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                id="theme"
                value={formData.theme}
                onChange={(e) =>
                  setFormData({ ...formData, theme: e.target.value as "light" | "dark" | "auto" })
                }
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Revert to Default
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </SettingsLayout>
  );
}

