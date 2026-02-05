export const RolePermissions: Record<string, string[]> = {
  super_admin: [
    "dashboard",
    "users",
    "institutes",
    "institute-leads",
    "subscriptions",
    "tickets",
    "content",
    "analytics",
    "marketing",
    "developer",
    "settings"
  ],
  admin: [
    "dashboard",
    "users",
    "institutes",
    "institute-leads",
    "subscriptions",
    "tickets",
    "content",
    "analytics"
  ],
  institute: ["dashboard", "students"],
  support_manager: ["tickets"],
  support_agent: ["tickets"],
  content_manager: ["content"],
  finance_manager: ["subscriptions"],
  marketing_manager: ["marketing"],
  analytics_manager: ["analytics"],
  developer: ["developer"]
};

