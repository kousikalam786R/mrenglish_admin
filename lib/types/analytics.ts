export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  platform?: "iOS" | "Android" | "Web" | "all";
  plan?: "Free" | "Paid" | "all";
  gender?: string;
}

export interface KPIs {
  newUsers: number;
  activeUsers: number;
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  conversionRate: number; // percentage
  mrr: number; // Monthly Recurring Revenue
  avgSessionLength: number; // minutes
  callsCount: number;
  aiInteractions: number;
  churnRate: number; // percentage
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface TrendData {
  metric: string;
  data: TrendDataPoint[];
}

export interface FunnelStep {
  step: string;
  count: number;
  percentage: number;
}

export interface CohortData {
  cohort: string; // e.g., "2024-01"
  size: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
    [key: string]: number;
  };
}

export interface HeatmapData {
  hour: number; // 0-23
  day: string; // day name or date
  value: number;
}

export interface TopUser {
  userId: string;
  userName: string;
  userEmail: string;
  interactions: number;
  lastInteractionDate: string;
}

export interface CountryStats {
  country: string;
  newUsers: number;
  activeRate: number; // percentage
}

export interface EngagementMetrics {
  avgConversationsPerUser: number;
  avgConversationLength: number; // minutes
  successfulCalls: number;
  failedCalls: number;
  avgWordsPerConversation: number;
}

export interface HourlyActivity {
  hour: number; // 0-23
  sessions: number;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  percentage: number;
}

