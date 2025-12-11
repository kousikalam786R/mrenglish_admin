"use client";

import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);

  // Don't show sidebar/navbar on login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show sidebar/navbar only if authenticated
  if (isAuthenticated) {
      return (
        <div className="flex min-h-screen overflow-x-hidden">
          <Sidebar />
          <div className="flex-1 lg:ml-64 min-w-0 overflow-x-hidden">
            <Navbar />
            <main className="p-6 max-w-full overflow-x-hidden">{children}</main>
          </div>
        </div>
      );
  }

  // If not authenticated and not on login page, show nothing (will redirect)
  return <>{children}</>;
}

