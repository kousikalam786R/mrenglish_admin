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
import { Plus, Download, Upload, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchLocalization,
  updateLocalization,
  uploadTranslations,
  exportTranslations,
} from "@/lib/api/settings";
import {
  setLocalization,
  setLoading,
} from "@/redux/slices/settingsSlice";
import { Locale } from "@/lib/types/settings";
import { downloadBlob } from "@/lib/utils/export";

export default function LocalizationSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const settings = useAppSelector((state) => state.settings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAccess(user.role, "settings")) {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  useEffect(() => {
    if (checkAccess(user.role, "settings")) {
      loadLocalization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const loadLocalization = async () => {
    try {
      dispatch(setLoading(true));
      const localization = await fetchLocalization();
      dispatch(setLocalization(localization));
    } catch (error) {
      console.error("Error loading localization:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExport = async (locale: string) => {
    try {
      const csv = await exportTranslations(locale);
      const blob = new Blob([csv], { type: "text/csv" });
      downloadBlob(`translations-${locale}`, blob, "csv");
    } catch (error) {
      console.error("Error exporting translations:", error);
    }
  };

  const handleUpload = async (locale: string, file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n");
      const translations: Record<string, string> = {};
      for (let i = 1; i < lines.length; i++) {
        const [key, value] = lines[i].split(",");
        if (key && value) {
          translations[key.trim()] = value.trim();
        }
      }
      await uploadTranslations(locale, translations);
      await loadLocalization();
      alert("Translations uploaded successfully");
    } catch (error) {
      console.error("Error uploading translations:", error);
      alert("Error uploading translations");
    }
  };

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  const currentLocale = selectedLocale
    ? settings.localization?.supportedLocales.find((l) => l.code === selectedLocale)
    : null;

  const filteredKeys = currentLocale
    ? Object.keys(currentLocale.translations).filter((key) =>
        searchTerm ? key.toLowerCase().includes(searchTerm.toLowerCase()) || 
        currentLocale.translations[key].toLowerCase().includes(searchTerm.toLowerCase()) : true
      )
    : [];

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Localization</h1>
          <p className="text-muted-foreground">Manage languages and translations</p>
        </div>

        {settings.localization && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Default Language</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={settings.localization.defaultLocale}
                  onChange={(e) => {
                    updateLocalization({ defaultLocale: e.target.value });
                    loadLocalization();
                  }}
                >
                  {settings.localization.supportedLocales.map((locale) => (
                    <option key={locale.code} value={locale.code}>
                      {locale.name}
                    </option>
                  ))}
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supported Locales</CardTitle>
                <CardDescription>
                  {settings.localization.supportedLocales.length} locale(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Coverage</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.localization.supportedLocales.map((locale) => (
                        <TableRow key={locale.code}>
                          <TableCell className="font-mono">{locale.code}</TableCell>
                          <TableCell className="font-medium">{locale.name}</TableCell>
                          <TableCell>
                            <Badge variant={locale.coverage === 100 ? "default" : "secondary"}>
                              {locale.coverage}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(locale.lastUpdated).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLocale(locale.code)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExport(locale.code)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                              <label>
                                <Button variant="ghost" size="sm" asChild>
                                  <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                  </span>
                                </Button>
                                <input
                                  type="file"
                                  accept=".csv"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUpload(locale.code, file);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {currentLocale && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Translations: {currentLocale.name}</CardTitle>
                  <CardDescription>
                    {Object.keys(currentLocale.translations).length} translation(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search translations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeys.map((key) => (
                          <TableRow key={key}>
                            <TableCell className="font-mono text-sm">{key}</TableCell>
                            <TableCell>
                              <Input
                                value={currentLocale.translations[key]}
                                onChange={(e) => {
                                  // Update would go here
                                }}
                                className="font-mono text-sm"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </SettingsLayout>
  );
}

