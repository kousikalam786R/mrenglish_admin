import {
  Campaign,
  Template,
  Segment,
  ABTest,
  CampaignMetrics,
  ScheduledCampaign,
  MarketingFilters,
  PushNotification,
  Banner,
  SegmentFilter,
} from "@/lib/types/marketing";

// Mock data generators
const generateMockCampaigns = (): Campaign[] => {
  const types: Campaign["type"][] = ["Push", "Email", "In-App Banner"];
  const statuses: Campaign["status"][] = ["Draft", "Scheduled", "Running", "Paused", "Completed"];

  return Array.from({ length: 20 }, (_, i) => ({
    _id: `campaign-${i + 1}`,
    campaignId: `CAMP-${String(i + 1).padStart(4, "0")}`,
    name: `Campaign ${i + 1}`,
    type: types[i % types.length],
    templateId: `template-${i + 1}`,
    templateName: `Template ${i + 1}`,
    segmentId: `segment-${i % 3}`,
    segmentName: ["Active Users", "Paid Users", "Inactive Users"][i % 3],
    startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    scheduledAt: i % 3 === 0 ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
    status: statuses[i % statuses.length],
    metrics: {
      sent: Math.floor(Math.random() * 10000) + 1000,
      delivered: Math.floor(Math.random() * 9000) + 900,
      opened: Math.floor(Math.random() * 3000) + 200,
      clicked: Math.floor(Math.random() * 500) + 50,
      conversions: Math.floor(Math.random() * 100) + 10,
    },
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: "admin@mre.com",
  }));
};

const generateMockTemplates = (): Template[] => {
  const types: Template["type"][] = ["Push", "Email", "In-App"];

  return Array.from({ length: 15 }, (_, i) => ({
    _id: `template-${i + 1}`,
    name: `Template ${i + 1}`,
    type: types[i % types.length],
    category: ["Welcome", "Promotion", "Reminder", "Update"][i % 4],
    subject: i % types.length === 1 ? `Email Subject ${i + 1}` : undefined,
    content: `Template content ${i + 1} with {{first_name}} and {{plan}} placeholders`,
    placeholders: ["{{first_name}}", "{{plan}}", "{{lesson_count}}"],
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

const generateMockSegments = (): Segment[] => {
  const predefined = [
    {
      name: "Active Users",
      description: "Users active in last 7 days",
      filters: [{ field: "lastActive", operator: "greater_than", value: 7 }],
    },
    {
      name: "Inactive 7d",
      description: "Users inactive for 7+ days",
      filters: [{ field: "lastActive", operator: "less_than", value: 7 }],
    },
    {
      name: "Paid Users",
      description: "Users with active paid subscription",
      filters: [{ field: "plan", operator: "equals", value: "paid" }],
    },
    {
      name: "Trial Users",
      description: "Users on trial period",
      filters: [{ field: "plan", operator: "equals", value: "trial" }],
    },
  ];

  return [
    ...predefined.map((seg, i) => ({
      _id: `segment-predefined-${i + 1}`,
      ...seg,
      isPredefined: true,
      userCount: Math.floor(Math.random() * 5000) + 1000,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      _id: `segment-custom-${i + 1}`,
      name: `Custom Segment ${i + 1}`,
      description: `Custom segment ${i + 1}`,
      isPredefined: false,
      filters: [
        { field: "country", operator: "in", value: ["USA", "UK"] },
        { field: "plan", operator: "equals", value: "paid" },
      ],
      userCount: Math.floor(Math.random() * 2000) + 100,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  ];
};

let mockCampaigns = generateMockCampaigns();
let mockTemplates = generateMockTemplates();
let mockSegments = generateMockSegments();

// Campaigns API
export async function fetchCampaigns(filters?: MarketingFilters): Promise<Campaign[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockCampaigns];

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.campaignId.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.type && filters.type !== "all") {
    filtered = filtered.filter((c) => c.type === filters.type);
  }

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((c) => c.status === filters.status);
  }

  return filtered;
}

export async function createCampaign(
  payload: Omit<Campaign, "_id" | "campaignId" | "createdAt" | "updatedAt" | "metrics">
): Promise<Campaign> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newCampaign: Campaign = {
    ...payload,
    _id: `campaign-${Date.now()}`,
    campaignId: `CAMP-${String(mockCampaigns.length + 1).padStart(4, "0")}`,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      conversions: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockCampaigns.unshift(newCampaign);
  return newCampaign;
}

export async function updateCampaign(
  id: string,
  data: Partial<Campaign>
): Promise<Campaign> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockCampaigns.findIndex((c) => c._id === id);
  if (index === -1) throw new Error("Campaign not found");

  const updated = {
    ...mockCampaigns[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  mockCampaigns[index] = updated;
  return updated;
}

export async function fetchCampaignById(id: string): Promise<Campaign> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const campaign = mockCampaigns.find((c) => c._id === id);
  if (!campaign) throw new Error("Campaign not found");

  return campaign;
}

// Push Notifications API
export async function sendPush(
  payload: PushNotification
): Promise<{ success: boolean; jobId: string; messageId?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    jobId: `job-${Date.now()}`,
    messageId: `msg-${Date.now()}`,
  };
}

// Templates API
export async function fetchTemplates(): Promise<Template[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockTemplates;
}

export async function createTemplate(
  template: Omit<Template, "_id" | "createdAt" | "updatedAt">
): Promise<Template> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newTemplate: Template = {
    ...template,
    _id: `template-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockTemplates.unshift(newTemplate);
  return newTemplate;
}

// Segments API
export async function fetchSegments(): Promise<Segment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockSegments;
}

export async function createSegment(
  payload: Omit<Segment, "_id" | "createdAt" | "updatedAt" | "userCount">
): Promise<Segment> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newSegment: Segment = {
    ...payload,
    _id: `segment-${Date.now()}`,
    userCount: Math.floor(Math.random() * 2000) + 100, // Mock count
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockSegments.push(newSegment);
  return newSegment;
}

// A/B Tests API
export async function fetchABTests(): Promise<ABTest[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Array.from({ length: 5 }, (_, i) => ({
    _id: `abtest-${i + 1}`,
    name: `A/B Test ${i + 1}`,
    campaignId: `campaign-${i + 1}`,
    variantA: {
      templateId: `template-a-${i + 1}`,
      templateName: `Variant A ${i + 1}`,
      percentage: 50,
    },
    variantB: {
      templateId: `template-b-${i + 1}`,
      templateName: `Variant B ${i + 1}`,
      percentage: 50,
    },
    metric: (["open", "click", "conversion"] as ABTest["metric"][])[i % 3],
    status: (["Draft", "Running", "Completed"] as ABTest["status"][])[i % 3],
    startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: i % 3 === 2 ? new Date().toISOString() : undefined,
    results:
      i % 3 === 2
        ? {
            variantA: {
              sent: 1000,
              metricValue: 250,
              percentage: 25,
            },
            variantB: {
              sent: 1000,
              metricValue: 300,
              percentage: 30,
            },
            winner: "B",
            confidence: 95,
          }
        : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function createABTest(
  payload: Omit<ABTest, "_id" | "createdAt" | "updatedAt" | "results">
): Promise<ABTest> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newTest: ABTest = {
    ...payload,
    _id: `abtest-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newTest;
}

// Campaign Metrics API
export async function fetchCampaignMetrics(id: string): Promise<CampaignMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const campaign = mockCampaigns.find((c) => c._id === id);
  if (!campaign) throw new Error("Campaign not found");

  const metrics = campaign.metrics;
  const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
  const clickRate = metrics.sent > 0 ? (metrics.clicked / metrics.sent) * 100 : 0;
  const conversionRate = metrics.sent > 0 ? (metrics.conversions / metrics.sent) * 100 : 0;

  // Generate timeline data
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split("T")[0],
      sent: Math.floor(Math.random() * 500) + 100,
      opened: Math.floor(Math.random() * 200) + 50,
      clicked: Math.floor(Math.random() * 50) + 10,
    };
  });

  return {
    campaignId: campaign.campaignId,
    sent: metrics.sent,
    delivered: metrics.delivered,
    opened: metrics.opened,
    clicked: metrics.clicked,
    conversions: metrics.conversions,
    openRate,
    clickRate,
    conversionRate,
    timeline,
  };
}

// Banners API
export async function fetchBanners(): Promise<Banner[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return Array.from({ length: 10 }, (_, i) => ({
    _id: `banner-${i + 1}`,
    name: `Banner ${i + 1}`,
    content: `<div>Banner content ${i + 1}</div>`,
    ctaText: "Learn More",
    ctaLink: "/lessons",
    targetSegment: `segment-${i % 3}`,
    targetPages: [["home"], ["home", "lesson"], ["profile"]][i % 3],
    startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: i % 2 === 0,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function createBanner(
  banner: Omit<Banner, "_id" | "createdAt" | "updatedAt">
): Promise<Banner> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newBanner: Banner = {
    ...banner,
    _id: `banner-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newBanner;
}

// Scheduled Campaigns API
export async function fetchScheduledCampaigns(): Promise<ScheduledCampaign[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockCampaigns
    .filter((c) => c.scheduledAt && c.status === "Scheduled")
    .map((c) => ({
      _id: c._id,
      campaignId: c.campaignId,
      campaignName: c.name,
      scheduledAt: c.scheduledAt!,
      status: "scheduled" as const,
    }));
}

// Export Campaign Recipients
export async function exportCampaignRecipients(id: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Mock CSV data
  const headers = ["Email", "Name", "Status", "Opened", "Clicked"];
  const rows = Array.from({ length: 100 }, (_, i) => [
    `user${i + 1}@example.com`,
    `User ${i + 1}`,
    "sent",
    i % 3 === 0 ? "yes" : "no",
    i % 5 === 0 ? "yes" : "no",
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csv;
}

