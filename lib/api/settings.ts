import {
  CompanyInfo,
  Role,
  Integration,
  BillingInfo,
  Webhook,
  AppearanceSettings,
  EmailTemplate,
  AuditLog,
  SecuritySettings,
  Localization,
  SettingsFilters,
  WebhookEvent,
} from "@/lib/types/settings";

// Mock data
let mockCompany: CompanyInfo = {
  name: "MR English",
  logoUrl: "/logo.png",
  primaryContactEmail: "contact@mrenglish.com",
  supportEmail: "support@mrenglish.com",
  defaultTimezone: "UTC",
  defaultCurrency: "USD",
  legalAddress: "123 Main St, City, Country",
  phone: "+1-234-567-8900",
  environment: "PROD",
};

let mockRoles: Role[] = [
  {
    _id: "role-1",
    name: "Content Editor",
    description: "Can edit content but not publish",
    permissions: ["content"],
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userCount: 5,
  },
];

let mockIntegrations: Integration[] = [
  {
    _id: "int-1",
    name: "Firebase",
    type: "firebase",
    enabled: true,
    config: { apiKey: "***", projectId: "mrenglish" },
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: "success",
    notes: "Backend expects config in environment variables or secure vault",
  },
  {
    _id: "int-2",
    name: "Stripe",
    type: "stripe",
    enabled: true,
    config: { apiKey: "***", webhookSecret: "***" },
    lastTestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastTestStatus: "success",
  },
  {
    _id: "int-3",
    name: "SendGrid",
    type: "sendgrid",
    enabled: false,
    config: { apiKey: "***" },
  },
];

let mockBilling: BillingInfo = {
  plan: "Enterprise",
  nextChargeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  paymentMethod: {
    type: "card",
    last4: "4242",
    brand: "visa",
  },
  billingContact: "billing@mrenglish.com",
  invoices: Array.from({ length: 12 }, (_, i) => ({
    _id: `inv-${i + 1}`,
    invoiceNumber: `INV-${String(i + 1).padStart(6, "0")}`,
    date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount: 1000 + Math.random() * 500,
    currency: "USD",
    status: i % 3 === 0 ? "paid" : i % 3 === 1 ? "pending" : "failed",
  })),
};

let mockWebhooks: Webhook[] = [
  {
    _id: "webhook-1",
    url: "https://example.com/webhook",
    secret: "***",
    events: ["subscription.created", "user.updated"],
    status: "Active",
    deliveryLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockTemplates: EmailTemplate[] = [
  {
    _id: "template-1",
    name: "Welcome Email",
    subject: "Welcome to {{company_name}}!",
    body: "Hello {{first_name}}, welcome to our platform!",
    placeholders: ["{{first_name}}", "{{company_name}}"],
    lastModified: new Date().toISOString(),
    modifiedBy: "admin@mre.com",
    version: 1,
  },
  {
    _id: "template-2",
    name: "Password Reset",
    subject: "Reset your password",
    body: "Click here to reset: {{reset_link}}",
    placeholders: ["{{reset_link}}"],
    lastModified: new Date().toISOString(),
    modifiedBy: "admin@mre.com",
    version: 1,
  },
];

let mockAuditLogs: AuditLog[] = Array.from({ length: 50 }, (_, i) => ({
  _id: `log-${i + 1}`,
  timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
  actor: {
    id: `user-${i % 3}`,
    name: ["Admin User", "Super Admin", "Support Manager"][i % 3],
    email: ["admin@mre.com", "super@mre.com", "support@mre.com"][i % 3],
  },
  action: ["role.updated", "plan.created", "integration.tested", "user.deleted"][i % 4],
  target: {
    type: ["role", "plan", "integration", "user"][i % 4],
    id: `target-${i}`,
    name: `Target ${i}`,
  },
  details: `Action details ${i + 1}`,
  ipAddress: `192.168.1.${i % 255}`,
}));

let mockSecurity: SecuritySettings = {
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  twoFactorEnabled: false,
  sessionTimeout: 30,
  ipAllowlist: ["192.168.1.0/24"],
  sso: {
    enabled: false,
    provider: null,
  },
};

let mockLocalization: Localization = {
  defaultLocale: "en",
  supportedLocales: [
    {
      code: "en",
      name: "English",
      translations: { welcome: "Welcome", goodbye: "Goodbye" },
      coverage: 100,
      lastUpdated: new Date().toISOString(),
    },
    {
      code: "es",
      name: "Spanish",
      translations: { welcome: "Bienvenido", goodbye: "Adiós" },
      coverage: 75,
      lastUpdated: new Date().toISOString(),
    },
  ],
};

// Company API
export async function fetchCompanyInfo(): Promise<CompanyInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockCompany;
}

export async function updateCompanyInfo(
  payload: Partial<CompanyInfo>
): Promise<CompanyInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockCompany = { ...mockCompany, ...payload };
  return mockCompany;
}

// Roles API
export async function fetchRoles(): Promise<Role[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockRoles;
}

export async function createRole(payload: Omit<Role, "_id" | "createdAt" | "updatedAt">): Promise<Role> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newRole: Role = {
    ...payload,
    _id: `role-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockRoles.push(newRole);
  return newRole;
}

export async function updateRole(id: string, payload: Partial<Role>): Promise<Role> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockRoles.findIndex((r) => r._id === id);
  if (index === -1) throw new Error("Role not found");
  mockRoles[index] = { ...mockRoles[index], ...payload, updatedAt: new Date().toISOString() };
  return mockRoles[index];
}

export async function deleteRole(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockRoles.findIndex((r) => r._id === id);
  if (index === -1) throw new Error("Role not found");
  if (mockRoles[index].isSystem) throw new Error("Cannot delete system role");
  mockRoles.splice(index, 1);
}

// Integrations API
export async function fetchIntegrations(): Promise<Integration[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockIntegrations;
}

export async function updateIntegration(
  id: string,
  payload: Partial<Integration>
): Promise<Integration> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockIntegrations.findIndex((i) => i._id === id);
  if (index === -1) throw new Error("Integration not found");
  mockIntegrations[index] = { ...mockIntegrations[index], ...payload };
  return mockIntegrations[index];
}

export async function testIntegration(id: string): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const integration = mockIntegrations.find((i) => i._id === id);
  if (!integration) throw new Error("Integration not found");

  const success = Math.random() > 0.2; // 80% success rate
  integration.lastTestedAt = new Date().toISOString();
  integration.lastTestStatus = success ? "success" : "failed";

  return {
    success,
    message: success ? "Connection successful" : "Connection failed: Invalid credentials",
  };
}

// Billing API
export async function fetchBilling(): Promise<BillingInfo> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockBilling;
}

// Webhooks API
export async function fetchWebhooks(): Promise<Webhook[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockWebhooks;
}

export async function createWebhook(
  payload: Omit<Webhook, "_id" | "createdAt" | "updatedAt" | "deliveryLog">
): Promise<Webhook> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newWebhook: Webhook = {
    ...payload,
    _id: `webhook-${Date.now()}`,
    deliveryLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockWebhooks.push(newWebhook);
  return newWebhook;
}

export async function updateWebhook(id: string, payload: Partial<Webhook>): Promise<Webhook> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockWebhooks.findIndex((w) => w._id === id);
  if (index === -1) throw new Error("Webhook not found");
  mockWebhooks[index] = { ...mockWebhooks[index], ...payload, updatedAt: new Date().toISOString() };
  return mockWebhooks[index];
}

export async function deleteWebhook(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockWebhooks.findIndex((w) => w._id === id);
  if (index === -1) throw new Error("Webhook not found");
  mockWebhooks.splice(index, 1);
}

export async function testWebhook(id: string): Promise<{ success: boolean; response?: any }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const webhook = mockWebhooks.find((w) => w._id === id);
  if (!webhook) throw new Error("Webhook not found");

  const success = Math.random() > 0.3;
  const delivery = {
    _id: `delivery-${Date.now()}`,
    timestamp: new Date().toISOString(),
    event: webhook.events[0],
    statusCode: success ? 200 : 500,
    response: success ? "OK" : "Internal Server Error",
    success,
    attempts: 1,
  };

  webhook.deliveryLog.unshift(delivery);
  if (webhook.deliveryLog.length > 100) {
    webhook.deliveryLog = webhook.deliveryLog.slice(0, 100);
  }

  return { success, response: delivery };
}

// Email Templates API
export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockTemplates;
}

export async function updateEmailTemplate(
  id: string,
  payload: Partial<EmailTemplate>
): Promise<EmailTemplate> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const index = mockTemplates.findIndex((t) => t._id === id);
  if (index === -1) throw new Error("Template not found");
  mockTemplates[index] = {
    ...mockTemplates[index],
    ...payload,
    version: mockTemplates[index].version + 1,
    lastModified: new Date().toISOString(),
  };
  return mockTemplates[index];
}

export async function sendTestEmail(
  templateId: string,
  recipient: string
): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true };
}

// Audit Logs API
export async function fetchAuditLogs(filters?: SettingsFilters): Promise<AuditLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  let filtered = [...mockAuditLogs];

  if (filters?.actor) {
    filtered = filtered.filter((log) => log.actor.email.includes(filters.actor!));
  }

  if (filters?.action) {
    filtered = filtered.filter((log) => log.action === filters.action);
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(filters.dateFrom!));
  }

  if (filters?.dateTo) {
    filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(filters.dateTo!));
  }

  return filtered;
}

// Security API
export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSecurity;
}

export async function updateSecuritySettings(
  payload: Partial<SecuritySettings>
): Promise<SecuritySettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockSecurity = { ...mockSecurity, ...payload };
  return mockSecurity;
}

export async function fetchActiveSessions(): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return Array.from({ length: 5 }, (_, i) => ({
    _id: `session-${i + 1}`,
    userId: `user-${i}`,
    ipAddress: `192.168.1.${i + 1}`,
    userAgent: "Mozilla/5.0...",
    createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date(Date.now() - i * 10 * 60 * 1000).toISOString(),
  }));
}

export async function revokeSession(sessionId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Mock implementation
}

// Localization API
export async function fetchLocalization(): Promise<Localization> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockLocalization;
}

export async function updateLocalization(
  payload: Partial<Localization>
): Promise<Localization> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  mockLocalization = { ...mockLocalization, ...payload };
  return mockLocalization;
}

export async function uploadTranslations(
  locale: string,
  translations: Record<string, string>
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const localeIndex = mockLocalization.supportedLocales.findIndex((l) => l.code === locale);
  if (localeIndex !== -1) {
    mockLocalization.supportedLocales[localeIndex].translations = {
      ...mockLocalization.supportedLocales[localeIndex].translations,
      ...translations,
    };
    mockLocalization.supportedLocales[localeIndex].lastUpdated = new Date().toISOString();
  }
}

export async function exportTranslations(locale: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const localeData = mockLocalization.supportedLocales.find((l) => l.code === locale);
  if (!localeData) throw new Error("Locale not found");

  const csv = [
    ["key", "value"],
    ...Object.entries(localeData.translations).map(([key, value]) => [key, value]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  return csv;
}

// Appearance API
export async function fetchAppearance(): Promise<AppearanceSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    layout: "comfortable",
    theme: "light",
  };
}

export async function updateAppearance(
  payload: Partial<AppearanceSettings>
): Promise<AppearanceSettings> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { ...(await fetchAppearance()), ...payload };
}

