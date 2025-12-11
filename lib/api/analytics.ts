import {
  KPIs,
  TrendData,
  TrendDataPoint,
  FunnelStep,
  CohortData,
  HeatmapData,
  TopUser,
  AnalyticsFilters,
  CountryStats,
  EngagementMetrics,
  HourlyActivity,
  FeatureUsage,
} from "@/lib/types/analytics";

// Generate mock date range data
const generateDateRange = (days: number): string[] => {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }
  return dates;
};

export async function fetchKPIs(filters: AnalyticsFilters): Promise<KPIs> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = filters.dateFrom && filters.dateTo
    ? Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  return {
    newUsers: Math.floor(Math.random() * 500) + 100,
    activeUsers: Math.floor(Math.random() * 2000) + 500,
    dau: Math.floor(Math.random() * 1000) + 200,
    mau: Math.floor(Math.random() * 5000) + 2000,
    conversionRate: Math.random() * 10 + 5, // 5-15%
    mrr: Math.floor(Math.random() * 50000) + 10000,
    avgSessionLength: Math.random() * 20 + 10, // 10-30 minutes
    callsCount: Math.floor(Math.random() * 1000) + 500,
    aiInteractions: Math.floor(Math.random() * 5000) + 2000,
    churnRate: Math.random() * 5 + 2, // 2-7%
  };
}

export async function fetchTrends(
  metric: string,
  filters: AnalyticsFilters
): Promise<TrendData> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = filters.dateFrom && filters.dateTo
    ? Math.ceil((new Date(filters.dateTo).getTime() - new Date(filters.dateFrom).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const dates = generateDateRange(days);
  const baseValue = metric === "newUsers" ? 50 : metric === "activeUsers" ? 200 : 10;

  const data: TrendDataPoint[] = dates.map((date) => ({
    date,
    value: Math.floor(Math.random() * baseValue * 0.5) + baseValue * 0.75,
  }));

  return {
    metric,
    data,
  };
}

export async function fetchFunnel(filters: AnalyticsFilters): Promise<FunnelStep[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const steps = [
    { step: "Install", count: 10000 },
    { step: "Signup", count: 8000 },
    { step: "First Lesson", count: 6000 },
    { step: "First Paid", count: 1500 },
  ];

  const total = steps[0].count;
  return steps.map((step) => ({
    ...step,
    percentage: (step.count / total) * 100,
  }));
}

export async function fetchCohort(
  cohortOptions: { period: "week" | "month" }
): Promise<CohortData[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const cohorts: CohortData[] = [];
  const periods = cohortOptions.period === "week" ? 12 : 6;

  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date();
    if (cohortOptions.period === "week") {
      date.setDate(date.getDate() - i * 7);
    } else {
      date.setMonth(date.getMonth() - i);
    }
    const cohortKey = cohortOptions.period === "week"
      ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    cohorts.push({
      cohort: cohortKey,
      size: Math.floor(Math.random() * 500) + 100,
      retention: {
        day1: Math.random() * 20 + 40, // 40-60%
        day7: Math.random() * 15 + 25, // 25-40%
        day30: Math.random() * 10 + 10, // 10-20%
      },
    });
  }

  return cohorts;
}

export async function fetchHeatmap(filters: AnalyticsFilters): Promise<HeatmapData[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data: HeatmapData[] = [];

  days.forEach((day) => {
    hours.forEach((hour) => {
      // Simulate higher activity during business hours
      const baseValue = hour >= 9 && hour <= 17 ? 50 : 20;
      data.push({
        hour,
        day,
        value: Math.floor(Math.random() * baseValue) + 10,
      });
    });
  });

  return data;
}

export async function fetchTopUsers(filters: AnalyticsFilters): Promise<TopUser[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Array.from({ length: 20 }, (_, i) => ({
    userId: `user-${i + 1}`,
    userName: `User ${i + 1}`,
    userEmail: `user${i + 1}@example.com`,
    interactions: Math.floor(Math.random() * 500) + 100,
    lastInteractionDate: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
  }));
}

export async function fetchCountryStats(filters: AnalyticsFilters): Promise<CountryStats[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const countries = ["USA", "UK", "Canada", "Australia", "India", "Germany", "France", "Japan", "Brazil", "Mexico"];

  return countries.map((country) => ({
    country,
    newUsers: Math.floor(Math.random() * 500) + 50,
    activeRate: Math.random() * 30 + 50, // 50-80%
  })).sort((a, b) => b.newUsers - a.newUsers);
}

export async function fetchEngagementMetrics(filters: AnalyticsFilters): Promise<EngagementMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    avgConversationsPerUser: Math.random() * 5 + 3, // 3-8
    avgConversationLength: Math.random() * 10 + 5, // 5-15 minutes
    successfulCalls: Math.floor(Math.random() * 1000) + 500,
    failedCalls: Math.floor(Math.random() * 100) + 20,
    avgWordsPerConversation: Math.floor(Math.random() * 200) + 100,
  };
}

export async function fetchHourlyActivity(filters: AnalyticsFilters): Promise<HourlyActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sessions: Math.floor(Math.random() * 200) + (hour >= 9 && hour <= 17 ? 100 : 30),
  }));
}

export async function fetchFeatureUsage(filters: AnalyticsFilters): Promise<FeatureUsage[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const features = [
    { feature: "Speaking", usage: 5000 },
    { feature: "Quizzes", usage: 3000 },
    { feature: "Vocabulary", usage: 2500 },
    { feature: "Mock Interviews", usage: 1500 },
  ];

  const total = features.reduce((sum, f) => sum + f.usage, 0);

  return features.map((f) => ({
    ...f,
    percentage: (f.usage / total) * 100,
  }));
}

