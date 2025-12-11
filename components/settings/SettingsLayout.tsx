"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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

const settingsLinks = [
  { href: "/settings/company", label: "Company", icon: Building2 },
  { href: "/settings/roles", label: "Roles & Permissions", icon: Shield },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/settings/appearance", label: "Appearance", icon: Palette },
  { href: "/settings/email-templates", label: "Email Templates", icon: Mail },
  { href: "/settings/audit-logs", label: "Audit Logs", icon: FileText },
  { href: "/settings/security", label: "Security", icon: Lock },
  { href: "/settings/localization", label: "Localization", icon: Globe },
];

interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      <aside className="w-64 flex-shrink-0">
        <nav className="space-y-1">
          {settingsLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}

