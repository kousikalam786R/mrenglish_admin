import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RolePermissions } from "./lib/permissions";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Skip middleware for public routes, API routes, and static files
  if (
    url.startsWith("/_next") ||
    url.startsWith("/api") ||
    url.startsWith("/static") ||
    url === "/login" ||
    url === "/"
  ) {
    return NextResponse.next();
  }

  // Extract route name (e.g. /dashboard → "dashboard")
  const segment = url.split("/")[1];

  // If no segment, allow (shouldn't happen with our matcher, but safety check)
  if (!segment) {
    return NextResponse.next();
  }

  // Read role from cookies (or from placeholder for now)
  // In production, this should come from JWT token
  const role = req.cookies.get("admin_role")?.value || "super_admin";

  const isAllowed = RolePermissions[role]?.includes(segment);

  if (!isAllowed) {
    const redirectUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/institutes/:path*",
    "/institute-leads/:path*",
    "/students/:path*",
    "/subscriptions/:path*",
    "/tickets/:path*",
    "/content/:path*",
    "/analytics/:path*",
    "/marketing/:path*",
    "/developer/:path*",
    "/settings/:path*"
  ]
};

