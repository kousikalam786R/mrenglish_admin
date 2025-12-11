import { AdminRole } from "./types";
import { RolePermissions } from "./permissions";

// Mock function - will be replaced with backend JWT auth later
export function getCurrentAdmin() {
  return {
    name: "Super Admin",
    role: "super_admin" as AdminRole,
    email: "admin@mre.com"
  };
}

export function checkAccess(role: string, route: string): boolean {
  const allowed = RolePermissions[role] || [];
  return allowed.includes(route);
}

