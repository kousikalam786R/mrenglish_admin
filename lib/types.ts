export type AdminRole = 
  | "super_admin"
  | "admin"
  | "institute"
  | "support_manager"
  | "support_agent"
  | "content_manager"
  | "finance_manager"
  | "marketing_manager"
  | "analytics_manager"
  | "developer";

export interface AdminUser {
  name: string;
  role: AdminRole;
  email: string;
  id?: string;
  instituteId?: string; // Set when role is institute
}

export interface RoutePermission {
  [key: string]: string[];
}

