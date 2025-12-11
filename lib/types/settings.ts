export type Environment = "DEV" | "STAGING" | "PROD";
export type WebhookStatus = "Active" | "Paused";
export type WebhookEvent =
  | "subscription.created"
  | "subscription.updated"
  | "ticket.created"
  | "ticket.updated"
  | "user.created"
  | "user.updated"
  | "payment.completed"
  | "payment.failed";

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  primaryContactEmail: string;
  supportEmail: string;
  defaultTimezone: string;
  defaultCurrency: string;
  legalAddress: string;
  phone: string;
  environment: Environment;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  userCount?: number;
}

export interface Integration {
  _id: string;
  name: string;
  type: "firebase" | "stripe" | "razorpay" | "sendgrid" | "sentry" | "google_analytics" | "webhook";
  enabled: boolean;
  config: Record<string, any>;
  lastTestedAt?: string;
  lastTestStatus?: "success" | "failed";
  notes?: string;
}

export interface BillingInfo {
  plan: string;
  nextChargeDate?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    brand?: string;
  };
  billingContact: string;
  invoices: Invoice[];
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed";
  downloadUrl?: string;
}

export interface Webhook {
  _id: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  deliveryLog: WebhookDelivery[];
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  _id: string;
  timestamp: string;
  event: WebhookEvent;
  statusCode?: number;
  response?: string;
  success: boolean;
  attempts: number;
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  layout: "compact" | "comfortable";
  theme: "light" | "dark" | "auto";
}

export interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
  lastModified: string;
  modifiedBy: string;
  version: number;
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  action: string;
  target: {
    type: string;
    id: string;
    name?: string;
  };
  details: string;
  ipAddress?: string;
}

export interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  twoFactorEnabled: boolean;
  sessionTimeout: number; // minutes
  ipAllowlist: string[];
  sso: {
    enabled: boolean;
    provider: "saml" | "oauth" | null;
    config?: Record<string, any>;
  };
}

export interface ActiveSession {
  _id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastActivity: string;
}

export interface Localization {
  defaultLocale: string;
  supportedLocales: Locale[];
}

export interface Locale {
  code: string;
  name: string;
  translations: Record<string, string>;
  coverage: number; // percentage
  lastUpdated: string;
}

export interface SettingsFilters {
  actor?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

