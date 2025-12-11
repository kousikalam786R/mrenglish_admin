"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { checkAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Building2,
  Shield,
  Plug,
  CreditCard,
  Webhook,
  Palette,
  Mail,
  FileText,
  Lock,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    // Redirect to company settings by default
    if (checkAccess(user.role, "settings")) {
      router.push("/settings/company");
    } else {
      router.push("/dashboard");
    }
  }, [user.role, router]);

  if (!checkAccess(user.role, "settings")) {
    return null;
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application settings</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/settings/company">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company
                </CardTitle>
                <CardDescription>Company information and details</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/roles">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Roles & Permissions
                </CardTitle>
                <CardDescription>Manage roles and permissions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/integrations">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Integrations
                </CardTitle>
                <CardDescription>Third-party integrations</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/billing">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing
                </CardTitle>
                <CardDescription>Billing and subscription</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/webhooks">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>Webhook endpoints</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/appearance">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Branding and theme</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/email-templates">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Templates
                </CardTitle>
                <CardDescription>Email message templates</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/audit-logs">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
                <CardDescription>System activity logs</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/security">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Security settings</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/settings/localization">
            <Card className="cursor-pointer hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Localization
                </CardTitle>
                <CardDescription>Languages and translations</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </SettingsLayout>
  );
}
