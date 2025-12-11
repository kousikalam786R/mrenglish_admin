export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";
export type ServiceName = "auth" | "api" | "worker" | "db" | "queue";
export type ErrorStatus = "Open" | "Ignored" | "Resolved";
export type JobStatus = "pending" | "running" | "failed" | "completed";
export type JobType = "email" | "sendPush" | "videoProcessing" | "export" | "backup";

export interface LogEntry {
  _id: string;
  timestamp: string;
  level: LogLevel;
  service: ServiceName;
  message: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

export interface ErrorAggregate {
  _id: string;
  signature: string;
  title: string;
  occurrenceCount: number;
  lastSeen: string;
  firstSeen: string;
  affectedUsers: number;
  status: ErrorStatus;
  affectedEndpoints: string[];
  sampleStack?: string;
}

export interface ErrorDetail extends ErrorAggregate {
  fullStack: string;
  sampleEvents: ErrorEvent[];
  tags: string[];
}

export interface ErrorEvent {
  _id: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
  endpoint?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
}

export interface MetricTimeSeries {
  metric: string;
  data: { timestamp: string; value: number }[];
}

export interface Alert {
  _id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  acknowledged: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface Job {
  _id: string;
  jobId: string;
  type: JobType;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  payload: Record<string, any>;
  error?: string;
  result?: any;
}

export interface TraceSpan {
  _id: string;
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  service: string;
  operation: string;
  startTime: string;
  duration: number; // milliseconds
  tags?: Record<string, any>;
  logs?: Array<{ timestamp: string; message: string }>;
}

export interface Trace {
  _id: string;
  traceId: string;
  requestId: string;
  startTime: string;
  duration: number;
  spans: TraceSpan[];
  rootSpan?: TraceSpan;
}

export interface DeveloperOverview {
  recentErrors: number;
  queueSize: number;
  uptime: number; // seconds
  errorRate: number; // percentage
  recentDeploy?: string;
  recentTag?: string;
}

export interface DeveloperFilters {
  level?: LogLevel | "all";
  service?: ServiceName | "all";
  status?: ErrorStatus | "all";
  jobStatus?: JobStatus | "all";
  jobType?: JobType | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  timeframe?: "1h" | "6h" | "24h" | "7d";
}

