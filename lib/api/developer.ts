import {
  DeveloperOverview,
  LogEntry,
  ErrorAggregate,
  ErrorDetail,
  MetricTimeSeries,
  Job,
  Trace,
  DeveloperFilters,
  LogLevel,
  ServiceName,
  ErrorStatus,
  JobStatus,
  JobType,
} from "@/lib/types/developer";

// Mock data generators
const generateMockLogs = (count: number = 50): LogEntry[] => {
  const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];
  const services: ServiceName[] = ["auth", "api", "worker", "db", "queue"];

  return Array.from({ length: count }, (_, i) => {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const requestId = `req-${Math.random().toString(36).substr(2, 9)}`;

    return {
      _id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      level,
      service,
      message: `Log message ${i + 1} from ${service} service`,
      requestId: i % 3 === 0 ? requestId : undefined,
      userId: i % 5 === 0 ? `user-${i}` : undefined,
      metadata: {
        method: i % 2 === 0 ? "GET" : "POST",
        path: `/api/${service}/endpoint`,
      },
      stack: level === "ERROR" ? `Error stack trace ${i + 1}\n  at function (file.js:123)\n  at handler (file.js:456)` : undefined,
    };
  });
};

const generateMockErrors = (): ErrorAggregate[] => {
  return Array.from({ length: 15 }, (_, i) => ({
    _id: `error-${i + 1}`,
    signature: `ErrorSignature${i + 1}`,
    title: `Error ${i + 1}: ${["TypeError", "ReferenceError", "NetworkError", "ValidationError"][i % 4]}`,
    occurrenceCount: Math.floor(Math.random() * 1000) + 10,
    lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    affectedUsers: Math.floor(Math.random() * 100) + 1,
    status: (["Open", "Ignored", "Resolved"] as ErrorStatus[])[i % 3],
    affectedEndpoints: [`/api/endpoint${i + 1}`, `/api/endpoint${i + 2}`],
    sampleStack: `Error: ${["TypeError", "ReferenceError"][i % 2]}\n  at function (file.js:${100 + i})\n  at handler (file.js:${200 + i})`,
  }));
};

const generateMockJobs = (): Job[] => {
  const types: JobType[] = ["email", "sendPush", "videoProcessing", "export", "backup"];
  const statuses: JobStatus[] = ["pending", "running", "failed", "completed"];

  return Array.from({ length: 30 }, (_, i) => ({
    _id: `job-${i + 1}`,
    jobId: `JOB-${String(i + 1).padStart(6, "0")}`,
    type: types[i % types.length],
    status: statuses[i % statuses.length],
    attempts: Math.floor(Math.random() * 3) + 1,
    maxAttempts: 3,
    enqueuedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: i % 2 === 0 ? new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString() : undefined,
    finishedAt: i % 3 === 0 ? new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString() : undefined,
    payload: {
      userId: `user-${i}`,
      data: `Payload data for job ${i + 1}`,
    },
    error: i % 4 === 0 ? `Error message for job ${i + 1}` : undefined,
    result: i % 3 === 0 ? { success: true, processed: i + 1 } : undefined,
  }));
};

let mockLogs = generateMockLogs(100);
let mockErrors = generateMockErrors();
let mockJobs = generateMockJobs();

// Overview API
export async function fetchOverview(): Promise<DeveloperOverview> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    recentErrors: mockErrors.filter((e) => e.status === "Open").length,
    queueSize: mockJobs.filter((j) => j.status === "pending").length,
    uptime: Math.floor(Math.random() * 86400) + 3600, // 1h to 24h in seconds
    errorRate: Math.random() * 5 + 0.5, // 0.5% to 5.5%
    recentDeploy: "v1.2.3",
    recentTag: "production-2024-01-15",
  };
}

// Logs API
export async function fetchLogs(
  filters?: DeveloperFilters,
  cursor?: string | null
): Promise<{ items: LogEntry[]; cursor: string | null }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockLogs];

  if (filters?.level && filters.level !== "all") {
    filtered = filtered.filter((l) => l.level === filters.level);
  }

  if (filters?.service && filters.service !== "all") {
    filtered = filtered.filter((l) => l.service === filters.service);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.message.toLowerCase().includes(searchLower) ||
        l.requestId?.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter(
      (l) => new Date(l.timestamp) >= new Date(filters.dateFrom!)
    );
  }

  if (filters?.dateTo) {
    filtered = filtered.filter(
      (l) => new Date(l.timestamp) <= new Date(filters.dateTo!)
    );
  }

  // Pagination with cursor
  const pageSize = 20;
  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);
  const nextCursor = endIndex < filtered.length ? String(endIndex) : null;

  return {
    items: paginated,
    cursor: nextCursor,
  };
}

export async function tailLogs(enable: boolean): Promise<LogEntry[]> {
  if (!enable) {
    return [];
  }

  // Simulate new logs being appended
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newLogs = generateMockLogs(5);
  mockLogs = [...newLogs, ...mockLogs];
  return newLogs;
}

// Errors API
export async function fetchErrorAggregates(
  filters?: DeveloperFilters
): Promise<ErrorAggregate[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockErrors];

  if (filters?.status && filters.status !== "all") {
    filtered = filtered.filter((e) => e.status === filters.status);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.signature.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

export async function fetchErrorById(id: string): Promise<ErrorDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const error = mockErrors.find((e) => e._id === id);
  if (!error) throw new Error("Error not found");

  const detail: ErrorDetail = {
    ...error,
    fullStack: `Full stack trace for ${error.title}\n  at function1 (file1.js:123)\n  at function2 (file2.js:456)\n  at handler (handler.js:789)\n  at middleware (middleware.js:321)`,
    sampleEvents: Array.from({ length: 5 }, (_, i) => ({
      _id: `event-${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      userId: `user-${i}`,
      requestId: `req-${i}`,
      endpoint: error.affectedEndpoints[0],
      userAgent: "Mozilla/5.0...",
      metadata: { ip: "192.168.1.1", method: "POST" },
    })),
    tags: ["api", "critical", "user-facing"],
  };

  return detail;
}

export async function markErrorResolved(
  id: string,
  status: ErrorStatus
): Promise<ErrorAggregate> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockErrors.findIndex((e) => e._id === id);
  if (index === -1) throw new Error("Error not found");

  mockErrors[index] = { ...mockErrors[index], status };
  return mockErrors[index];
}

// Metrics API
export async function fetchMetrics(
  filters?: DeveloperFilters
): Promise<Record<string, MetricTimeSeries>> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const timeframe = filters?.timeframe || "24h";
  const hours = timeframe === "1h" ? 1 : timeframe === "6h" ? 6 : timeframe === "24h" ? 24 : 168;
  const points = hours;

  const generateTimeSeries = (baseValue: number, variance: number) => {
    const data = [];
    for (let i = points - 1; i >= 0; i--) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      data.push({
        timestamp: date.toISOString(),
        value: baseValue + Math.random() * variance,
      });
    }
    return data;
  };

  return {
    rps: {
      metric: "requests_per_second",
      data: generateTimeSeries(100, 50),
    },
    errorRate: {
      metric: "error_rate",
      data: generateTimeSeries(2, 1),
    },
    cpu: {
      metric: "cpu_usage",
      data: generateTimeSeries(40, 20),
    },
    memory: {
      metric: "memory_usage",
      data: generateTimeSeries(60, 15),
    },
    dbConnections: {
      metric: "db_connections",
      data: generateTimeSeries(50, 20),
    },
    queueLength: {
      metric: "queue_length",
      data: generateTimeSeries(10, 5),
    },
  };
}

// Jobs API
export async function fetchJobs(filters?: DeveloperFilters): Promise<Job[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...mockJobs];

  if (filters?.jobStatus && filters.jobStatus !== "all") {
    filtered = filtered.filter((j) => j.status === filters.jobStatus);
  }

  if (filters?.jobType && filters.jobType !== "all") {
    filtered = filtered.filter((j) => j.type === filters.jobType);
  }

  return filtered;
}

export async function retryJob(jobId: string): Promise<Job> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockJobs.findIndex((j) => j.jobId === jobId);
  if (index === -1) throw new Error("Job not found");

  mockJobs[index] = {
    ...mockJobs[index],
    status: "pending",
    attempts: 0,
    error: undefined,
  };

  return mockJobs[index];
}

export async function cancelJob(jobId: string): Promise<Job> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockJobs.findIndex((j) => j.jobId === jobId);
  if (index === -1) throw new Error("Job not found");

  mockJobs[index] = {
    ...mockJobs[index],
    status: "failed",
    error: "Cancelled by user",
  };

  return mockJobs[index];
}

export async function requeueJob(jobId: string): Promise<Job> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockJobs.findIndex((j) => j.jobId === jobId);
  if (index === -1) throw new Error("Job not found");

  mockJobs[index] = {
    ...mockJobs[index],
    status: "pending",
    enqueuedAt: new Date().toISOString(),
  };

  return mockJobs[index];
}

// Traces API
export async function fetchTraceByRequestId(requestId: string): Promise<Trace> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const traceId = `trace-${requestId}`;
  const startTime = new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString();

  const spans: Trace["spans"] = [
    {
      _id: "span-1",
      spanId: "span-1",
      traceId,
      service: "api",
      operation: "HTTP GET /api/users",
      startTime,
      duration: 150,
      tags: { method: "GET", path: "/api/users" },
    },
    {
      _id: "span-2",
      spanId: "span-2",
      traceId,
      parentSpanId: "span-1",
      service: "db",
      operation: "SELECT users",
      startTime: new Date(new Date(startTime).getTime() + 10).toISOString(),
      duration: 80,
      tags: { query: "SELECT * FROM users" },
    },
    {
      _id: "span-3",
      spanId: "span-3",
      traceId,
      parentSpanId: "span-1",
      service: "cache",
      operation: "GET cache",
      startTime: new Date(new Date(startTime).getTime() + 100).toISOString(),
      duration: 5,
    },
  ];

  return {
    _id: traceId,
    traceId,
    requestId,
    startTime,
    duration: 150,
    spans,
    rootSpan: spans[0],
  };
}

