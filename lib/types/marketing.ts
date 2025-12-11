export type CampaignType = "Push" | "Email" | "In-App Banner";
export type CampaignStatus = "Draft" | "Scheduled" | "Running" | "Paused" | "Completed";
export type TemplateType = "Push" | "Email" | "In-App";
export type ABTestStatus = "Draft" | "Running" | "Completed";
export type ABTestMetric = "open" | "click" | "conversion";

export interface Campaign {
  _id: string;
  campaignId: string;
  name: string;
  type: CampaignType;
  templateId?: string;
  templateName?: string;
  segmentId: string;
  segmentName: string;
  startDate?: string;
  endDate?: string;
  scheduledAt?: string;
  status: CampaignStatus;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    conversions: number;
  };
  abTestId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PushNotification {
  title: string;
  message: string;
  deepLink?: string;
  imageUrl?: string;
  segmentId?: string;
  scheduledAt?: string;
  sentAt?: string;
}

export interface Banner {
  _id: string;
  name: string;
  content: string; // HTML content
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  targetSegment?: string;
  targetPages: string[]; // ["home", "lesson", "profile"]
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  _id: string;
  name: string;
  type: TemplateType;
  category?: string;
  subject?: string; // For email
  content: string;
  placeholders: string[]; // e.g., ["{{first_name}}", "{{plan}}"]
  preview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  _id: string;
  name: string;
  description?: string;
  isPredefined: boolean;
  filters: SegmentFilter[];
  userCount: number; // Mock count
  createdAt: string;
  updatedAt: string;
}

export interface SegmentFilter {
  field: string; // "country", "lastActive", "plan", etc.
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
}

export interface ABTest {
  _id: string;
  name: string;
  campaignId: string;
  variantA: {
    templateId: string;
    templateName: string;
    percentage: number;
  };
  variantB: {
    templateId: string;
    templateName: string;
    percentage: number;
  };
  metric: ABTestMetric;
  status: ABTestStatus;
  startDate?: string;
  endDate?: string;
  results?: {
    variantA: {
      sent: number;
      metricValue: number;
      percentage: number;
    };
    variantB: {
      sent: number;
      metricValue: number;
      percentage: number;
    };
    winner?: "A" | "B";
    confidence: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetrics {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  timeline: {
    date: string;
    sent: number;
    opened: number;
    clicked: number;
  }[];
}

export interface ScheduledCampaign {
  _id: string;
  campaignId: string;
  campaignName: string;
  scheduledAt: string;
  status: "scheduled" | "paused" | "completed";
}

export interface MarketingFilters {
  type?: CampaignType | "all";
  status?: CampaignStatus | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

