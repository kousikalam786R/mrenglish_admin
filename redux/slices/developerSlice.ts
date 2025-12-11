import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DeveloperOverview,
  LogEntry,
  ErrorAggregate,
  ErrorDetail,
  MetricTimeSeries,
  Job,
  Trace,
  DeveloperFilters,
} from "@/lib/types/developer";

interface DeveloperState {
  overview: DeveloperOverview | null;
  logs: {
    items: LogEntry[];
    cursor: string | null;
    tail: boolean;
  };
  errors: {
    list: ErrorAggregate[];
    selected: ErrorDetail | null;
  };
  metrics: Record<string, MetricTimeSeries>;
  jobs: Job[];
  traces: Record<string, Trace>;
  loading: boolean;
  filters: DeveloperFilters;
}

const initialState: DeveloperState = {
  overview: null,
  logs: {
    items: [],
    cursor: null,
    tail: false,
  },
  errors: {
    list: [],
    selected: null,
  },
  metrics: {},
  jobs: [],
  traces: {},
  loading: false,
  filters: {
    timeframe: "24h",
  },
};

const developerSlice = createSlice({
  name: "developer",
  initialState,
  reducers: {
    setOverview: (state, action: PayloadAction<DeveloperOverview>) => {
      state.overview = action.payload;
    },
    appendLogs: (state, action: PayloadAction<LogEntry[]>) => {
      state.logs.items = [...state.logs.items, ...action.payload];
    },
    setLogs: (state, action: PayloadAction<{ items: LogEntry[]; cursor: string | null }>) => {
      state.logs.items = action.payload.items;
      state.logs.cursor = action.payload.cursor;
    },
    setTail: (state, action: PayloadAction<boolean>) => {
      state.logs.tail = action.payload;
    },
    setErrors: (state, action: PayloadAction<ErrorAggregate[]>) => {
      state.errors.list = action.payload;
    },
    setErrorDetail: (state, action: PayloadAction<ErrorDetail | null>) => {
      state.errors.selected = action.payload;
    },
    setMetrics: (state, action: PayloadAction<Record<string, MetricTimeSeries>>) => {
      state.metrics = action.payload;
    },
    setJobs: (state, action: PayloadAction<Job[]>) => {
      state.jobs = action.payload;
    },
    updateJob: (state, action: PayloadAction<Job>) => {
      const index = state.jobs.findIndex((j) => j._id === action.payload._id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
    },
    setTrace: (state, action: PayloadAction<Trace>) => {
      state.traces[action.payload.traceId] = action.payload;
    },
    setFilters: (state, action: PayloadAction<DeveloperFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        timeframe: "24h",
      };
    },
  },
});

export const {
  setOverview,
  appendLogs,
  setLogs,
  setTail,
  setErrors,
  setErrorDetail,
  setMetrics,
  setJobs,
  updateJob,
  setTrace,
  setFilters,
  setLoading,
  resetFilters,
} = developerSlice.actions;

export default developerSlice.reducer;

