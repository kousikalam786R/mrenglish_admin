"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  FileText,
  BarChart3,
  Megaphone,
  Code,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/redux/hooks";
import { RolePermissions } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { fetchTicketStats } from "@/lib/api/tickets";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, route: "dashboard" },
  { href: "/users", label: "Users", icon: Users, route: "users" },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard, route: "subscriptions" },
  { href: "/tickets", label: "Support Tickets", icon: Ticket, route: "tickets" },
  { href: "/content", label: "Content", icon: FileText, route: "content" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, route: "analytics" },
  { href: "/marketing", label: "Marketing", icon: Megaphone, route: "marketing" },
  { href: "/developer", label: "Developer", icon: Code, route: "developer" },
  { href: "/settings", label: "Settings", icon: Settings, route: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = useAppSelector((state) => state.user);
  const ticket = useAppSelector((state) => state.ticket);
  const [ticketStats, setTicketStats] = useState({ unassigned: 0, open: 0, pending: 0 });
  
  // Get allowed routes based on user role
  const allowedRoutes = RolePermissions[user.role] || [];
  
  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter((item) => 
    allowedRoutes.includes(item.route)
  );

  // Load ticket stats for badge
  useEffect(() => {
    if (allowedRoutes.includes("tickets")) {
      const loadStats = async () => {
        try {
          const stats = await fetchTicketStats(user.role, user.email);
          setTicketStats({
            unassigned: stats.unassigned,
            open: stats.open,
            pending: stats.pending,
          });
        } catch (error) {
          console.error("Error loading ticket stats:", error);
        }
      };
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role, user.email]);

  // Get badge count for tickets menu item
  const getTicketBadgeCount = () => {
    if (user.role === "support_agent") {
      return ticketStats.open + ticketStats.pending;
    }
    return ticketStats.unassigned;
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-xl font-bold">MR English Admin</h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const showBadge = item.route === "tickets" && getTicketBadgeCount() > 0;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                  {showBadge && (
                    <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                      {getTicketBadgeCount()}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

