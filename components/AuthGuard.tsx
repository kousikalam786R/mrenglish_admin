"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if already on login page
    if (pathname === "/login") {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, pathname]);

  // Don't render protected content if not authenticated (except login page)
  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}

